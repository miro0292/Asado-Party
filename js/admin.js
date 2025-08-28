// admin.js — requires GAS backend configured with token-based auth
const GAS_ENDPOINT = ""; // same as reservas_backend.js
const ADMIN_TOKEN = "";  // set a secret token, validated server-side

const $ = (s) => document.querySelector(s);
const tbody = $("#tablaAdmin tbody");
const btnRefresh = $("#btnRefresh");
const btnExport = $("#btnExport");

function currency(n){ return new Intl.NumberFormat("es-CO",{style:"currency",currency:"COP",maximumFractionDigits:0}).format(n); }

async function fetchAll(){
  if(!GAS_ENDPOINT) { tbody.innerHTML = `<tr><td colspan="11" class="text-center text-muted">Sin backend configurado</td></tr>`; return []; }
  const r = await fetch(GAS_ENDPOINT + "?action=list&type=reserva&token=" + encodeURIComponent(ADMIN_TOKEN));
  if(!r.ok) throw new Error("HTTP "+r.status);
  const data = await r.json();
  return data.items || [];
}

async function removeItem(id){
  if(!confirm("¿Eliminar esta reserva?")) return;
  const r = await fetch(GAS_ENDPOINT, {
    method:"POST",
    headers: { "Content-Type":"application/json" },
    body: JSON.stringify({ action:"delete", type:"reserva", id, token: ADMIN_TOKEN })
  });
  if(!r.ok) { alert("Error eliminando"); return; }
  await load();
}

function render(items){
  tbody.innerHTML = "";
  items.forEach(it => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${new Date(it.fecha).toLocaleString()}</td>
      <td>${it.nombre}</td>
      <td><a href="https://wa.me/57${(it.telefono||'').replace(/\D/g,'')}" target="_blank">${it.telefono||""}</a></td>
      <td>${it.correo||""}</td>
      <td>${it.tipo_txt||""}</td>
      <td class="text-center">${it.personas||1}</td>
      <td>${currency(it.total||0)}</td>
      <td>${currency(it.pagado||0)}</td>
      <td>${currency(it.pendiente||0)}</td>
      <td>${it.comentarios||""}</td>
      <td><button class="btn btn-sm btn-outline-danger" data-id="${it.id}">Eliminar</button></td>
    `;
    tbody.appendChild(tr);
  });
}

async function load(){
  try{
    const items = await fetchAll();
    render(items);
  }catch(e){
    console.error(e);
    tbody.innerHTML = `<tr><td colspan="11" class="text-center text-danger">Error cargando datos</td></tr>`;
  }
}

tbody.addEventListener("click", (e)=>{
  const id = e.target.getAttribute("data-id");
  if(id) removeItem(id);
});

btnRefresh.addEventListener("click", load);
btnExport.addEventListener("click", async ()=>{
  const items = await fetchAll();
  if(!items.length) return alert("Sin datos");
  const headers = ["fecha","nombre","telefono","correo","tipo_txt","personas","total","pagado","pendiente","comentarios"];
  const rows = items.map(r => [r.fecha,r.nombre,r.telefono,r.correo,r.tipo_txt,r.personas,r.total,r.pagado,r.pendiente, `"${(r.comentarios||'').replace(/"/g,'""')}"`].join(","));
  const csv = [headers.join(","), ...rows].join("\n");
  const blob = new Blob([csv], { type:"text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "reservas_admin.csv";
  a.click();
  URL.revokeObjectURL(url);
});

load();


// --- Importar desde Excel/CSV o Google Sheets CSV ---
const fileInput = document.getElementById("fileInput");
const sheetUrl = document.getElementById("sheetUrl");
const btnLoadSheet = document.getElementById("btnLoadSheet");
const btnPushBackend = document.getElementById("btnPushBackend");

function normalizeRow(r){
  // intenta mapear columnas típicas
  return {
    fecha: r.fecha || r.Fecha || r.date || new Date().toISOString(),
    nombre: r.nombre || r.Nombre || r.name || "",
    telefono: r.telefono || r.Teléfono || r.phone || "",
    correo: r.correo || r.Email || r.email || "",
    tipo_txt: r.tipo_txt || r.Tipo || r.entrada || "",
    personas: parseInt(r.personas || r.Personas || r.cantidad || 1, 10),
    total: parseInt(r.total || r.Total || 0, 10),
    pagado: parseInt(r.pagado || r.Pagado || 0, 10),
    pendiente: parseInt(r.pendiente || r.Pendiente || 0, 10),
    comentarios: r.comentarios || r.Observaciones || r.comentario || ""
  };
}

function renderPreview(rows){
  if(!rows.length){ alert("No se encontraron filas"); return; }
  render(rows.map(r => ({...r, id: r.id || ""}))); // reuse existing table render
}

fileInput.addEventListener("change", () => {
  const file = fileInput.files[0];
  if(!file) return;
  const reader = new FileReader();
  reader.onload = (e)=>{
    const data = new Uint8Array(e.target.result);
    const wb = XLSX.read(data, { type: 'array' });
    const wsname = wb.SheetNames[0];
    const ws = wb.Sheets[wsname];
    const json = XLSX.utils.sheet_to_json(ws);
    const rows = json.map(normalizeRow);
    renderPreview(rows);
    fileInput.value = "";
  };
  reader.readAsArrayBuffer(file);
});

btnLoadSheet.addEventListener("click", async ()=>{
  const url = sheetUrl.value.trim();
  if(!url) return alert("Pegá la URL publicada (CSV) de Google Sheets.");
  try{
    const r = await fetch(url);
    const text = await r.text();
    // naive CSV
    const lines = text.trim().split(/\r?\n/);
    const headers = lines.shift().split(",");
    const rows = lines.map(line => {
      const cells = line.split(",");
      const obj = {};
      headers.forEach((h,i)=> obj[h.trim()] = (cells[i]||"").trim());
      return normalizeRow(obj);
    });
    renderPreview(rows);
  }catch(e){
    alert("Error leyendo Sheet: " + e);
  }
});

btnPushBackend.addEventListener("click", async ()=>{
  if(!GAS_ENDPOINT) return alert("Configurá el GAS_ENDPOINT primero.");
  const trs = Array.from(tbody.querySelectorAll("tr"));
  if(!trs.length) return alert("No hay datos para subir.");
  let ok = 0;
  for(const tr of trs){
    const tds = tr.querySelectorAll("td");
    const row = {
      fecha: new Date(tds[0].textContent).toISOString(),
      nombre: tds[1].textContent,
      telefono: tds[2].textContent,
      correo: tds[3].textContent,
      tipo_txt: tds[4].textContent,
      personas: parseInt(tds[5].textContent||"1",10),
      total: parseInt(tds[6].textContent.replace(/[^\d]/g,''),10)||0,
      pagado: parseInt(tds[7].textContent.replace(/[^\d]/g,''),10)||0,
      pendiente: parseInt(tds[8].textContent.replace(/[^\d]/g,''),10)||0,
      comentarios: tds[9].textContent
    };
    const r = await fetch(GAS_ENDPOINT, {
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body: JSON.stringify({ action:"create", type:"reserva", payload: row, token: ADMIN_TOKEN })
    });
    if(r.ok) ok++;
  }
  alert(`Subida completa: ${ok} filas`);
});
