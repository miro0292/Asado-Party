// comentarios_v2.js
const KEY_PQR = "asado_pqr_v1";
const ADMIN_MODE = false; // simple flag

const $ = (sel) => document.querySelector(sel);
const form = $("#pqrForm");
const list = $("#listaPqr");
const btnClear = $("#btnClearPqr");
const ratingEl = $("#rating");
let currentRating = 5;

function load() {
  try { return JSON.parse(localStorage.getItem(KEY_PQR)) || []; } catch { return []; }
}
function save(arr) { localStorage.setItem(KEY_PQR, JSON.stringify(arr)); }

function renderStars(value=5) {
  ratingEl.innerHTML = "";
  for (let i = 1; i <= 5; i++) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.setAttribute("aria-label", `${i} estrellas`);
    btn.textContent = i <= value ? "★" : "☆";
    if (i <= value) btn.classList.add("active");
    btn.addEventListener("click", () => {
      currentRating = i;
      renderStars(currentRating);
    });
    ratingEl.appendChild(btn);
  }
}
renderStars(currentRating);

function render() {
  const data = load();
  list.innerHTML = "";
  data.forEach((r, i) => {
    const item = document.createElement("div");
    item.className = "list-group-item list-group-item-action";
    const insta = r.instagram ? `<a href="${r.instagram.startsWith('http')?r.instagram:`https://instagram.com/${r.instagram.replace(/^@/,'')}`}" target="_blank">${r.instagram}</a>` : "—";
    item.innerHTML = `
      <div class="d-flex w-100 justify-content-between">
        <h5 class="mb-1">${r.tipo} — ${r.nombre || "Anónimo"}</h5>
        <small>${new Date(r.fecha).toLocaleString()}</small>
      </div>
      <p class="mb-1">${"★".repeat(r.rating)}${"☆".repeat(5-r.rating)}</p>
      <p class="mb-1">${r.comentario}</p>
      <p class="mb-1"><strong>Instagram:</strong> ${insta}</p>
      <div class="text-end">
        ${ADMIN_MODE ? `<button class="btn btn-sm btn-outline-danger" data-del="${i}">Eliminar</button>` : ""}
      </div>
    `;
    list.appendChild(item);
  });

  // Admin-only controls
  }
render();

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const record = {
    fecha: Date.now(),
    nombre: form.nombre.value.trim(),
    tipo: form.tipo.value,
    rating: currentRating,
    comentario: form.comentario.value.trim(),
    instagram: form.instagram.value.trim()
  };
  const data = load();
  data.unshift(record);
  save(data);
  form.reset();
  currentRating = 5;
  renderStars(currentRating);
  render();
  alert("¡Gracias por tu comentario! 🙌");
});


