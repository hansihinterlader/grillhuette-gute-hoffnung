document.addEventListener('DOMContentLoaded', () => {
  AOS.init({ duration: 700, once: true, easing: 'ease-out-cubic', offset: 60 });
});

const nav = document.getElementById('siteNav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 50);
  document.getElementById('scrollHint').style.opacity = window.scrollY > 80 ? '0' : '1';
}, { passive: true });

const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('navLinks');
hamburger.addEventListener('click', () => navLinks.classList.toggle('open'));
navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => navLinks.classList.remove('open')));

(function heroSlider() {
  const slides = document.querySelectorAll('.hero-slide');
  let cur = 0;
  setInterval(() => {
    slides[cur].classList.remove('active');
    cur = (cur + 1) % slides.length;
    slides[cur].classList.add('active');
  }, 5000);
})();

(function initParticles() {
  const canvas = document.getElementById('particles');
  const ctx = canvas.getContext('2d');
  let W, H, particles = [];
  function resize() { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; }
  resize();
  window.addEventListener('resize', resize, { passive: true });
  const COLORS = ['rgba(255,122,24,','rgba(74,222,128,','rgba(255,179,71,'];
  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x = Math.random()*W; this.y = Math.random()*H;
      this.r = Math.random()*1.8+0.3;
      this.vx = (Math.random()-.5)*.25; this.vy = (Math.random()-.5)*.25;
      this.c = COLORS[Math.floor(Math.random()*COLORS.length)];
      this.a = Math.random()*.5+.1;
    }
    update() { this.x+=this.vx; this.y+=this.vy; if(this.x<0||this.x>W||this.y<0||this.y>H) this.reset(); }
    draw() { ctx.beginPath(); ctx.arc(this.x,this.y,this.r,0,Math.PI*2); ctx.fillStyle=this.c+this.a+')'; ctx.fill(); }
  }
  for(let i=0;i<120;i++) particles.push(new Particle());
  function loop() { ctx.clearRect(0,0,W,H); particles.forEach(p=>{p.update();p.draw();}); requestAnimationFrame(loop); }
  loop();
})();

const lightbox = document.getElementById('lightbox');
const lbImg = document.getElementById('lbImg');
let lbItems = [], lbIdx = 0;
function openLightbox(el) {
  const all = Array.from(document.querySelectorAll('.gal-item'));
  lbItems = all.map(i => i.querySelector('img').src);
  lbIdx = all.indexOf(el);
  lbImg.src = lbItems[lbIdx];
  lightbox.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeLightbox() { lightbox.classList.remove('open'); document.body.style.overflow = ''; }
function lbNav(dir) { lbIdx = (lbIdx+dir+lbItems.length)%lbItems.length; lbImg.src = lbItems[lbIdx]; }
document.addEventListener('keydown', e => {
  if (!lightbox.classList.contains('open')) return;
  if (e.key==='Escape') closeLightbox();
  if (e.key==='ArrowLeft') lbNav(-1);
  if (e.key==='ArrowRight') lbNav(1);
});

// ── Buchungsformular ──────────────────────────────────────────────
const bookingForm = document.getElementById('bookingForm');
const formStatus  = document.getElementById('formStatus');
bookingForm.addEventListener('submit', async e => {
  e.preventDefault();
  const btn = bookingForm.querySelector('button[type=submit]');
  btn.disabled = true; btn.textContent = 'Wird gesendet...';
  formStatus.style.color = '#9dbdac';
  formStatus.textContent = 'Deine Anfrage wird übermittelt...';
  try {
    const res = await fetch('/api/booking', {
      method: 'POST',
      body: new FormData(bookingForm),
      headers: { 'Accept': 'application/json' }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Fehler beim Senden');

    // WhatsApp Text vorbereiten
    const waText = `Hallo! Ich habe gerade eine Buchungsanfrage über die Website geschickt.

👤 Name: ${bookingForm.querySelector('[name=name]').value}
📅 Datum: ${bookingForm.querySelector('[name=date]').value}
👥 Personen: ${bookingForm.querySelector('[name=guests]').value}
🎉 Anlass: ${bookingForm.querySelector('[name=occasion]').value}
📞 Telefon: ${bookingForm.querySelector('[name=phone]').value}`;

    const waUrl = `https://wa.me/4915560562116?text=${encodeURIComponent(waText)}`;

    formStatus.style.color = '#4ade80';
    formStatus.innerHTML = `
      ✅ Anfrage eingegangen! Wir melden uns bald.<br><br>
      <a href="${waUrl}" target="_blank" style="display:inline-flex;align-items:center;gap:8px;padding:12px 20px;background:#25D366;color:#fff;border-radius:14px;font-weight:700;text-decoration:none">
        💬 Zusätzlich per WhatsApp bestätigen
      </a>`;

    bookingForm.reset();
  } catch(err) {
    formStatus.style.color = '#ff7a18';
    formStatus.textContent = '⚠️ ' + (err.message || 'Leider ein Problem aufgetreten.');
  } finally {
    btn.disabled = false; btn.textContent = 'Anfrage senden 🚀';
  }
});

// ── Gästebuch ─────────────────────────────────────────────────────
let currentRating = 5;
const stars = document.querySelectorAll('#starRating span');
stars.forEach(star => {
  star.addEventListener('mouseover', () => stars.forEach(s => s.classList.toggle('active', +s.dataset.v <= +star.dataset.v)));
  star.addEventListener('click', () => { currentRating = +star.dataset.v; stars.forEach(s => s.classList.toggle('active', +s.dataset.v <= currentRating)); });
});
document.getElementById('starRating').addEventListener('mouseleave', () => stars.forEach(s => s.classList.toggle('active', +s.dataset.v <= currentRating)));
stars.forEach(s => s.classList.toggle('active', +s.dataset.v <= currentRating));

const GB_KEY = 'gh_guestbook_v1';
const gbForm = document.getElementById('gbForm');
const gbStatus = document.getElementById('gbStatus');
const gbEntries = document.getElementById('gbEntries');
const DEMO_ENTRIES = [
  { name: 'Familie Schneider', occasion: 'Kindergeburtstag', rating: 5, text: 'Absolute Traumlage! Die Kinder haben die Seilbahn geliebt und wir Erwachsenen haben gechillt. Nächstes Jahr buchen wir wieder!', date: '2025-08-14' },
  { name: 'Kegelclub Blau-Weiß', occasion: 'Vereinsfeier', rating: 5, text: 'Bestens geeignet für unsere Gruppe von 35 Leuten. Viel Platz, tolle Atmosphäre und der Wald direkt dran ist einfach klasse.', date: '2025-07-03' },
  { name: 'Verena M.', occasion: 'Geburtstag', rating: 4, text: 'Super Hütte, wunderschöne Natur. Feuerholz nicht vergessen – wir waren kurz überrascht, aber dann wurde es trotzdem ein Hammer Abend!', date: '2025-06-21' },
];
function loadEntries() { const s = localStorage.getItem(GB_KEY); return s ? JSON.parse(s) : [...DEMO_ENTRIES]; }
function saveEntries(arr) { localStorage.setItem(GB_KEY, JSON.stringify(arr)); }
function starsHtml(n) { return '★'.repeat(n)+'☆'.repeat(5-n); }
function renderEntries() {
  const entries = loadEntries();
  if (!entries.length) { gbEntries.innerHTML = '<div class="gb-empty">Noch keine Einträge – sei der Erste! 🎉</div>'; return; }
  gbEntries.innerHTML = entries.slice().reverse().map(e => `
    <div class="gb-entry">
      <div class="gb-entry-head">
        <div><div class="gb-name">${e.name}</div><div class="gb-occasion">${e.occasion||''}</div></div>
        <div class="gb-stars">${starsHtml(e.rating)}</div>
      </div>
      <div class="gb-text">${e.text}</div>
      <div class="gb-date">${new Date(e.date).toLocaleDateString('de-DE',{year:'numeric',month:'long',day:'numeric'})}</div>
    </div>`).join('');
}
gbForm.addEventListener('submit', e => {
  e.preventDefault();
  const name = document.getElementById('gbName').value.trim();
  const occasion = document.getElementById('gbOccasion').value.trim();
  const message = document.getElementById('gbMessage').value.trim();
  if (!name||!message) { gbStatus.style.color='#ff7a18'; gbStatus.textContent='⚠️ Bitte Name und Nachricht ausfüllen.'; return; }
  const entries = loadEntries();
  entries.push({ name, occasion, rating: currentRating, text: message, date: new Date().toISOString().split('T')[0] });
  saveEntries(entries);
  renderEntries();
  gbForm.reset();
  currentRating = 5;
  stars.forEach(s => s.classList.toggle('active', +s.dataset.v <= 5));
  gbStatus.style.color = '#4ade80';
  gbStatus.textContent = '✅ Danke für deinen Eintrag! 🎉';
  setTimeout(() => { gbStatus.textContent = ''; }, 4000);
});
renderEntries();
