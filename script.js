const envelopeButton = document.getElementById('openLetter');
const openTextButton = document.getElementById('openLetterText');
const letterModal = document.getElementById('letterModal');
const closeButton = document.getElementById('closeModalBtn');
const yesButton = document.getElementById('btnYes');
const timeButton = document.getElementById('btnNo');
const reply = document.getElementById('reply');
const particles = document.getElementById('particles');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let opening = false;
let lastOpener = envelopeButton;
let celebrationTimer;
const musicToggle = document.getElementById('musicToggle');
const musicStatus = document.getElementById('musicStatus');
const chorusStart = 126;
let musicPlayer;
let musicReady = false;
let musicRequested = false;

function playLetterMusic() {
  musicRequested = true;
  if (!musicReady) return;
  musicPlayer.seekTo(chorusStart, true);
  musicPlayer.unMute();
  musicPlayer.playVideo();
}

function showMusicError(code) {
  musicReady = false;
  musicToggle.disabled = true;
  musicToggle.textContent = 'Nhạc chưa tải được';
  musicStatus.textContent = code === 153
    ? 'Trình duyệt đang chặn thông tin trang nguồn. Em có thể nghe từ 2:06 bằng liên kết YouTube bên dưới.'
    : 'Em có thể nhấn “Nghe trên YouTube” để nghe bài hát từ 2:06 nhé.';
}

let musicLoadTimeout;

window.onYouTubeIframeAPIReady = () => {
  // Set the referrer policy before loading the iframe, so the first request identifies this page.
  const frame = document.createElement('iframe');
  frame.id = 'musicPlayer';
  frame.title = 'Hối hận trong anh — Tuấn Hưng';
  frame.referrerPolicy = 'strict-origin-when-cross-origin';
  frame.allow = 'autoplay; encrypted-media; fullscreen; picture-in-picture';
  frame.allowFullscreen = true;
  const embedUrl = new URL('https://www.youtube.com/embed/0IOeflQmFYI');
  embedUrl.search = new URLSearchParams({
    enablejsapi: '1', playsinline: '1', start: String(chorusStart),
    rel: '0', controls: '1', origin: window.location.origin
  }).toString();
  frame.src = embedUrl.href;
  document.getElementById('musicPlayer').replaceWith(frame);
  musicPlayer = new YT.Player('musicPlayer', {
    events: {
      onReady(event) {
        clearTimeout(musicLoadTimeout);
        musicReady = true;
        event.target.getIframe().title = 'Hối hận trong anh — Tuấn Hưng';
        musicToggle.disabled = false;
        musicToggle.textContent = 'Phát nhạc';
        if (musicRequested) playLetterMusic();
      },
      onStateChange(event) {
        const playing = event.data === YT.PlayerState.PLAYING;
        if (playing && !musicRequested) {
          event.target.pauseVideo();
          return;
        }
        musicToggle.textContent = playing ? 'Tạm dừng nhạc' : 'Phát nhạc';
        if (playing) musicStatus.textContent = 'Đang phát bài hát dành cho em.';
        if (event.data === YT.PlayerState.PAUSED) musicStatus.textContent = 'Nhạc đang tạm dừng.';
        if (event.data === YT.PlayerState.ENDED) musicStatus.textContent = 'Nhấn “Phát nhạc” để nghe lại từ 2:06.';
      },
      onAutoplayBlocked() {
        musicStatus.textContent = 'Chạm “Phát nhạc” hoặc nút phát trong video để nghe cùng anh nhé.';
      },
      onError(event) {
        clearTimeout(musicLoadTimeout);
        showMusicError(event.data);
      }
    }
  });
};

musicToggle.addEventListener('click', () => {
  if (!musicReady) return;
  if (musicPlayer.getPlayerState() === YT.PlayerState.PLAYING) {
    musicPlayer.pauseVideo();
    return;
  }
  if (musicPlayer.getPlayerState() === YT.PlayerState.ENDED) {
    musicPlayer.seekTo(chorusStart, true);
  }
  musicPlayer.unMute();
  musicPlayer.playVideo();
});

const musicApi = document.createElement('script');
musicApi.src = 'https://www.youtube.com/iframe_api';
musicApi.async = true;
musicApi.addEventListener('error', () => {
  clearTimeout(musicLoadTimeout);
  showMusicError();
});
if (window.location.protocol === 'http:' || window.location.protocol === 'https:') {
  musicLoadTimeout = window.setTimeout(showMusicError, 20000);
  document.head.appendChild(musicApi);
} else {
  document.querySelector('.music-player').hidden = true;
  musicToggle.textContent = 'Mở bản web để nghe nhạc';
  musicStatus.textContent = 'Bản xem từ tệp trên máy không phát được YouTube. Hãy mở trang bằng địa chỉ web, hoặc nghe qua liên kết YouTube.';
}

function resetTimeButton() {
  timeButton.classList.remove('escaping');
  timeButton.style.removeProperty('left');
  timeButton.style.removeProperty('top');
  timeButton.style.removeProperty('width');
}

function dodgeTimeButton(event) {
  event.preventDefault();
  event.stopPropagation();
  const bounds = letterModal.getBoundingClientRect();
  const width = Math.min(timeButton.offsetWidth, 200, bounds.width - 32);
  const height = timeButton.offsetHeight;
  const current = timeButton.getBoundingClientRect();
  const pointerX = event.clientX ?? current.left + current.width / 2;
  const pointerY = event.clientY ?? current.top + current.height / 2;
  const left = Math.max(0, bounds.left) + 16;
  const top = Math.max(0, bounds.top) + 60;
  const right = Math.max(left, Math.min(window.innerWidth, bounds.right) - width - 16);
  const bottom = Math.max(top, Math.min(window.innerHeight, bounds.bottom) - height - 16);
  const yesBounds = yesButton.getBoundingClientRect();
  const candidates = [];

  // Include every corner so a distant escape remains available on small screens.
  for (const x of [left, (left + right) / 2, right]) {
    for (const y of [top, (top + bottom) / 2, bottom]) {
      const overlapsYes = x < yesBounds.right + 8 && x + width > yesBounds.left - 8 &&
        y < yesBounds.bottom + 8 && y + height > yesBounds.top - 8;
      if (!overlapsYes) candidates.push({ x, y });
    }
  }
  candidates.sort((a, b) => {
    const distanceA = Math.hypot(a.x + width / 2 - pointerX, a.y + height / 2 - pointerY);
    const distanceB = Math.hypot(b.x + width / 2 - pointerX, b.y + height / 2 - pointerY);
    return distanceB - distanceA;
  });
  const destination = candidates[0] ?? { x: left, y: top };
  timeButton.style.width = `${width}px`;
  timeButton.style.left = `${destination.x}px`;
  timeButton.style.top = `${destination.y}px`;
  timeButton.classList.add('escaping');
}

timeButton.addEventListener('pointerenter', dodgeTimeButton);
timeButton.addEventListener('pointerdown', dodgeTimeButton);
timeButton.addEventListener('click', dodgeTimeButton);
timeButton.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' || event.key === ' ') dodgeTimeButton(event);
});
window.addEventListener('resize', resetTimeButton);
letterModal.addEventListener('scroll', resetTimeButton);

function openLetter(event) {
  if (opening || letterModal.open) return;
  opening = true;
  // Keep playback in the opening gesture for mobile browsers.
  playLetterMusic();
  lastOpener = event.currentTarget;
  envelopeButton.classList.add('opening');
  window.setTimeout(() => {
    letterModal.showModal();
    document.body.style.overflow = 'hidden';
    letterModal.scrollTop = 0;
    closeButton.focus({ preventScroll: true });
    opening = false;
  }, reducedMotion.matches ? 0 : 650);
}

envelopeButton.addEventListener('click', openLetter);
openTextButton.addEventListener('click', openLetter);
closeButton.addEventListener('click', () => letterModal.close());
letterModal.addEventListener('click', (event) => {
  if (event.target !== letterModal) return;
  const bounds = letterModal.getBoundingClientRect();
  if (event.clientX < bounds.left || event.clientX > bounds.right ||
      event.clientY < bounds.top || event.clientY > bounds.bottom) {
    letterModal.close();
  }
});
letterModal.addEventListener('close', () => {
  musicRequested = false;
  if (musicReady) musicPlayer.pauseVideo();
  resetTimeButton();
  clearTimeout(celebrationTimer);
  letterModal.querySelector('.flower-garden')?.remove();
  document.body.style.overflow = '';
  envelopeButton.classList.remove('opening');
  lastOpener.focus({ preventScroll: true });
});

function showReply(title, message) {
  const heading = document.createElement('strong');
  heading.textContent = title;
  reply.replaceChildren(heading, document.createTextNode(message));
  reply.hidden = false;
  reply.scrollIntoView({ behavior: reducedMotion.matches ? 'instant' : 'smooth', block: 'nearest' });
}

yesButton.addEventListener('click', () => {
  resetTimeButton();
  showReply('Thương em nhất, Thảo Nhi.', 'Gửi em một vườn hoa và một cái ôm thật chặt. Anh sẽ chăm chút cho tình yêu của chúng mình bằng những điều nhỏ bé mỗi ngày.');
  celebrate();
});

function celebrate() {
  clearTimeout(celebrationTimer);
  letterModal.querySelector('.flower-garden')?.remove();
  const garden = document.createElement('div');
  garden.className = 'flower-garden';
  garden.setAttribute('aria-hidden', 'true');

  for (let i = 0; i < 18; i++) {
    const flower = document.createElement('span');
    flower.className = `flower ${i % 2 === 0 ? 'tulip' : 'rose'}`;
    flower.style.left = `${2 + i * 96 / 17}%`;
    flower.style.setProperty('--height', `${100 + Math.random() * 140}px`);
    flower.style.setProperty('--delay', `${i * .09}s`);
    flower.style.setProperty('--lean', `${Math.random() * 20 - 10}deg`);
    flower.style.setProperty('--hue', `${i % 3 * 12 - 12}deg`);
    flower.innerHTML = '<span class="flower-stem"></span><span class="flower-leaf leaf-left"></span><span class="flower-leaf leaf-right"></span><span class="flower-head"><span class="petal petal-one"></span><span class="petal petal-two"></span><span class="petal petal-three"></span><span class="petal petal-four"></span><span class="petal petal-five"></span></span>';
    garden.appendChild(flower);
  }
  for (let i = 0; i < 28; i++) {
    const petal = document.createElement('span');
    petal.className = 'falling-petal';
    petal.style.left = `${Math.random() * 100}%`;
    petal.style.setProperty('--delay', `${Math.random() * 3}s`);
    petal.style.setProperty('--drift', `${Math.random() * 140 - 70}px`);
    garden.appendChild(petal);
  }
  letterModal.appendChild(garden);
  celebrationTimer = window.setTimeout(() => {
    garden.remove();
  }, 12000);
}

function spawnHeart() {
  if (reducedMotion.matches || document.hidden || letterModal.open) return;
  const heart = document.createElement('span');
  heart.className = 'particle';
  heart.textContent = '♡';
  heart.style.left = `${Math.random() * 100}%`;
  heart.style.fontSize = `${12 + Math.random() * 12}px`;
  particles.appendChild(heart);
  window.setTimeout(() => heart.remove(), 12000);
}
spawnHeart();
window.setInterval(spawnHeart, 2400);
