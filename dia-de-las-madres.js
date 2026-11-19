// 1. INICIALIZAR LLUVIA DE PÉTALOS
function crearLluviaDePetalos() {
    const contenedor = document.getElementById('petalos-container');
    if (!contenedor) return;
    const cantidadPetalos = 40;

    for (let i = 0; i < cantidadPetalos; i++) {
        let petalo = document.createElement('div');
        petalo.classList.add('petalo-cae');
        petalo.style.left = Math.random() * 100 + 'vw';
        let duracionCaida = Math.random() * 6 + 4; 
        let retraso = Math.random() * 5; 
        petalo.style.animationDuration = duracionCaida + 's';
        petalo.style.animationDelay = retraso + 's';
        let tamaño = Math.random() * 0.6 + 0.7;
        petalo.style.transform = `scale(${tamaño})`;
        contenedor.appendChild(petalo);
    }
}
crearLluviaDePetalos();

// 2. EFECTO MÁQUINA DE ESCRIBIR
const textoEmotivo = "Cada paso y sacrificio que dio, fue para construirte un horizonte brillante. Es momento de consentirla.";
const elementoMensaje = document.getElementById("mensaje-animado");
let indice = 0;

function escribirTexto() {
    if ( elementoMensaje && indice < textoEmotivo.length) {
        elementoMensaje.innerHTML += textoEmotivo.charAt(indice);
        indice++;
        setTimeout(escribirTexto, 40);
    }
}
// Iniciar después de que termine la intro del video y título
setTimeout(escribirTexto, 2000);


// 3. LÓGICA DE FILTROS
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


// 4. LÓGICA DE LA VENTANA EMERGENTE PREMIUM (MODAL PRO)
const modalPro = document.getElementById('modal-pasos');
const btnCerrarPro = document.getElementById('btn-cerrar-pro');
const modalTituloPro = document.getElementById('modal-titulo-pro');
const modalListaPro = document.getElementById('modal-lista-pro');
const botonesAbrir = document.querySelectorAll('.btn-abrir-pasos');

// Función para abrir el modal
botonesAbrir.forEach(boton => {
    boton.addEventListener('click', (e) => {
        // Obtener datos del botón
        const titulo = boton.getAttribute('data-modal-titulo');
        // Convertir el string JSON de pasos en un arreglo real de JavaScript
        const pasos = JSON.parse(boton.getAttribute('data-modal-pasos'));

        // Rellenar contenido
        modalTituloPro.textContent = titulo;
        modalListaPro.innerHTML = ''; // Limpiar pasos anteriores

        pasos.forEach((paso, index) => {
            const pasoHTML = `
                <div class="paso-pro animate-fade-in" style="animation-delay: ${0.1 * index}s;">
                    <img src="${paso.img}" alt="Paso ${index + 1}" class="img-paso-pro">
                    <div class="paso-texto-pro">
                        <h4>Paso ${index + 1}</h4>
                        <p>${paso.texto}</p>
                    </div>
                </div>
            `;
            modalListaPro.innerHTML += pasoHTML;
        });

        // Mostrar modal
        modalPro.classList.add('activo');
        document.body.style.overflow = 'hidden'; // Evitar que el fondo scrolleé
    });
});

// Función para cerrar el modal
function cerrarModal() {
    modalPro.classList.remove('activo');
    document.body.style.overflow = ''; // Restaurar scroll
}

btnCerrarPro.addEventListener('click', cerrarModal);

// Cerrar al hacer clic fuera del contenido
window.addEventListener('click', (e) => {
    if (e.target === modalPro) {
        cerrarModal();
    }
});