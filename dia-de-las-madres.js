// 1. ANIMACIÓN DEL TEXTO EMOTIVO SOBRE EL VIDEO
const textoEmotivo = "Caminando hacia lo desconocido, con la única certeza de que cada esfuerzo construirá un horizonte brillante para quienes más ama.";
const elementoMensaje = document.getElementById("mensaje-animado");
let indice = 0;

function escribirTexto() {
    if (indice < textoEmotivo.length) {
        elementoMensaje.innerHTML += textoEmotivo.charAt(indice);
        indice++;
        setTimeout(escribirTexto, 40);
    }
}
setTimeout(escribirTexto, 1500);

// 2. LÓGICA DE LOS FILTROS
function inicializarFiltros(contenedorFiltrosId, contenedorCarruselId) {
    const contenedorFiltros = document.getElementById(contenedorFiltrosId);
    const carrusel = document.getElementById(contenedorCarruselId);
    
    if (!contenedorFiltros || !carrusel) return;

    const botones = contenedorFiltros.querySelectorAll('button');
    const tarjetas = carrusel.querySelectorAll('.brutal-card');

    botones.forEach(boton => {
        boton.addEventListener('click', () => {
            // Quitar clase active de todos los botones de este grupo
            botones.forEach(b => b.classList.remove('active'));
            // Agregar active al clickeado
            boton.classList.add('active');

            const filtro = boton.getAttribute('data-filter');

            // Filtrar las tarjetas
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

// Activar los 3 grupos de filtros
inicializarFiltros('filtros-manualidades', 'carrusel-manualidades');
inicializarFiltros('filtros-lugares', 'carrusel-lugares');
inicializarFiltros('filtros-regalos', 'carrusel-regalos');