// reservas_backend.js
// Configurá tu endpoint de Google Apps Script Web App (modo "Anyone with the link")
// Instrucciones en README. Dejá vacío para usar solo WhatsApp.
const GAS_ENDPOINT = ""; // ej: "https://script.google.com/macros/s/AKfycbx.../exec"

(function(){
  const form = document.getElementById("reservaForm");
  if(!form) return;

  async function postBackend(payload){
    if(!GAS_ENDPOINT) return { ok:false, reason:"No backend configured" };
    try{
      const r = await fetch(GAS_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type":"application/json" },
        body: JSON.stringify({ action:"create", type:"reserva", payload })
      });
      if(!r.ok) throw new Error("HTTP "+r.status);
      const data = await r.json().catch(()=> ({}));
      return { ok:true, data };
    }catch(e){
      console.warn("Backend error:", e);
      return { ok:false, reason:String(e) };
    }
  }

  function buildWhatsAppMessage(p){
    const tipoTxt = form.tipo.selectedOptions[0].textContent;
    return [
      "Hola! Quiero confirmar mi reserva para *El Asado Party*.",
      `- Nombre: ${p.nombre}`,
      `- Teléfono: ${p.telefono}`,
      `- Personas: ${p.personas}`,
      `- Tipo: ${tipoTxt}`,
      `- Total: ${p.total.toLocaleString("es-CO")}`,
      `- Pagado: ${p.pagado.toLocaleString("es-CO")}`,
      `- Pendiente: ${p.pendiente.toLocaleString("es-CO")}`,
      "",
      "Adjunto foto del comprobante ✅"
    ].join("\n");
  }

  form.addEventListener("submit", async (e)=>{
    e.preventDefault();
    const personas = parseInt(form.personas.value||"1",10);
    const precio = parseInt(form.tipo.value,10);
    const total = personas * precio;
    const pagado = parseInt(form.pagado.value||"0",10);
    const pendiente = Math.max(total - pagado, 0);

    const payload = {
      fecha: new Date().toISOString(),
      nombre: form.nombre.value.trim(),
      telefono: form.telefono.value.trim(),
      correo: form.correo.value.trim(),
      personas,
      tipo: precio,
      comentarios: form.comentarios.value.trim(),
      total, pagado, pendiente
    };

    // Try backend first (non-blocking)
    postBackend(payload);

    // Redirect to WhatsApp with prefilled message
    const msg = encodeURIComponent(buildWhatsAppMessage(payload));
    // Número principal de reservas (Emiliano)
    const phone = "573122112949";
    const url = `https://wa.me/${phone}?text=${msg}`;
    window.location.href = url;
  });
})();
