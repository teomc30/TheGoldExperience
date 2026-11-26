window.APP_CONFIG = {
    // Cambia este número para forzar actualización en producción
    build: '20261126a',
    whatsappNumber: '51977676321'
};

// Respaldo: si una imagen no carga, muestra un marcador en lugar de un hueco roto.
document.addEventListener('error', (e) => {
    const img = e.target;
    if (img.tagName !== 'IMG' || img.dataset.fallback) return;
    img.dataset.fallback = '1';
    img.src = '/assets/images/sin-imagen.svg';
}, true);
