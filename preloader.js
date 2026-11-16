document.addEventListener('DOMContentLoaded', () => {
    const preloader = document.getElementById('preloader');
    const barFill = document.querySelector('.preloader-bar-fill');
    const statusText = document.querySelector('.preloader-status');

    // ==========================================
    // CONFIGURACIÓN DE TIEMPOS
    // ==========================================
    const TIEMPO_ESPERA_FINAL = 3000; // Tiempo en milisegundos tras cargar (3000 ms = 3 segundos)
    const VELOCIDAD_BARRA = 150;     // Tiempo entre incrementos de la barra (mayor número = más lento)

    let progress = 0;

    // Incremento progresivo de la barra de carga
    const interval = setInterval(() => {
        if (progress < 90) {
            progress += Math.random() * 3 + 1; // Avance de la barra en pasos más pequeños
            if (progress > 90) progress = 90;
            if (barFill) barFill.style.width = `${progress}%`;
        }
    }, VELOCIDAD_BARRA);

    const ocultarPreloader = () => {
        clearInterval(interval);
        if (barFill) barFill.style.width = '100%';
        if (statusText) statusText.textContent = 'SISTEMA LISTO';

        // Pausa configurada antes de ocultar la pantalla de carga
        setTimeout(() => {
            if (preloader) {
                preloader.classList.add('preloader-hidden');
            }
        }, TIEMPO_ESPERA_FINAL);
    };

    if (document.readyState === 'complete') {
        ocultarPreloader();
    } else {
        window.addEventListener('load', ocultarPreloader);
    }
});