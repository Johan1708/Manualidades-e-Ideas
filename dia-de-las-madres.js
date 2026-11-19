// 1. GENERADOR MÁGICO DE PÉTALOS
function crearLluviaDePetalos() {
    const contenedor = document.getElementById('petalos-container');
    if (!contenedor) return;
    const cantidadPetalos = 45; // Más pétalos

    for (let i = 0; i < cantidadPetalos; i++) {
        let petalo = document.createElement('div');
        petalo.classList.add('petalo-cae');
        petalo.style.left = Math.random() * 100 + 'vw'; // Posición horizontal aleatoria
        let duracionCaida = Math.random() * 6 + 5; // Entre 5 y 11 segundos
        let retraso = Math.random() * 5; 
        petalo.style.animationDuration = duracionCaida + 's';
        petalo.style.animationDelay = retraso + 's';
        let tamaño = Math.random() * 0.7 + 0.6; // Distintos tamaños
        petalo.style.transform = `scale(${tamaño})`;
        contenedor.appendChild(petalo);
    }
}
crearLluviaDePetalos();

// 2. EFECTO MÁQUINA DE ESCRIBIR
const textoEmotivo = "No es solo un regalo. Es devolverle un poco de toda la magia, el tiempo y el amor infinito que ella creó para ti. Es su momento.";
const elementoMensaje = document.getElementById("mensaje-animado");
let indice = 0;

function escribirTexto() {
    if (elementoMensaje && indice < textoEmotivo.length) {
        elementoMensaje.innerHTML += textoEmotivo.charAt(indice);
        indice++;
        setTimeout(escribirTexto, 35); // Velocidad de escritura
    }
}
setTimeout(escribirTexto, 1200); // Espera 1.2 segundos al cargar la página

// 3. LÓGICA DE FILTROS UNIVERSAL (Para Bento y Carrusel)
function inicializarFiltros(contenedorFiltrosId, contenedorTarjetasId) {
    const contenedorFiltros = document.getElementById(contenedorFiltrosId);
    const contenedorTarjetas = document.getElementById(contenedorTarjetasId);
    
    if (!contenedorFiltros || !contenedorTarjetas) return;

    const botones = contenedorFiltros.querySelectorAll('.btn-filtro');
    // Selecciona cualquier tarjeta que tenga la clase filter-item
    const tarjetas = contenedorTarjetas.querySelectorAll('.filter-item'); 

    botones.forEach(boton => {
        boton.addEventListener('click', () => {
            // Quitar clase activa a todos los botones de este grupo
            botones.forEach(b => b.classList.remove('active'));
            // Agregar activa al que se le dio clic
            boton.classList.add('active');

            const filtro = boton.getAttribute('data-filter');

            // Filtrar las tarjetas
            tarjetas.forEach(tarjeta => {
                // Si el filtro es "all" o coincide con el data-price de la tarjeta
                if (filtro === 'all' || tarjeta.getAttribute('data-price') === filtro) {
                    tarjeta.style.display = 'flex'; // Vuelve a mostrarse
                } else {
                    tarjeta.style.display = 'none'; // Se oculta
                }
            });
        });
    });
}

// Activar los 3 grupos de filtros
inicializarFiltros('filtros-manualidades', 'grid-manualidades');
inicializarFiltros('filtros-lugares', 'carrusel-lugares');
inicializarFiltros('filtros-regalos', 'grid-regalos');


// 4. ANIMACIÓN AL HACER SCROLL (Aparecer suavemente)
const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.15 // Se activa cuando el 15% del elemento es visible
};

const scrollObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target); // Solo anima 1 vez
        }
    });
}, observerOptions);

document.querySelectorAll('.animate-on-scroll').forEach(el => scrollObserver.observe(el));


// 5. VENTANA EMERGENTE PRO (MODAL PASO A PASO)
const modalPro = document.getElementById('modal-pasos');
const btnCerrarPro = document.getElementById('btn-cerrar-pro');
const modalTituloPro = document.getElementById('modal-titulo-pro');
const modalListaPro = document.getElementById('modal-lista-pro');
const botonesAbrir = document.querySelectorAll('.btn-abrir-pasos');

botonesAbrir.forEach(boton => {
    boton.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Obtener datos del HTML
        const titulo = boton.getAttribute('data-modal-titulo');
        const pasos = JSON.parse(boton.getAttribute('data-modal-pasos'));

        // Llenar contenido
        modalTituloPro.textContent = titulo;
        modalListaPro.innerHTML = ''; 

        pasos.forEach((paso, index) => {
            // Crea el HTML de cada paso dinámicamente
            const pasoHTML = `
                <div class="paso-pro" style="animation: expandIn 0.4s ease forwards ${0.1 * index}s; opacity:0;">
                    <img src="${paso.img}" alt="Paso ${index + 1}" class="img-paso-pro">
                    <div class="paso-texto-pro">
                        <h4>Paso ${index + 1}</h4>
                        <p>${paso.texto}</p>
                    </div>
                </div>
            `;
            modalListaPro.innerHTML += pasoHTML;
        });

        // Mostrar ventana y bloquear scroll del fondo
        modalPro.classList.add('activo');
        document.body.style.overflow = 'hidden'; 
    });
});

// Cerrar Modal
function cerrarModal() {
    modalPro.classList.remove('activo');
    document.body.style.overflow = ''; // Restaurar scroll del fondo
}

btnCerrarPro.addEventListener('click', cerrarModal);
window.addEventListener('click', (e) => {
    if (e.target === modalPro) {
        cerrarModal();
    }
});