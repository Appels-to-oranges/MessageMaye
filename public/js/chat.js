(function () {
  const roomKey = sessionStorage.getItem('messageMaye_room');
  const nickname = sessionStorage.getItem('messageMaye_nick');

  if (!roomKey || !nickname) {
    window.location.href = '/';
    return;
  }

  document.getElementById('room-badge').textContent = roomKey;
  document.getElementById('nick-badge').textContent = nickname;

  const STORAGE_KEYS = { font: 'messageMaye_fontSize', theme: 'messageMaye_theme' };
  const body = document.body;
  const IMAGE_THEMES = ['winter-night', 'sunny-sky', 'waterfront', 'space-needle', 'sunset-harbor'];

  function setImageThemeBg(theme) {
    const base = '/images/themes/' + theme;
    const gifUrl = base + '.gif';
    const pngUrl = base + '.png';
    var cacheBust = '?v=' + (window.__themeCacheBust || (window.__themeCacheBust = Date.now()));
    var msgEl = document.getElementById('messages');
    msgEl.style.backgroundImage = 'url(' + gifUrl + cacheBust + ')';
    var img = new Image();
    img.onerror = function () { msgEl.style.backgroundImage = 'url(' + pngUrl + ')'; };
    img.src = gifUrl + cacheBust;
  }

  function applyTheme(theme) {
    body.classList.remove('theme-warm', 'theme-cool', 'theme-soft', 'theme-ocean',
      'theme-winter-night', 'theme-sunny-sky', 'theme-waterfront', 'theme-space-needle', 'theme-sunset-harbor');
    if (theme !== 'default') body.classList.add('theme-' + theme);
    var msgEl = document.getElementById('messages');
    if (IMAGE_THEMES.includes(theme)) {
      setImageThemeBg(theme);
    } else {
      msgEl.style.backgroundImage = '';
    }
    document.querySelectorAll('.theme-opt').forEach(function (el) {
      el.classList.toggle('active', el.dataset.theme === theme);
    });
    localStorage.setItem(STORAGE_KEYS.theme, theme);
  }

  function applySettings() {
    const font = localStorage.getItem(STORAGE_KEYS.font) || 'medium';
    const theme = localStorage.getItem(STORAGE_KEYS.theme) || 'default';
    body.classList.remove('font-small', 'font-medium', 'font-large');
    body.classList.add('font-' + font);
    applyTheme(theme);
    document.querySelectorAll('.size-opt').forEach(function (el) {
      el.classList.toggle('active', el.dataset.size === font);
    });
  }

  applySettings();

  /* ---------- Settings panel (font size only) ---------- */
  const settingsOverlay = document.getElementById('settings-overlay');
  const settingsOpenBtn = document.getElementById('settings-btn');
  const settingsCloseBtn = document.getElementById('settings-close');

  function openPanel(overlay) {
    overlay.classList.add('open');
    overlay.setAttribute('aria-hidden', 'false');
  }
  function closePanel(overlay) {
    overlay.classList.remove('open');
    overlay.setAttribute('aria-hidden', 'true');
  }

  settingsOpenBtn.addEventListener('click', function () { openPanel(settingsOverlay); });
  settingsCloseBtn.addEventListener('click', function () { closePanel(settingsOverlay); });
  settingsOverlay.addEventListener('click', function (e) {
    if (e.target === settingsOverlay) closePanel(settingsOverlay);
  });

  document.querySelectorAll('.size-opt').forEach(function (btn) {
    btn.addEventListener('click', function () {
      localStorage.setItem(STORAGE_KEYS.font, btn.dataset.size);
      applySettings();
    });
  });

  /* ---------- Backgrounds panel ---------- */
  const bgOverlay = document.getElementById('backgrounds-overlay');
  const bgOpenBtn = document.getElementById('backgrounds-btn');
  const bgCloseBtn = document.getElementById('backgrounds-close');

  bgOpenBtn.addEventListener('click', function () { openPanel(bgOverlay); });
  bgCloseBtn.addEventListener('click', function () { closePanel(bgOverlay); });
  bgOverlay.addEventListener('click', function (e) {
    if (e.target === bgOverlay) closePanel(bgOverlay);
  });

  /* ---------- Socket ---------- */
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

  socket.on('user-joined', function (data) {
    const isOwn = data.nickname === nickname;
    appendMessage(isOwn ? 'own' : 'other', { nickname: data.nickname, text: 'joined the room' });
  });

  socket.on('user-left', function (data) {
    appendMessage('other', { nickname: data.nickname, text: 'left the room' });
  });

  socket.on('new-message', function (data) {
    const isOwn = data.nickname === nickname;
    appendMessage(isOwn ? 'own' : 'other', data);
  });

  socket.on('background-changed', function (data) {
    applyTheme(data.theme);
    appendMessage('system', { text: data.nickname + ' changed the background' });
  });

  /* When a theme button in the backgrounds panel is clicked, broadcast to room */
  document.querySelectorAll('.theme-opt').forEach(function (btn) {
    btn.addEventListener('click', function () {
      socket.emit('change-background', btn.dataset.theme);
    });
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    socket.emit('send-message', text);
    input.value = '';
  });
})();
