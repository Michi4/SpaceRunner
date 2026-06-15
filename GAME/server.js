const express = require('express');
const http = require('http');

const app = express();
const server = http.createServer(app);
const io = require('socket.io')(server);
const port = 3000;

app.use(express.static('public'));

let rooms = {};

// Helper: Broadcast all rooms to matching sockets
function broadcastRooms() {
  io.emit('rooms-update', rooms);
}

io.on('connection', (socket) => {

  // Retrieve current active rooms
  socket.on('get-rooms', () => {
    socket.emit('rooms-update', rooms);
  });

  // Create Room
  socket.on('create-room', (roomName, username) => {
    if (!roomName || rooms[roomName]) return;

    rooms[roomName] = {
      host: socket.id,
      players: [{ id: socket.id, username: username }]
    };

    socket.join(roomName);
    socket.emit('room-joined', roomName, rooms[roomName].players, rooms[roomName].host);
    broadcastRooms();
  });

  // Join Room
  socket.on('join-room', (roomName, username) => {
    const room = rooms[roomName];
    if (!room || room.players.length >= 4) return;

    room.players.push({ id: socket.id, username: username });
    socket.join(roomName);
    socket.emit('room-joined', roomName, room.players, room.host);
    
    // Notify room members
    io.to(roomName).emit('room-sync', room.players, room.host);
    broadcastRooms();
  });

  // Leave Room
  socket.on('leave-room', (roomName) => {
    handleRoomDeparture(socket, roomName);
  });

  // Game Start
  socket.on('start-game', (roomName, mode, seed) => {
    const room = rooms[roomName];
    if (room && room.host === socket.id) {
      io.to(roomName).emit('game-starting', roomName, mode || 'normal', seed || null);
      // Clean up room room structure so it's not active in lobby list
      delete rooms[roomName];
      broadcastRooms();
    }
  });

  // Join active game room on game load
  socket.on('join-game', (roomName) => {
    socket.join(roomName);
    // Notify other players in room to immediately re-send their position
    socket.to(roomName).emit('player-joined-game');
    console.log(`Socket ${socket.id} joined game room: ${roomName}`);
  });

  // Client updates position
  socket.on('move', (data) => {
    // Tag the data with sender's socket ID
    const payload = { ...data, socketId: socket.id };
    if (data.room) {
      socket.to(data.room).emit('playerdata', payload);
    } else {
      socket.broadcast.emit('playerdata', payload);
    }
  });

  socket.on('disconnect', () => {
    // Find if user was in a room and clean up
    for (const roomName in rooms) {
      const room = rooms[roomName];
      const pIndex = room.players.findIndex(p => p.id === socket.id);
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

  room.players = room.players.filter(p => p.id !== socket.id);
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