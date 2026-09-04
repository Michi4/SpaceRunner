const express = require('express');
const http = require('http');
const {
  MAX_ROOMS,
  MAX_PLAYERS_PER_ROOM,
  sanitizeName,
  sanitizeUsername,
  sanitizeSeed,
  sanitizeMode,
} = require('./validation');

const app = express();
const server = http.createServer(app);

// Only the public site origin may open a socket. Behind nginx/Traefik the
// page is served from the same origin, so no wide-open CORS is needed.
const ALLOWED_ORIGIN = process.env.CORS_ORIGIN || 'https://spacerunner.websters.at';
const io = require('socket.io')(server, {
  cors: {
    origin: [ALLOWED_ORIGIN, 'https://www.spacerunner.websters.at'],
    methods: ['GET', 'POST'],
  },
  // Cap inbound payload size (position packets are tiny)
  maxHttpBufferSize: 1e5, // 100 KB
});
const port = 3000;

app.use(express.static('public'));

// ── Limits & validation (see validation.js – unit-tested) ─────────────
const MAX_NAME_LEN = 20;
// Max 40 position packets/sec per socket (game sends ~30)
const MOVE_MIN_INTERVAL_MS = 25;
const lastMoveAt = new Map(); // socket.id -> timestamp

let rooms = Object.create(null); // null-prototype: immune to __proto__ pollution

// Public, minimal room listing (no socket ids, no seeds)
function publicRooms() {
  const out = Object.create(null);
  for (const name of Object.keys(rooms)) {
    const r = rooms[name];
    out[name] = {
      players: r.players.length,
      inGame: !!r.inGame,
      mode: r.mode || 'normal',
    };
  }
  return out;
}

// Helper: Broadcast room list to all sockets
function broadcastRooms() {
  io.emit('rooms-update', publicRooms());
}

// Strip internal socket ids from player lists sent to the lobby;
// the game itself still needs ids, so callers choose explicitly.
function lobbyPlayers(room) {
  return room.players.map((p) => ({ username: p.username }));
}

io.on('connection', (socket) => {
  // Retrieve current active rooms
  socket.on('get-rooms', () => {
    socket.emit('rooms-update', publicRooms());
  });

  // Create Room
  socket.on('create-room', (roomName, username) => {
    const name = sanitizeName(roomName);
    const user = sanitizeUsername(username);
    if (!name || !user) return;
    if (rooms[name]) return;
    if (Object.keys(rooms).length >= MAX_ROOMS) return;

    rooms[name] = {
      host: socket.id,
      players: [{ id: socket.id, username: user }],
      inGame: false,
      mode: 'normal',
      seed: null,
    };

    socket.join(name);
    socket.emit('room-joined', name, rooms[name].players, rooms[name].host);
    broadcastRooms();
  });

  // Join Room
  socket.on('join-room', (roomName, username) => {
    const name = typeof roomName === 'string' ? roomName.slice(0, MAX_NAME_LEN) : '';
    const user = sanitizeUsername(username);
    const room = rooms[name];
    if (!name || !user || !room) return;
    if (room.players.length >= MAX_PLAYERS_PER_ROOM) return;
    // Reconnecting socket already in room: just re-sync
    const existing = room.players.find((p) => p.id === socket.id);
    if (!existing) {
      // No impersonation: a username already in the room can't join twice
      if (room.players.some((p) => p.username === user)) return;
      room.players.push({ id: socket.id, username: user });
    }
    socket.join(name);

    if (room.inGame) {
      socket.emit('game-starting', name, room.mode || 'normal', room.seed || null);
    } else {
      socket.emit('room-joined', name, room.players, room.host);
    }

    // Notify room members
    io.to(name).emit('room-sync', room.players, room.host);
    broadcastRooms();
  });

  // Leave Room
  socket.on('leave-room', (roomName) => {
    const name = typeof roomName === 'string' ? roomName.slice(0, MAX_NAME_LEN) : '';
    if (!name || !rooms[name]) return;
    handleRoomDeparture(socket, name);
  });

  // Game Start (host only)
  socket.on('start-game', (roomName, mode, seed) => {
    const name = typeof roomName === 'string' ? roomName.slice(0, MAX_NAME_LEN) : '';
    const room = rooms[name];
    if (!name || !room || room.host !== socket.id) return;
    const cleanMode = sanitizeMode(mode);
    room.inGame = true;
    room.mode = cleanMode;
    room.seed = sanitizeSeed(seed);
    io.to(name).emit('game-starting', name, room.mode, room.seed);
    broadcastRooms();
  });

  // Join active game room on game load.
  // Identity check: only a socket that is already a member of the room
  // (via join-room) may claim its slot — nobody can steal names anymore.
  // The client sends the socket id it had in the lobby for correlation.
  socket.on('join-game', (roomName, username) => {
    const name = typeof roomName === 'string' ? roomName.slice(0, MAX_NAME_LEN) : '';
    const user = sanitizeUsername(username);
    const room = rooms[name];
    if (!name || !user || !room) return;
    socket.join(name);

    // Only adopt the slot if this socket is already a known member.
    // Lobby→game navigation creates a NEW socket, so a same-username slot
    // whose old socket is gone (disconnected) may be reclaimed — this keeps
    // the normal flow working. An impersonator can never steal the slot of a
    // still-connected player, nor the host role from an active socket.
    let member = room.players.find((p) => p.id === socket.id);
    if (!member) {
      const stale = room.players.find(
        (p) => p.username === user && !io.sockets.sockets.has(p.id)
      );
      if (stale) {
        const oldId = stale.id;
        stale.id = socket.id;
        if (room.host === oldId) room.host = socket.id;
        member = stale;
      } else {
        if (room.players.length >= MAX_PLAYERS_PER_ROOM) return;
        // Prevent impersonation: same username twice = reject
        if (room.players.some((p) => p.username === user)) return;
        member = { id: socket.id, username: user };
        room.players.push(member);
      }
    }
    // Broadcast updated players and host
    io.to(name).emit('room-sync', room.players, room.host);
    broadcastRooms();
    // Notify other players in room to immediately re-send their position
    socket.to(name).emit('player-joined-game');
  });

  // Client updates position — validated, throttled, room-scoped only.
  // No global-broadcast fallback: packets only go to the sender's own room.
  socket.on('move', (data) => {
    if (!data || typeof data !== 'object') return;
    const now = Date.now();
    if (now - (lastMoveAt.get(socket.id) || 0) < MOVE_MIN_INTERVAL_MS) return;
    lastMoveAt.set(socket.id, now);

    const roomName = typeof data.room === 'string' ? data.room.slice(0, MAX_NAME_LEN) : '';
    const room = rooms[roomName];
    if (!roomName || !room) return;
    if (!room.players.some((p) => p.id === socket.id)) return; // must be a member

    const num = (v) => (typeof v === 'number' && Number.isFinite(v) ? v : 0);
    const payload = {
      socketId: socket.id,
      px: num(data.px),
      py: num(data.py),
      offset: num(data.offset),
      color: typeof data.color === 'string' ? data.color.slice(0, 32) : data.color === true ? true : '#ffffff',
      text: sanitizeUsername(data.text) || '?',
      level: Number.isInteger(data.level) ? Math.max(0, Math.min(data.level, 10000)) : 0,
      difficulty: sanitizeMode(data.difficulty),
    };
    socket.to(roomName).emit('playerdata', payload);
  });

  socket.on('disconnect', () => {
    lastMoveAt.delete(socket.id);
    // Find if user was in a room and clean up
    for (const roomName of Object.keys(rooms)) {
      const room = rooms[roomName];
      const pIndex = room.players.findIndex((p) => p.id === socket.id);
      if (pIndex !== -1) {
        handleRoomDeparture(socket, roomName);
        break;
      }
    }
  });
});

function handleRoomDeparture(socket, roomName) {
  const room = rooms[roomName];
  if (!room) return;

  room.players = room.players.filter((p) => p.id !== socket.id);
  socket.leave(roomName);
  io.to(roomName).emit('player-left-game', socket.id);

  if (room.players.length === 0) {
    delete rooms[roomName];
  } else {
    // Reassign host if the host left
    if (room.host === socket.id) {
      room.host = room.players[0].id;
    }
    io.to(roomName).emit('room-sync', room.players, room.host);
  }
  broadcastRooms();
}

server.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
