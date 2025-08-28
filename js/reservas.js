// reservas.js
const $ = (sel) => document.querySelector(sel);
const tablaBody = $("#tablaReservas tbody");
const form = $("#reservaForm");
const resumen = $("#calcResumen");
const btnExport = $("#btnExport");
const btnClear = $("#btnClear");

const KEY = "asado_reservas_v1";

function currency(n) {
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(n);
}

function load() {
  try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; }
}

function save(arr) {
  localStorage.setItem(KEY, JSON.stringify(arr));
}

function calcResumen() {
  const personas = parseInt(form.personas.value || "1", 10);
  const precio = parseInt(form.tipo.value, 10);
  const total = personas * precio;
  const pagado = parseInt(form.pagado.value || "0", 10);
  const pendiente = Math.max(total - pagado, 0);
  resumen.textContent = `Total: ${currency(total)} | Pagado: ${currency(pagado)} | Pendiente: ${currency(pendiente)}`;
}

function render() {
  const data = load();
  tablaBody.innerHTML = "";
  data.forEach((r, i) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${new Date(r.fecha).toLocaleString()}</td>
      <td>${r.nombre}</td>
      <td><a href="https://wa.me/57${(r.telefono || '').replace(/\D/g,'')}" target="_blank">${r.telefono || ""}</a></td>
      <td>${r.tipo_txt}</td>
      <td class="text-center">${r.personas}</td>
      <td>${currency(r.total)}</td>
      <td>${currency(r.pagado)}</td>
      <td>${currency(r.pendiente)}</td>
      <td>${r.comentarios || ""}</td>
      <td class="text-end">
        <button class="btn btn-sm btn-outline-danger" data-del="${i}">Eliminar</button>
      </td>
    `;
    tablaBody.appendChild(tr);
  });
}

form.addEventListener("input", calcResumen);

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const personas = parseInt(form.personas.value || "1", 10);
  const precio = parseInt(form.tipo.value, 10);
  const total = personas * precio;
  const pagado = parseInt(form.pagado.value || "0", 10);
  const pendiente = Math.max(total - pagado, 0);

  const tipo_txt = form.tipo.selectedOptions[0].textContent;

  const record = {
    fecha: Date.now(),
    nombre: form.nombre.value.trim(),
    telefono: form.telefono.value.trim(),
    correo: form.correo.value.trim(),
    personas,
    tipo: precio,
    tipo_txt,
    total,
    pagado,
    pendiente,
    comentarios: form.comentarios.value.trim()
  };

  const data = load();
  data.unshift(record);
  save(data);
  render();
  form.reset();
  form.personas.value = 1;
  calcResumen();
  alert("Reserva guardada localmente ✅\nRecordá enviar el comprobante por WhatsApp.");
});

tablaBody.addEventListener("click", (e) => {
  const idx = e.target.getAttribute("data-del");
  if (idx !== null) {
    const data = load();
    data.splice(parseInt(idx,10), 1);
    save(data);
    render();
  }
});

btnClear.addEventListener("click", () => {
  if (confirm("¿Borrar todas las reservas guardadas localmente?")) {
    localStorage.removeItem(KEY);
    render();
  }
});

btnExport.addEventListener("click", () => {
  const data = load();
  if (!data.length) return alert("No hay datos para exportar.");
  const headers = ["fecha","nombre","telefono","correo","personas","tipo_txt","total","pagado","pendiente","comentarios"];
  const rows = data.map(r => [new Date(r.fecha).toISOString(), r.nombre, r.telefono, r.correo, r.personas, r.tipo_txt, r.total, r.pagado, r.pendiente, `"${(r.comentarios||'').replace(/"/g,'""')}"`].join(","));
  const csv = [headers.join(","), ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "reservas_asado.csv";
  a.click();
  URL.revokeObjectURL(url);
});

// init
calcResumen();
render();
