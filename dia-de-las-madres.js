// Efecto Máquina de Escribir
const textoEmotivo = "Cada paso y sacrificio que dio, fue para construirte un horizonte brillante. Es momento de consentirla.";
const elementoMensaje = document.getElementById("mensaje-animado");
let indice = 0;

function escribirTexto() {
    if (indice < textoEmotivo.length) {
        elementoMensaje.innerHTML += textoEmotivo.charAt(indice);
        indice++;
        setTimeout(escribirTexto, 40);
    }
}
setTimeout(escribirTexto, 1200);

// Sistema de Filtros para múltiples categorías
function inicializarFiltros(contenedorFiltrosId, contenedorCarruselId) {
    const contenedorFiltros = document.getElementById(contenedorFiltrosId);
    const carrusel = document.getElementById(contenedorCarruselId);
    
    if (!contenedorFiltros || !carrusel) return;

    const botones = contenedorFiltros.querySelectorAll('.btn-filtro');
    const tarjetas = carrusel.querySelectorAll('.mom-card');

    botones.forEach(boton => {
        boton.addEventListener('click', () => {
            botones.forEach(b => b.classList.remove('active'));
            boton.classList.add('active');

            const filtro = boton.getAttribute('data-filter');

            tarjetas.forEach(tarjeta => {
                if (filtro === 'all' || tarjeta.getAttribute('data-price') === filtro) {
                    tarjeta.style.display = 'flex';
                } else {
                    tarjeta.style.display = 'none';
                }
            });
        });
    });
}

inicializarFiltros('filtros-manualidades', 'carrusel-manualidades');
inicializarFiltros('filtros-lugares', 'carrusel-lugares');
inicializarFiltros('filtros-regalos', 'carrusel-regalos');