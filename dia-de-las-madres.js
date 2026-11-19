document.addEventListener('DOMContentLoaded', () => {

    // 0. PRELOADER Y CURSOR CUSTOM
    const preloader = document.getElementById('preloader');
    if (preloader) {
        setTimeout(() => {
            preloader.style.opacity = '0';
            setTimeout(() => preloader.remove(), 800);
        }, 1200); 
    }

    const cursorDot = document.querySelector('.cursor-dot');
    const cursorOutline = document.querySelector('.cursor-outline');
    
    if (cursorDot && cursorOutline) {
        window.addEventListener('mousemove', (e) => {
            const posX = e.clientX;
            const posY = e.clientY;
            cursorDot.style.left = `${posX}px`;
            cursorDot.style.top = `${posY}px`;
            cursorOutline.style.left = `${posX}px`;
            cursorOutline.style.top = `${posY}px`;
        });
    }

    // 1. GENERADOR DE PÉTALOS (AMBIENTE)
    function crearLluviaDePetalos() {
        const contenedor = document.getElementById('petalos-container');
        if (!contenedor) return;
        const cantidadPetalos = 35; 

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

    // 2. EFECTO MÁQUINA DE ESCRIBIR 
    const textoEmotivo = "Explora ideas para picnic, manualidades paso a paso, lugares inolvidables y opciones directas en Amazon y Mercado Libre para sorprender a mamá.";
    const elementoMensaje = document.getElementById("mensaje-animado");
    let indice = 0;

    function escribirTexto() {
        if (elementoMensaje && indice < textoEmotivo.length) {
            elementoMensaje.innerHTML += textoEmotivo.charAt(indice);
            indice++;
            setTimeout(escribirTexto, 38); 
        }
    }
    setTimeout(escribirTexto, 1500); 

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

    // Activar los 3 grupos de filtros
    inicializarFiltros('filtros-manualidades', 'grid-manualidades');
    inicializarFiltros('filtros-lugares', 'carrusel-lugares');
    inicializarFiltros('filtros-productos', 'grid-productos');

    // 4. ANIMACIÓN AL HACER SCROLL
    const observerOptions = { root: null, rootMargin: '0px', threshold: 0.12 };
    const scrollObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target); 
            }
        });
    }, observerOptions);

    document.querySelectorAll('.animate-on-scroll').forEach(el => scrollObserver.observe(el));

    // 5. VENTANA EMERGENTE PRO (MODAL PARA PASO A PASO)
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

    function cerrarModal() {
        if (modalPro) {
            modalPro.classList.remove('activo');
            document.body.style.overflow = ''; 
        }
    }

    if (btnCerrarPro) btnCerrarPro.addEventListener('click', cerrarModal);
    window.addEventListener('click', (e) => { if (e.target === modalPro) cerrarModal(); });

    // 6. EFECTO 3D TILT (INCLINACIÓN) PREMIUM
    const tiltCards = document.querySelectorAll('.tilt-effect');
    tiltCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left; 
            const y = e.clientY - rect.top;  
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = ((y - centerY) / centerY) * -8; 
            const rotateY = ((x - centerX) / centerX) * 8;
            
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
            card.style.transition = 'transform 0.5s ease';
        });

        card.addEventListener('mouseenter', () => {
            card.style.transition = 'none'; 
        });
    });

    // 7. EFECTO PARALLAX EN HEADER
    const heroText = document.querySelector('.parallax-element');
    window.addEventListener('scroll', () => {
        const scroll = window.scrollY;
        if (heroText && scroll < 800) {
            heroText.style.transform = `translateY(${scroll * 0.4}px)`;
            heroText.style.opacity = 1 - (scroll / 600);
        }
    });

});