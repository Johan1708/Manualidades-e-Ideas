// 1. GENERADOR DE LLUVIA DE PÉTALOS
function crearLluviaDePetalos() {
    const contenedor = document.getElementById('petalos-container');
    const cantidadPetalos = 35; // Cuántos pétalos quieres en pantalla

    for (let i = 0; i < cantidadPetalos; i++) {
        let petalo = document.createElement('div');
        petalo.classList.add('petalo-cae');
        
        // Posición horizontal aleatoria (de 0% a 100% de la pantalla)
        petalo.style.left = Math.random() * 100 + 'vw';
        
        // Tiempo que tarda en caer (entre 5 y 10 segundos para variar)
        let duracionCaida = Math.random() * 5 + 5; 
        
        // Retraso para que no caigan todos al mismo tiempo
        let retraso = Math.random() * 5; 
        
        petalo.style.animationDuration = duracionCaida + 's';
        petalo.style.animationDelay = retraso + 's';
        
        // Variar un poco el tamaño de los pétalos
        let tamaño = Math.random() * 0.5 + 0.8;
        petalo.style.transform = `scale(${tamaño})`;

        contenedor.appendChild(petalo);
    }
}
// Ejecutar los pétalos al cargar
crearLluviaDePetalos();

// 2. EFECTO MÁQUINA DE ESCRIBIR
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

// 3. SISTEMA DE FILTROS PARA LAS TARJETAS-ROSA
function inicializarFiltros(contenedorFiltrosId, contenedorCarruselId) {
    const contenedorFiltros = document.getElementById(contenedorFiltrosId);
    const carrusel = document.getElementById(contenedorCarruselId);
    
    if (!contenedorFiltros || !carrusel) return;

    const botones = contenedorFiltros.querySelectorAll('.btn-filtro');
    const tarjetas = carrusel.querySelectorAll('.card-rosa');

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