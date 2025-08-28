// comentarios.js
const KEY_PQR = "asado_pqr_v1";
const $ = (sel) => document.querySelector(sel);
const form = $("#pqrForm");
const list = $("#listaPqr");
const btnExport = $("#btnExportPqr");
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
    item.innerHTML = `
      <div class="d-flex w-100 justify-content-between">
        <h5 class="mb-1">${r.tipo} — ${r.nombre || "Anónimo"}</h5>
        <small>${new Date(r.fecha).toLocaleString()}</small>
      </div>
      <p class="mb-1">${"★".repeat(r.rating)}${"☆".repeat(5-r.rating)}</p>
      <p class="mb-1">${r.comentario}</p>
      <div class="text-end">
        <button class="btn btn-sm btn-outline-danger" data-del="${i}">Eliminar</button>
      </div>
    `;
    list.appendChild(item);
  });
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const record = {
    fecha: Date.now(),
    nombre: form.nombre.value.trim(),
    tipo: form.tipo.value,
    rating: currentRating,
    comentario: form.comentario.value.trim()
  };
  const data = load();
  data.unshift(record);
  save(data);
  form.reset();
  currentRating = 5;
  renderStars(currentRating);
  render();
  alert("Gracias por tu comentario 🙌");
});

list.addEventListener("click", (e) => {
  const idx = e.target.getAttribute("data-del");
  if (idx !== null) {
    const data = load();
    data.splice(parseInt(idx,10), 1);
    save(data);
    render();
  }
});

btnClear.addEventListener("click", () => {
  if (confirm("¿Borrar todos los comentarios locales?")) {
    localStorage.removeItem(KEY_PQR);
    render();
  }
});

btnExport.addEventListener("click", () => {
  const data = load();
  if (!data.length) return alert("No hay datos para exportar.");
  const headers = ["fecha","nombre","tipo","rating","comentario"];
  const rows = data.map(r => [new Date(r.fecha).toISOString(), r.nombre, r.tipo, r.rating, `"${(r.comentario||'').replace(/"/g,'""')}"`].join(","));
  const csv = [headers.join(","), ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "comentarios_asado.csv";
  a.click();
  URL.revokeObjectURL(url);
});

// init
render();
