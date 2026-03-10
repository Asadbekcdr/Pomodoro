
  const COLORS = { pomodoro: '#BA4949', short: '#38858A', long: '#397097' };
  let config = { pomodoro: 25, short: 5, long: 15 };
  let currentMode = 'pomodoro';
  let timeLeft = config.pomodoro * 60;
  let running = false;
  let interval = null;
  let round = 1;
  let pomosThisSession = 0;
  let tasks = [];

  let currentUser = null;
  let authMode = 'login';
  const weekData = [2, 5, 3, 7, 4, 1, 0]; // demo haftalik data

  function handleAuthBtn() {
    if (currentUser) {
      document.getElementById('userMenu').classList.toggle('show');
    } else {
      openAuth();
    }
  }
  function closeUserMenu() {
    document.getElementById('userMenu').classList.remove('show');
  }
  document.addEventListener('click', e => {
    if (!document.getElementById('authArea').contains(e.target)) closeUserMenu();
  });

  function openAuth() {
    document.getElementById('authModal').classList.add('show');
  }
  function closeAuth() {
    document.getElementById('authModal').classList.remove('show');
    document.getElementById('authEmail').value = '';
    document.getElementById('authPass').value = '';
    document.getElementById('authName').value = '';
  }
  function switchAuthTab(mode) {
    authMode = mode;
    document.getElementById('tabLogin').classList.toggle('active', mode === 'login');
    document.getElementById('tabRegister').classList.toggle('active', mode === 'register');
    document.getElementById('authNameWrap').style.display = mode === 'register' ? 'block' : 'none';
    document.getElementById('authSubmit').textContent = mode === 'login' ? 'Kirish' : 'Ro\'yxatdan o\'tish';
  }
  function doAuth() {
    const email = document.getElementById('authEmail').value.trim();
    const pass  = document.getElementById('authPass').value.trim();
    const name  = document.getElementById('authName').value.trim();
    if (!email || !pass) { showToast('Email va parol kiriting!'); return; }
    if (authMode === 'register' && !name) { showToast('Ismingizni kiriting!'); return; }
    const displayName = authMode === 'register' ? name : email.split('@')[0];
    signInUser(displayName, email);
    closeAuth();
  }
  function doGoogleAuth() {
    signInUser('Google User', 'google@example.com');
    closeAuth();
    showToast('Google bilan kirdingiz! ✅');
  }
  function signInUser(name, email) {
    currentUser = { name, email };
    const btn = document.getElementById('authBtn');
    btn.innerHTML = `
      <div class="user-avatar">${name[0].toUpperCase()}</div>
      <span>${name.split(' ')[0]}</span>
    `;
    showToast(`Xush kelibsiz, ${name.split(' ')[0]}! 👋`);
  }
  function signOut() {
    currentUser = null;
    document.getElementById('authBtn').innerHTML = `
      <svg viewBox="0 0 24 24" style="width:14px;height:14px;fill:#fff;flex-shrink:0"><path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/></svg>
      <span id="authBtnText">Sign In</span>`;
    closeUserMenu();
    showToast('Tizimdan chiqdingiz 👋');
  }

  function openReport() {
    document.getElementById('rPomos').textContent = pomosThisSession;
    document.getElementById('rFocus').textContent = pomosThisSession * config.pomodoro;
    document.getElementById('rTasks').textContent = tasks.filter(t => t.done).length;
    
    const days = ['Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh', 'Ya'];
    const max = Math.max(...weekData, pomosThisSession, 1);
    const todayIdx = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;
    const data = [...weekData];
    data[todayIdx] = pomosThisSession;
    const container = document.getElementById('dayBars');
    container.innerHTML = '';
    data.forEach((v, i) => {
      const wrap = document.createElement('div');
      wrap.className = 'day-bar-wrap';
      const pct = Math.round((v / max) * 100);
      wrap.innerHTML = `
        <div class="day-bar" style="height:${Math.max(pct,4)}%;opacity:${i===todayIdx?'1':'0.55'};${i===todayIdx?'outline:2px solid rgba(255,255,255,0.5)':''}"></div>
        <span class="day-name">${days[i]}</span>`;
      container.appendChild(wrap);
    });
    document.getElementById('reportModal').classList.add('show');
  }
  function closeReport() {
    document.getElementById('reportModal').classList.remove('show');
  }

  function fmt(s) {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
  }

  function updateDisplay() {
    document.getElementById('timerDisplay').textContent = fmt(timeLeft);
    document.title = `${fmt(timeLeft)} — Pomofocus`;
  }

  function toggleTimer() {
    if (running) {
      clearInterval(interval);
      running = false;
      document.getElementById('startBtn').textContent = 'START';
    } else {
      running = true;
      document.getElementById('startBtn').textContent = 'PAUSE';
      interval = setInterval(() => {
        if (timeLeft <= 0) {
          clearInterval(interval);
          running = false;
          document.getElementById('startBtn').textContent = 'START';
          onTimerEnd();
          return;
        }
        timeLeft--;
        updateDisplay();
      }, 1000);
    }
  }

  function onTimerEnd() {
    playBeep();
    if (currentMode === 'pomodoro') {
      pomosThisSession++;
      round++;
      showToast(' Pomodoro tugadi! Dam oling.');
      if (pomosThisSession % 4 === 0) {
        switchMode('long', document.querySelector('[data-mode="long"]'));
      } else {
        switchMode('short', document.querySelector('[data-mode="short"]'));
      }
    } else {
      showToast('⏱ Tanaffus tugadi! Ishlashni boshlang.');
      switchMode('pomodoro', document.querySelector('[data-mode="pomodoro"]'));
    }
  }

  function skipTimer() {
    clearInterval(interval);
    running = false;
    document.getElementById('startBtn').textContent = 'START';
    onTimerEnd();
  }

  function switchMode(mode, btn) {
    clearInterval(interval);
    running = false;
    document.getElementById('startBtn').textContent = 'START';
    currentMode = mode;
    timeLeft = config[mode] * 60;
    updateDisplay();
    document.querySelectorAll('.mode-tab').forEach(t => t.classList.remove('active'));
    if (btn) btn.classList.add('active');
    document.body.style.background = COLORS[mode];
    document.documentElement.style.setProperty('--bg', COLORS[mode]);
    updateRoundInfo();
  }

  function updateRoundInfo() {
    const msgs = { pomodoro: `#${round} — Diqqat vaqti! `, short: 'Qisqa tanaffus ☕', long: 'Uzun tanaffus 🌿' };
    document.getElementById('roundInfo').textContent = msgs[currentMode];
  }

  // ─── BEEP ───
  function playBeep() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      [0, 0.3, 0.6].forEach(t => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.frequency.value = 880;
        gain.gain.setValueAtTime(0.4, ctx.currentTime + t);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + t + 0.25);
        osc.start(ctx.currentTime + t);
        osc.stop(ctx.currentTime + t + 0.25);
      });
    } catch(e) {}
  }

  function showAddTask() {
    document.getElementById('addTaskBox').classList.add('show');
    document.getElementById('addTaskTrigger').style.display = 'none';
    setTimeout(() => document.getElementById('taskInput').focus(), 50);
  }

  function hideAddTask() {
    document.getElementById('addTaskBox').classList.remove('show');
    document.getElementById('addTaskTrigger').style.display = 'flex';
    document.getElementById('taskInput').value = '';
    document.getElementById('pomoCount').value = 1;
  }

  function saveTask() {
    const name = document.getElementById('taskInput').value.trim();
    if (!name) { showToast('Vazifa nomini kiriting!'); return; }
    const pomos = parseInt(document.getElementById('pomoCount').value) || 1;
    tasks.push({ id: Date.now(), name, pomos, done: false });
    renderTasks();
    hideAddTask();
    showToast('✅ Vazifa qo\'shildi!');
  }

  function renderTasks() {
    const list = document.getElementById('taskList');
    list.innerHTML = '';
    tasks.forEach(t => {
      const div = document.createElement('div');
      div.className = 'task-item';
      div.innerHTML = `
        <div class="task-check ${t.done?'done':''}" onclick="toggleTask(${t.id})"></div>
        <div class="task-name ${t.done?'done-text':''}">${escHtml(t.name)}</div>
        <div class="task-pomos"> ${t.pomos}</div>
        <button class="task-del" onclick="deleteTask(${t.id})" title="O'chirish">
          <svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
        </button>`;
      list.appendChild(div);
    });
  }

  function toggleTask(id) {
    const t = tasks.find(x => x.id === id);
    if (t) { t.done = !t.done; renderTasks(); }
  }

  function deleteTask(id) {
    tasks = tasks.filter(x => x.id !== id);
    renderTasks();
  }

  function clearDone() {
    const before = tasks.length;
    tasks = tasks.filter(t => !t.done);
    renderTasks();
    const removed = before - tasks.length;
    if (removed > 0) showToast(`🗑 ${removed} ta bajarilgan o'chirildi`);
    else showToast('Bajarilgan vazifa yo\'q');
  }

  function escHtml(s) {
    return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  function openSettings() {
    document.getElementById('setPomo').value = config.pomodoro;
    document.getElementById('setShort').value = config.short;
    document.getElementById('setLong').value = config.long;
    document.getElementById('settingsModal').classList.add('show');
  }
  function closeSettings() {
    document.getElementById('settingsModal').classList.remove('show');
  }
  function saveSettings() {
    config.pomodoro = parseInt(document.getElementById('setPomo').value) || 25;
    config.short = parseInt(document.getElementById('setShort').value) || 5;
    config.long = parseInt(document.getElementById('setLong').value) || 15;
    closeSettings();
    switchMode(currentMode, document.querySelector(`[data-mode="${currentMode}"]`));
    showToast('⚙️ Sozlamalar saqlandi!');
  }

  function showToast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 2800);
  }

  document.addEventListener('keydown', e => {
    if (e.code === 'Space' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'BUTTON') {
      e.preventDefault(); toggleTimer();
    }
  });
  document.getElementById('taskInput').addEventListener('keydown', e => {
    if (e.key === 'Enter') saveTask();
    if (e.key === 'Escape') hideAddTask();
  });

  updateDisplay();
  updateRoundInfo();
