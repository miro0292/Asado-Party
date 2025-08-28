// Year
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// Mobile nav
document.querySelectorAll('.nav-toggle').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelector('.nav-menu')?.classList.toggle('open');
  });
});

// Simple sliders
function initSlider(root){
  const track = root.querySelector('.slider-track');
  const prev = root.querySelector('.prev');
  const next = root.querySelector('.next');
  const slides = root.querySelectorAll('.slide');
  let i = 0;
  const go = (n) => {
    i = (n + slides.length) % slides.length;
    track.style.transform = `translateX(-${i * 100}%)`;
  };
  prev?.addEventListener('click', () => go(i-1));
  next?.addEventListener('click', () => go(i+1));
  setInterval(() => go(i+1), 6000);
}
document.querySelectorAll('.slider').forEach(initSlider);

// Process Instagram embeds once
window.addEventListener('load', () => {
  if (window.instgrm && window.instgrm.Embeds) {
    window.instgrm.Embeds.process();
  }
});

// --- Eventos / QR ---
async function encryptToken(plainText, passphrase){
  const enc = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const keyMaterial = await crypto.subtle.importKey('raw', enc.encode(passphrase), 'PBKDF2', false, ['deriveKey']);
  const key = await crypto.subtle.deriveKey(
    {name:'PBKDF2', salt, iterations: 120000, hash:'SHA-256'},
    keyMaterial,
    {name:'AES-GCM', length:256},
    false,
    ['encrypt']
  );
  const cipher = await crypto.subtle.encrypt({name:'AES-GCM', iv}, key, enc.encode(plainText));
  const b64 = (buf)=> btoa(String.fromCharCode(...new Uint8Array(buf)));
  const tokenObj = { s: b64(salt), i: b64(iv), c: b64(cipher) };
  return btoa(JSON.stringify(tokenObj));
}

function buildQRUrl(data){
  const base = 'https://api.qrserver.com/v1/create-qr-code/';
  const url = `${base}?size=240x240&data=${encodeURIComponent(data)}`;
  return url;
}

const form = document.getElementById('inscripcionForm');
if (form){
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const payload = {
      nombre: fd.get('nombre'),
      correo: fd.get('correo'),
      telefono: fd.get('telefono'),
      cantidad: Number(fd.get('cantidad') || 1),
      plan: fd.get('plan'),
      pago: fd.get('pago'),
      evento: 'El Asado Party - 06/09 - Meeting House Bar',
      ts: new Date().toISOString()
    };
    localStorage.setItem('asadoPartyReserva', JSON.stringify(payload));
    const plain = JSON.stringify(payload);
    const passphrase = 'ASADO_PARTY_TOKEN_V1';
    const token = await encryptToken(plain, passphrase);
    const qrUrl = buildQRUrl(token);
    const card = document.querySelector('.qr-card');
    const img = document.getElementById('qrImg');
    const dl = document.getElementById('dlQR');
    const wa = document.getElementById('sendWA');
    const out = document.getElementById('tokenOut');
    if (img && dl && wa && out && card){
      img.src = qrUrl;
      dl.href = qrUrl;
      out.value = token;
      const msg = `Hola 👋, envío comprobante y mi token: ${encodeURIComponent(token)}. Reserva a nombre de ${encodeURIComponent(payload.nombre)}. Plan: ${payload.plan}. Cantidad: ${payload.cantidad}.`;
      wa.href = `https://wa.me/573122112949?text=${msg}`;
      card.classList.remove('hidden');
      window.scrollTo({top: card.offsetTop - 80, behavior: 'smooth'});
    }
  });
}
