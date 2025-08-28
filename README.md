# El Asado Party — Sitio estático

## Diseño general

Colores:

Fondo principal: celeste degradado a blanco.

Secciones destacadas: azul oscuro (#0033A0) con acentos en amarillo (#FFD100).

Texto principal: negro, con títulos en fuente impactante y dinámica (tipo Tango Sans o Anton de Google Fonts).

Estructura modular (scroll fluido con animaciones):

Inicio (Hero con video de fondo)

Video de asado + fiesta de fondo (autoplay, mute, loop).

Logo + breve descripción “Somos El Asado Party, el festival que une música, cultura y el mejor asado argentino en Colombia.”

Botón CTA: “Reserva tu cupo”.

Próximos eventos

Cards con fecha, lugar y precio.

Botón para “Comprar Entradas” (redirección externa).

Botón “Inscribite” que lleva a un formulario en otra página (formulario + pasarela simulada para Nequi/Daviplata con QR).

Reseñas y comunidad

Carrusel de reseñas de asistentes con foto de perfil.

Integración de comentarios/reviews (mock con datos, pero puedes luego incrustar IG/TikTok/Facebook).

Sobre nosotros (cultura argentina)

Texto con descripciones llamativas: música, asado, comunidad.

Imágenes en mosaico (parrilla, banderas, artistas, público).

Instagram dinámico

Carrusel de reels embebidos con los links que me pasaste.

Estilo full screen horizontal scroll con autoplay.

Footer

Datos de contacto (WhatsApp organizadores).

Botón a IG principal.

Créditos + aviso de compra de dominio futuro.

## Funcionalidad

Responsivo (Bootstrap 5 o Tailwind).

Formulario de inscripción:

Nombre, correo, teléfono, cantidad de entradas, opción de plan (Asado, Asado + Choripán, Solo Fiesta).

Simulación de pasarela: tras enviar datos, genera QR único (ejemplo: con librería qrcode.js).

Mensaje de confirmación + recordatorio de enviar comprobante por WhatsApp.

GitHub Pages:

La página se despliega con gh-pages.

Te preparo el repositorio con index.html, eventos.html (formulario y pago), style.css y app.js.
