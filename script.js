// Utility: format two digits
function two(n) {
  return String(n).padStart(2, '0');
}

function getHHMM() {
  const d = new Date();
  return two(d.getHours()) + two(d.getMinutes());
}

// Elements
const pwInput = document.getElementById('pw');
const pwMsg = document.getElementById('pwMsg');
const demoKeyEl = document.getElementById('demoKey');
const activateBtn = document.getElementById('activateBtn');
const actMsg = document.getElementById('actMsg');
const demoInfo = document.getElementById('demoInfo');
const historyEl = document.getElementById('history');
const pwContainer = document.getElementById('pwContainer');

// Feedback
const fbWorking = document.getElementById('fbWorking');
const fbSatisfy = document.getElementById('fbSatisfy');
const fbLike = document.getElementById('fbLike');
const fbDilkie = document.getElementById('fbDilkie');
const countsEl = document.getElementById('counts');
const comments = document.getElementById('comments');
const sendFb = document.getElementById('sendFb');
const clearFb = document.getElementById('clearFb');

// Local storage keys
const LS_FEED = 'demo_activation_feedback_v1';
const LS_HISTORY = 'demo_activation_history_v1';

function loadFeedback() {
  try {
    const fb = JSON.parse(localStorage.getItem(LS_FEED) || '{}');
    return { working: fb.working || 0, satisfy: fb.satisfy || 0, like: fb.like || 0, dilkie: fb.dilkie || 0 };
  } catch (e) {
    return { working: 0, satisfy: 0, like: 0, dilkie: 0 };
  }
}

function saveFeedback(obj) {
  localStorage.setItem(LS_FEED, JSON.stringify(obj));
}

function updateCounts() {
  const f = loadFeedback();
  countsEl.textContent = `working: ${f.working}, satisfy: ${f.satisfy}, like: ${f.like}, dilkie: ${f.dilkie}`;
}
updateCounts();

// Feedback buttons
[fbWorking, fbSatisfy, fbLike, fbDilkie].forEach(btn => {
  btn.addEventListener('click', () => {
    const f = loadFeedback();
    if (btn === fbWorking) f.working++;
    if (btn === fbSatisfy) f.satisfy++;
    if (btn === fbLike) f.like++;
    if (btn === fbDilkie) f.dilkie++;
    saveFeedback(f);
    updateCounts();
    btn.animate([{ transform: 'scale(1)' }, { transform: 'scale(0.96)' }, { transform: 'scale(1)' }], { duration: 180 });
  });
});

sendFb.addEventListener('click', () => {
  const note = comments.value.trim();
  if (!note) {
    alert('Please write a short comment before sending (demo).');
    return;
  }
  const hist = JSON.parse(localStorage.getItem(LS_HISTORY) || '[]');
  hist.push({ type: 'feedback', text: note, time: new Date().toISOString() });
  localStorage.setItem(LS_HISTORY, JSON.stringify(hist));
  comments.value = '';
  alert('Feedback saved locally (demo).');
  renderHistory();
});

clearFb.addEventListener('click', () => {
  if (confirm('Clear local feedback and history? This only affects this browser.')) {
    localStorage.removeItem(LS_FEED);
    localStorage.removeItem(LS_HISTORY);
    updateCounts();
    renderHistory();
  }
});

function renderHistory() {
  const hist = JSON.parse(localStorage.getItem(LS_HISTORY) || '[]');
  if (hist.length === 0) {
    historyEl.textContent = '—';
    return;
  }
  historyEl.innerHTML = hist.slice(-10).reverse().map(h => {
    const t = new Date(h.time).toLocaleString();
    return `<div style="margin-bottom:8px"><strong>${h.type}</strong> <div class='muted' style='font-size:13px'>${h.text}</div><div class='muted' style='font-size:12px'>${t}</div></div>`;
  }).join('');
}
renderHistory();

// Password checking: reveal key and hide input on correct password
function checkPasswordNow() {
  const now = getHHMM();
  if (pwInput.value === now) {
    const token = makeDemoKey();
    pwContainer.innerHTML = `<div class="key">${token}</div>`;
    demoInfo.textContent = `Key revealed at ${new Date().toLocaleString()}`;
    demoKeyEl.textDoeKeyEl.textContent = token;
    activateBtn.disabled = false;
    actMsg.innerHTML = '<span class="muted">Key revealed — ready for activation.</span>';
    const hist = JSON.parse(localStorage.getItem(LS_HISTORY) || '[]');
    hist.push({ type: 'reveal', text: `key ${token} revealed`, time: new Date().toISOString() });
    localStorage.setItem(LS_HISTORY, JSON.stringify(hist));
    renderHistory();
  } else {
    if (pwInput.value.length >= 1) {
      pwMsg.innerHTML = '<span class="error">Password incorrect</span>';
    } else {
      pwMsg.innerHTML = '';
    }
  }
}

pwInput.addEventListener('input', checkPasswordNow);

// Reveal demo key
function makeDemoKey() {
  const arr = new Uint8Array(8);
  crypto.getRandomValues(arr);
  return Array.from(arr).map(b => ('0' + b.toString(16)).slice(-2)).join('').toUpperCase().match(/.{1,4}/g).join('-');
}

activateBtn.addEventListener('click', () => {
  const key = demoKeyEl.textContent;
  if (!key || key.startsWith('•')) {
    actMsg.innerHTML = '<span class="error">No key — reveal one first.</span>';
    return;
  }
  const tx = { type: 'activate', text: `activated key ${key}`, time: new Date().toISOString() };
  const hist = JSON.parse(localStorage.getItem(LS_HISTORY) || '[]');
  hist.push(tx);
  localStorage.setItem(LS_HISTORY, JSON.stringify(hist));
  renderHistory();
  actMsg.innerHTML = '<span class="success">Activation simulated & saved locally.</span>';
  activateBtn.disabled = true;
});

// Reset
const resetBtn = document.getElementById('resetBtn');
resetBtn.addEventListener('click', () => {
  if (confirm('Reset session?')) {
    demoKeyEl.textContent = '•••••••••••••••';
    activateBtn.disabled = true;
    pwContainer.innerHTML = `
      <label for="pw">Password</label>
      <input id="pw" type="password" inputmode="numeric" placeholder="Enter password" aria-describedby="pwHelp" />
      <div id="pwHelp" class="muted" style="margin-top:8px">Enter the correct password to reveal the key.</div>
      <div id="pwMsg" style="margin-top:8px" aria-live="polite"></div>
    `;
    pwInput = document.getElementById('pw');
    pwMsg.innerHTML = '';
    actMsg.innerHTML = '';
    demoInfo.textContent = 'No key revealed yet.';
    pwInput.addEventListener('input', checkPasswordNow);
  }
});

// Accessibility: allow Enter to check password
pwInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    checkPasswordNow();
  }
});

// Periodically revalidate password
setInterval(() => {
  if (pwInput) {
    checkPasswordNow();
  }
}, 10000);
