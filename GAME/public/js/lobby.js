/* =========================================================
   SpaceRunner – multiplayer lobby logic
   Depends: /socket.io/socket.io.js, js/common.js (defer order)
   Server sends minimal room summaries: { players: <count>, inGame, mode }
   ========================================================= */
'use strict';

(function () {
  const setupView = document.getElementById('setup-view');
  const lobbyView = document.getElementById('lobby-view');
  const createRoomNameInput = document.getElementById('create-room-name');
  const createBtn = document.getElementById('create-btn');
  const roomsListContainer = document.getElementById('rooms-list-container');
  const currentRoomTitle = document.getElementById('current-room-title');
  const playerBadgeContainer = document.getElementById('player-badge-container');
  const startGameBtn = document.getElementById('start-game-btn');
  const leaveBtn = document.getElementById('leave-btn');
  const modeSection = document.getElementById('mode-selector-section');

  if (!setupView || typeof io === 'undefined') {
    if (roomsListContainer) {
      roomsListContainer.innerHTML = '';
      const note = document.createElement('div');
      note.className = 'rooms-empty';
      note.textContent = 'Multiplayer server is unreachable. Solo and co-op still work!';
      roomsListContainer.appendChild(note);
    }
    if (createBtn) createBtn.disabled = true;
    return;
  }

  const socket = io();
  const SR = window.SpaceRunner || {};
  const escapeHtml = SR.escapeHtml || ((s) => String(s ?? ''));
  const guestName = SR.guestName || (() => 'sr_Guest');

  let myUsername = '';
  let currentRoom = null;
  let isHost = false;
  let roomPlayers = [];

  // Identity: server session first, persistent guest name otherwise
  async function initIdentity() {
    try {
      const res = await fetch('/php/get_user_data.php', { credentials: 'same-origin' });
      if (res.ok) {
        const data = await res.json();
        if (data && data.success && data.username) myUsername = String(data.username);
      }
    } catch (e) { /* offline */ }
    if (!myUsername) myUsername = guestName();
    if (SR.refreshAuthUI) SR.refreshAuthUI();
  }

  function showEmptyRooms() {
    roomsListContainer.innerHTML = '';
    const note = document.createElement('div');
    note.className = 'rooms-empty';
    note.textContent = 'No rooms active. Create one above!';
    roomsListContainer.appendChild(note);
  }

  // Join Lobby main room
  socket.emit('get-rooms');

  // Socket listener: Rooms List (XSS-safe DOM construction, no innerHTML)
  socket.on('rooms-update', (rooms) => {
    roomsListContainer.innerHTML = '';
    const roomKeys = rooms ? Object.keys(rooms) : [];
    if (roomKeys.length === 0) {
      showEmptyRooms();
      return;
    }

    roomKeys.forEach((roomName) => {
      const room = rooms[roomName] || {};
      const item = document.createElement('div');
      item.className = 'room-item';

      const meta = document.createElement('div');
      meta.className = 'room-meta';
      const title = document.createElement('strong');
      title.textContent = roomName;
      const sub = document.createElement('div');
      sub.className = 'room-sub';
      const count = Number.isInteger(room.players) ? room.players : 0;
      sub.textContent = 'Players: ' + count + '/4' + (room.inGame ? ' (In Game)' : '');
      if (room.inGame) sub.classList.add('room-live');
      meta.appendChild(title);
      meta.appendChild(sub);

      const joinBtn = document.createElement('button');
      joinBtn.type = 'button';
      joinBtn.dataset.room = roomName;
      joinBtn.textContent = room.inGame ? 'Join Mid-Game' : 'Join';

      item.appendChild(meta);
      item.appendChild(joinBtn);
      roomsListContainer.appendChild(item);
    });
  });

  // Event delegation: no inline onclick, room name never touches HTML parsing
  roomsListContainer.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-room]');
    if (!btn) return;
    socket.emit('join-room', btn.dataset.room, myUsername);
  });

  // Create Room click
  const ROOM_RE = /^[A-Za-z0-9_\-]{1,20}$/;
  function createRoom() {
    const name = createRoomNameInput.value.trim();
    if (!name) return;
    if (!ROOM_RE.test(name)) {
      createRoomNameInput.setCustomValidity('Letters, numbers, _ or -, max 20 chars.');
      createRoomNameInput.reportValidity();
      return;
    }
    createRoomNameInput.setCustomValidity('');
    socket.emit('create-room', name, myUsername);
  }
  createBtn.addEventListener('click', createRoom);
  createRoomNameInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') createRoom();
  });

  // Socket listener: Joined successfully
  socket.on('room-joined', (roomName, players, hostId) => {
    currentRoom = roomName;
    isHost = (socket.id === hostId);
    roomPlayers = Array.isArray(players) ? players : [];

    try {
      localStorage.setItem('hostId', hostId);
      localStorage.setItem('isHost', isHost ? 'true' : 'false');
    } catch (e) { /* private mode */ }

    setupView.hidden = true;
    lobbyView.hidden = false;
    currentRoomTitle.textContent = 'Room: ' + roomName;

    updatePlayerBadges(roomPlayers, hostId);
  });

  // Socket listener: Room Sync
  socket.on('room-sync', (players, hostId) => {
    isHost = (socket.id === hostId);
    roomPlayers = Array.isArray(players) ? players : [];
    try {
      localStorage.setItem('hostId', hostId);
      localStorage.setItem('isHost', isHost ? 'true' : 'false');
    } catch (e) { /* private mode */ }
    updatePlayerBadges(roomPlayers, hostId);
  });

  function updatePlayerBadges(players, hostId) {
    playerBadgeContainer.innerHTML = '';
    players.forEach((p) => {
      const badge = document.createElement('div');
      badge.className = 'player-badge' + (p.id === hostId ? ' host' : '');
      const label = document.createElement('span');
      label.textContent = (p.id === hostId ? '👑 ' : '') + (p.username || '?');
      badge.appendChild(label);
      playerBadgeContainer.appendChild(badge);
    });

    if (isHost) {
      startGameBtn.disabled = false;
      startGameBtn.textContent = 'Start Game';
      startGameBtn.style.backgroundColor = '#9700bd';
      if (modeSection) modeSection.hidden = false;
    } else {
      startGameBtn.disabled = true;
      startGameBtn.textContent = 'Waiting for Host...';
      startGameBtn.style.backgroundColor = '#444';
      if (modeSection) modeSection.hidden = true;
    }
  }

  // Leave Room click
  leaveBtn.addEventListener('click', () => {
    socket.emit('leave-room', currentRoom);
    setupView.hidden = false;
    lobbyView.hidden = true;
    currentRoom = null;
    socket.emit('get-rooms');
  });

  // Random seed button
  const randomSeedBtn = document.getElementById('random-seed-btn');
  if (randomSeedBtn) {
    randomSeedBtn.addEventListener('click', () => {
      document.getElementById('seed-input').value = Math.floor(Math.random() * 999999999);
    });
  }

  // Start Game click
  startGameBtn.addEventListener('click', () => {
    if (!isHost || !currentRoom) return;
    const selectedMode = document.getElementById('game-mode').value;
    const seedEl = document.getElementById('seed-input');
    const seedVal = seedEl ? seedEl.value.trim() : '';
    let seed;
    if (seedVal) {
      seed = parseInt(seedVal, 10);
      if (!Number.isFinite(seed)) {
        seed = seedVal.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
      }
    } else {
      seed = Math.floor(Math.random() * 999999999);
    }
    socket.emit('start-game', currentRoom, selectedMode, seed);
  });

  // Socket listener: Game Starting
  socket.on('game-starting', (roomName, mode, seed) => {
    try {
      localStorage.setItem('multiplayer', 'true');
      localStorage.setItem('difficulty', mode || 'normal');
      localStorage.setItem('multiplayerRoom', roomName);
      localStorage.setItem('multiplayerPlayers', JSON.stringify(roomPlayers));
      localStorage.setItem('isHost', isHost ? 'true' : 'false');
      if (seed !== null && seed !== undefined) {
        localStorage.setItem('mapSeed', String(seed));
        localStorage.setItem('customSeedUsed', 'true');
      } else {
        localStorage.removeItem('mapSeed');
        localStorage.setItem('customSeedUsed', 'false');
      }
    } catch (e) { /* private mode */ }
    window.location.assign('game');
  });

  initIdentity();
})();
