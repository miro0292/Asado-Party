# Cómo cargar fotos al carrusel
- Opción A: editá `data/gallery.csv` y agregá filas con `url,title,caption`.
- Opción B (recomendada): armá un Google Sheets con esas mismas columnas, **Publicá** como CSV y pegá el link en `js/gallery.js` (const `GALLERY_CSV_URL`).
- Para Google Drive: copiá el link de cada **archivo** (no carpeta). El script convierte el link a descarga directa automáticamente.
