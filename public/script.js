// Elements
let pwInput = document.getElementById('pw');
const pwMsg = document.getElementById('pwMsg');
const activateBtn = document.getElementById('activateBtn');
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

sendFb.addEventListener('click', async (e) => {
  e.preventDefault(); // Prevent default anchor behavior
  const note = comments.value.trim();
  if (!note) {
    alert('Please write a short comment before sending (demo).');
    return;
  }

  try {
    const response = await fetch('/send-feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ comment: note })
    });
    const data = await response.json();

    if (response.ok) {
      comments.value = '';
      alert('Feedback saved successfully (demo).');
    } else {
      alert(`Failed to save feedback: ${data.error}`);
    }
  } catch (error) {
    alert('Error sending feedback to server');
  }
});

clearFb.addEventListener('click', () => {
  if (confirm('Clear local feedback? This only affects this browser.')) {
    localStorage.removeItem(LS_FEED);
    updateCounts();
  }
});

// Password checking: fetch key from server
async function checkPasswordNow() {
  if (!pwInput) return;

  const password = pwInput.value;
  if (password.length >= 1) {
    try {
      const response = await fetch('/get-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      const data = await response.json();

      if (response.ok) {
        const token = data.key; // Key from server
        const keyElement = document.createElement('div');
        keyElement.className = 'key';
        keyElement.textContent = token; // Display key in plain text
        keyElement.title = 'Click to copy key';
        pwContainer.innerHTML = '';
        pwContainer.appendChild(keyElement);
        activateBtn.disabled = false;
        actMsg.innerHTML = '<span class="success">Key revealed — ready for activation.</span>';
        pwInput = null;

        // Copy functionality
        keyElement.addEventListener('click', () => {
          navigator.clipboard.writeText(token).then(() => {
            const notification = document.createElement('div');
            notification.className = 'success';
            notification.textContent = 'Copied!';
            notification.style.position = 'absolute';
            notification.style.marginTop = '10px';
            keyElement.appendChild(notification);
            setTimeout(() => notification.remove(), 2000);
          }).catch(() => {
            alert('Unable to copy — permission denied.');
          });
        });
      } else {
        pwMsg.innerHTML = `<span class="error">${data.error}</span>`;
      }
    } catch (error) {
      pwMsg.innerHTML = '<span class="error">Error contacting server</span>';
    }
  } else {
    pwMsg.innerHTML = '';
  }
}

if (pwInput) {
  pwInput.addEventListener('input', checkPasswordNow);
  pwInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      checkPasswordNow();
    }
  });
}

activateBtn.addEventListener('click', () => {
  actMsg.innerHTML = '<span class="success">Activation simulated & saved locally.</span>';
  activateBtn.disabled = true;
  activateBtn.textContent = 'Activated';
});

// Copy functionality for Method 1 inputs (no notification)
document.querySelectorAll('.copy-input').forEach(input => {
  input.addEventListener('click', () => {
    const text = input.value; // Use current input value
    navigator.clipboard.writeText(text).catch(() => {
      alert('Unable to copy — permission denied.');
    });
  });
});
