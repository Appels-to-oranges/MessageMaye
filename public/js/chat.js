(function () {
  const roomKey = sessionStorage.getItem('messageMaye_room');
  const nickname = sessionStorage.getItem('messageMaye_nick');

  if (!roomKey || !nickname) {
    window.location.href = '/';
    return;
  }

  document.getElementById('room-badge').textContent = roomKey;
  document.getElementById('nick-badge').textContent = nickname;

  const socket = io();
  const messagesEl = document.getElementById('messages');
  const form = document.getElementById('send-form');
  const input = document.getElementById('message-input');

  function appendMessage(type, data) {
    const div = document.createElement('div');
    div.className = 'msg ' + type;
    if (type === 'system') {
      div.textContent = data.text;
    } else {
      const sender = document.createElement('div');
      sender.className = 'sender';
      sender.textContent = data.nickname;
      div.appendChild(sender);
      div.appendChild(document.createTextNode(data.text));
    }
    messagesEl.appendChild(div);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  socket.emit('join-room', { roomKey: roomKey.trim().toLowerCase(), nickname });

  socket.on('user-joined', (data) => {
    appendMessage('system', { text: data.nickname + ' joined the room' });
  });

  socket.on('user-left', (data) => {
    appendMessage('system', { text: data.nickname + ' left the room' });
  });

  socket.on('new-message', (data) => {
    const isOwn = data.nickname === nickname;
    appendMessage(isOwn ? 'own' : 'other', data);
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    socket.emit('send-message', text);
    input.value = '';
  });
})();
