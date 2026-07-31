/* ===== script.js ===== */

// ---- State ----
let letterOpened = false;
let noClickCount = 0;

// ---- Elements ----
const envelope      = document.getElementById('envelope');
const envelopeFlap  = document.getElementById('envelopeFlap');
const btnGroup      = document.getElementById('btnGroup');
const btnYes        = document.getElementById('btnYes');
const btnNo         = document.getElementById('btnNo');
const warningMsg    = document.getElementById('warningMsg');
const forgivenScreen= document.getElementById('forgivenScreen');
const letterModal   = document.getElementById('letterModal');
const closeModalBtn = document.getElementById('closeModalBtn');

// ---- Open letter on envelope click ----
document.getElementById('envelopeWrapper').addEventListener('click', () => {
  // 1. Flip flap open
  envelopeFlap.classList.add('open');

  // 2. Show full letter modal popup overlay smoothly
  setTimeout(() => {
    letterModal.classList.add('show');
  }, 400);
});

// Close modal when clicking close button or background overlay
closeModalBtn.addEventListener('click', () => {
  letterModal.classList.remove('show');
});

letterModal.addEventListener('click', (e) => {
  if (e.target === letterModal) {
    letterModal.classList.remove('show');
  }
});

// ---- No button ----
function handleNo() {
  noClickCount++;

  // Shake "Không" button
  btnNo.classList.remove('shake');
  void btnNo.offsetWidth; // reflow to restart animation
  btnNo.classList.add('shake');

  // Show warning message
  warningMsg.classList.add('show');

  // Make the Yes button grow bigger each time (max 1.4×)
  const scale = Math.min(1 + noClickCount * 0.08, 1.4);
  btnYes.style.transform = `scale(${scale})`;

  // Move the No button randomly to avoid it
  moveNoButton();
}

function moveNoButton() {
  const maxX = 100;
  const maxY = 30;
  const x = (Math.random() * maxX * 2 - maxX).toFixed(0);
  const y = (Math.random() * maxY * 2 - maxY).toFixed(0);
  btnNo.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
  btnNo.style.transform  = `translate(${x}px, ${y}px) scale(${Math.max(1 - noClickCount * 0.07, 0.5)})`;
  btnNo.style.opacity    = Math.max(1 - noClickCount * 0.12, 0.2);
}

// Remove shake class after animation
btnNo.addEventListener('animationend', () => {
  btnNo.classList.remove('shake');
});

// ---- Yes button ----
function handleYes() {
  letterModal.classList.remove('show');
  launchConfetti();
  setTimeout(() => {
    forgivenScreen.classList.add('show');
  }, 200);
}

// ---- Confetti burst ----
function launchConfetti() {
  const colors = ['#ff4d6d', '#ff758f', '#ffc2ce', '#ffb3c6', '#ff85a1', '#c9184a', '#fff', '#ffe4ec'];
  for (let i = 0; i < 80; i++) {
    const el = document.createElement('div');
    el.className = 'confetti-piece';
    el.style.cssText = `
      left: ${Math.random() * 100}vw;
      top: ${-10 + Math.random() * 30}px;
      background: ${colors[Math.floor(Math.random() * colors.length)]};
      width: ${6 + Math.random() * 10}px;
      height: ${6 + Math.random() * 10}px;
      border-radius: ${Math.random() > 0.5 ? '50%' : '2px'};
      animation-duration: ${1.5 + Math.random() * 2}s;
      animation-delay: ${Math.random() * 0.8}s;
    `;
    document.body.appendChild(el);
    el.addEventListener('animationend', () => el.remove());
  }
}

// ---- Floating hearts background ----
function spawnHeart() {
  const heartsBg = document.getElementById('heartsBg');
  const emojis   = ['❤️', '💕', '💖', '💗', '💓', '💝', '🌸'];
  const el        = document.createElement('span');
  el.className    = 'heart-particle';
  el.textContent  = emojis[Math.floor(Math.random() * emojis.length)];
  el.style.left   = `${Math.random() * 100}%`;
  el.style.fontSize = `${0.8 + Math.random() * 1.2}rem`;
  const dur       = 6 + Math.random() * 8;
  el.style.animationDuration  = `${dur}s`;
  el.style.animationDelay     = `${Math.random() * 4}s`;
  heartsBg.appendChild(el);
  setTimeout(() => el.remove(), (dur + 4) * 1000);
}

// Spawn hearts continuously
(function initHearts() {
  for (let i = 0; i < 14; i++) spawnHeart();
  setInterval(spawnHeart, 900);
})();
