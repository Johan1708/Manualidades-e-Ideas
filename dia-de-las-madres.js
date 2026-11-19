// 1. GENERADOR MÁGICO DE PÉTALOS
function crearLluviaDePetalos() {
    const contenedor = document.getElementById('petalos-container');
    if (!contenedor) return;
    const cantidadPetalos = 50; 

    for (let i = 0; i < cantidadPetalos; i++) {
        let petalo = document.createElement('div');
        petalo.classList.add('petalo-cae');
        petalo.style.left = Math.random() * 100 + 'vw'; 
        let duracionCaida = Math.random() * 7 + 6; 
        let retraso = Math.random() * 6; 
        petalo.style.animationDuration = duracionCaida + 's';
        petalo.style.animationDelay = retraso + 's';
        let tamaño = Math.random() * 0.8 + 0.5; 
        petalo.style.transform = `scale(${tamaño})`;
        contenedor.appendChild(petalo);
    }
}
crearLluviaDePetalos();

// 2. EFECTO MÁQUINA DE ESCRIBIR (Adaptado a temática floral)
const textoEmotivo = "Para la mujer que plantó las semillas de nuestros sueños, cuidó nuestras raíces y nos enseñó a florecer sin importar la estación. Su jardín es nuestro hogar.";
const elementoMensaje = document.getElementById("mensaje-animado");
let indice = 0;

function escribirTexto() {
    if (elementoMensaje && indice < textoEmotivo.length) {
        elementoMensaje.innerHTML += textoEmotivo.charAt(indice);
        indice++;
        setTimeout(escribirTexto, 40); 
    }
}
setTimeout(escribirTexto, 1200); 

// 3. LÓGICA DE FILTROS UNIVERSAL
function inicializarFiltros(contenedorFiltrosId, contenedorTarjetasId) {
    const contenedorFiltros = document.getElementById(contenedorFiltrosId);
    const contenedorTarjetas = document.getElementById(contenedorTarjetasId);
    
    if (!contenedorFiltros || !contenedorTarjetas) return;

    const botones = contenedorFiltros.querySelectorAll('.btn-filtro');
    const tarjetas = contenedorTarjetas.querySelectorAll('.filter-item'); 

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

// Activar los 3 grupos de filtros actualizados
inicializarFiltros('filtros-flores', 'grid-flores');
inicializarFiltros('filtros-experiencias', 'carrusel-experiencias');
inicializarFiltros('filtros-detalles', 'grid-detalles');


// 4. ANIMACIÓN AL HACER SCROLL
const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.15 
};

const scrollObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target); 
        }
    });
}, observerOptions);

document.querySelectorAll('.animate-on-scroll').forEach(el => scrollObserver.observe(el));


// 5. VENTANA EMERGENTE PRO (MODAL DE CUIDADOS FLORALES)
const modalPro = document.getElementById('modal-pasos');
const btnCerrarPro = document.getElementById('btn-cerrar-pro');
const modalTituloPro = document.getElementById('modal-titulo-pro');
const modalListaPro = document.getElementById('modal-lista-pro');
const botonesAbrir = document.querySelectorAll('.btn-abrir-pasos');

botonesAbrir.forEach(boton => {
    boton.addEventListener('click', (e) => {
        e.preventDefault();
        
        const titulo = boton.getAttribute('data-modal-titulo');
        const pasos = JSON.parse(boton.getAttribute('data-modal-pasos'));

        modalTituloPro.textContent = titulo;
        modalListaPro.innerHTML = ''; 

        pasos.forEach((paso, index) => {
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

        modalPro.classList.add('activo');
        document.body.style.overflow = 'hidden'; 
    });
});

// Cerrar Modal
function cerrarModal() {
    modalPro.classList.remove('activo');
    document.body.style.overflow = ''; 
}

btnCerrarPro.addEventListener('click', cerrarModal);
window.addEventListener('click', (e) => {
    if (e.target === modalPro) {
        cerrarModal();
    }
});