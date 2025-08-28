// gallery.js — carga imágenes/videos para el carrusel desde CSV local o Google Sheets (publicado como CSV)
/* Config:
   - Si tenés un Google Sheets "Publicar en la Web" como CSV, pegá el link acá:
*/
const GALLERY_CSV_URL = ""; // ej: https://docs.google.com/spreadsheets/d/e/.../pub?output=csv

function driveToDirect(u){
  try{
    const url = new URL(u);
    if(url.hostname.includes("drive.google.com")){
      // file/d/<ID>/view?...
      const m = url.pathname.match(/\/d\/([^/]+)/);
      if(m) return `https://drive.google.com/uc?export=download&id=${m[1]}`;
      // If it's already u?id=
      const id = url.searchParams.get("id");
      if(id) return `https://drive.google.com/uc?export=download&id=${id}`;
    }
  }catch(_){}
  return u;
}

function isVideo(u){ return /\.(mp4|webm|ogg)(\?|$)/i.test(u); }

function injectSlides(rows){
  const inner = document.querySelector("#mediaCarousel .carousel-inner");
  if(!inner) return;
  inner.innerHTML = "";
  rows.forEach((r, idx)=>{
    const url = driveToDirect((r.url||"").trim());
    const title = r.title || "";
    const caption = r.caption || "";
    const item = document.createElement("div");
    item.className = "carousel-item" + (idx===0?" active":"");
    if(isVideo(url)){
      item.innerHTML = `
        <video class="d-block w-100" controls poster="assets/img/hero-poster.png">
          <source src="${url}">
        </video>
        <div class="carousel-caption">${caption||title}</div>`;
    }else{
      item.innerHTML = `
        <img src="${url}" class="d-block w-100" alt="${title||'media'}">
        <div class="carousel-caption">${caption||title}</div>`;
    }
    inner.appendChild(item);
  });
}

function loadCSV(){
  const parse = (csvText)=>{
    // naive CSV parse fallback if Papa no carga
    if(typeof Papa === "undefined"){
      const lines = csvText.trim().split(/\r?\n/);
      const headers = lines.shift().split(",");
      return lines.map(line => {
        const cells = line.split(",");
        const obj = {};
        headers.forEach((h,i)=> obj[h.trim()] = (cells[i]||"").trim());
        return obj;
      });
    }else{
      const res = Papa.parse(csvText, { header:true });
      return res.data.filter(r=>r.url);
    }
  };
  const localFetch = fetch("data/gallery.csv").then(r=>r.text());
  const remoteFetch = GALLERY_CSV_URL ? fetch(GALLERY_CSV_URL).then(r=>r.text()) : null;

  (remoteFetch || localFetch).then(text => {
    const rows = parse(text);
    if(rows && rows.length) injectSlides(rows);
  }).catch(()=>{
    // fallback local
    localFetch.then(t=> injectSlides(parse(t)));
  });
}

// Carga PapaParse si no está
(function ensurePapa(){
  if(typeof Papa !== "undefined"){ loadCSV(); return; }
  const s = document.createElement("script");
  s.src = "https://cdn.jsdelivr.net/npm/papaparse@5.4.1/papaparse.min.js";
  s.onload = loadCSV;
  document.head.appendChild(s);
})();
