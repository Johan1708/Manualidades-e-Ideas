document.addEventListener('DOMContentLoaded', () => {
    
    // 1. PRELOADER
    const preloader = document.getElementById('preloader');
    setTimeout(() => {
        preloader.style.opacity = '0';
        setTimeout(() => preloader.remove(), 800);
    }, 1500); // Finge tiempo de carga para mostrar la animación botánica

    // 2. CURSOR PERSONALIZADO MAGNÉTICO
    const cursorDot = document.querySelector('.cursor-dot');
    const cursorOutline = document.querySelector('.cursor-outline');
    
    window.addEventListener('mousemove', (e) => {
        const posX = e.clientX;
        const posY = e.clientY;

        // El punto sigue exacto
        cursorDot.style.left = `${posX}px`;
        cursorDot.style.top = `${posY}px`;
        
        // El aro tiene un ligero retraso (ease) integrado en el CSS
        cursorOutline.style.left = `${posX}px`;
        cursorOutline.style.top = `${posY}px`;
    });

    // 3. GENERADOR DE PÉTALOS ORGÁNICOS 2.0
    const contenedor = document.getElementById('petalos-container');
    const cantidadPetalos = 40; 

    for (let i = 0; i < cantidadPetalos; i++) {
        let petalo = document.createElement('div');
        petalo.classList.add('petalo');
        petalo.style.left = Math.random() * 100 + 'vw'; 
        
        let duracionCaida = Math.random() * 10 + 10; // Caída más lenta y suave
        let retraso = Math.random() * 10; 
        let tamaño = Math.random() * 1.5 + 0.5;
        let opacidad = Math.random() * 0.5 + 0.3;
        
        petalo.style.animationDuration = `${duracionCaida}s`;
        petalo.style.animationDelay = `${retraso}s`;
        petalo.style.transform = `scale(${tamaño})`;
        petalo.style.opacity = opacidad;
        
        contenedor.appendChild(petalo);
    }

    // 4. EFECTO TYPEWRITER
    const textoEmotivo = "Para la mujer que plantó las semillas de nuestros sueños y nos enseñó a florecer. Su jardín es nuestro hogar.";
    const elementoMensaje = document.getElementById("mensaje-animado");
    let indice = 0;

    function escribirTexto() {
        if (elementoMensaje && indice < textoEmotivo.length) {
            elementoMensaje.innerHTML += textoEmotivo.charAt(indice);
            indice++;
            setTimeout(escribirTexto, 50); 
        }
    }
    setTimeout(escribirTexto, 2000); // Inicia tras ocultar el loader

    // 5. INTERSECTION OBSERVER (Animaciones al Scroll)
    const scrollObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.animate-on-scroll').forEach(el => scrollObserver.observe(el));

    // 6. EFECTO 3D TILT (INCLINACIÓN) EN TARJETAS BENTO
    const tiltCards = document.querySelectorAll('.tilt-effect');

    tiltCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left; // Posición X dentro de la tarjeta
            const y = e.clientY - rect.top;  // Posición Y dentro de la tarjeta
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            // Calcula la rotación (mientras más lejos del centro, más rota)
            const rotateX = ((y - centerY) / centerY) * -10; // Max rotación 10deg
            const rotateY = ((x - centerX) / centerX) * 10;
            
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
        });

        card.addEventListener('mouseleave', () => {
            // Vuelve al estado original suavemente
            card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
            card.style.transition = 'transform 0.5s ease';
        });

        card.addEventListener('mouseenter', () => {
            card.style.transition = 'none'; // Quita la transición para que el trackeo del mouse sea instantáneo
        });
    });

    // 7. EFECTO PARALLAX EN HEADER
    const heroText = document.querySelector('.parallax-element');
    window.addEventListener('scroll', () => {
        const scroll = window.scrollY;
        if(heroText && scroll < 800) {
            heroText.style.transform = `translateY(${scroll * 0.4}px)`;
            heroText.style.opacity = 1 - (scroll / 600);
        }
    });

    // 8. DUPLICAR MARQUEE PARA BUCLE INFINITO PERFECTO
    const marqueeContent = document.querySelector('.marquee-content');
    if(marqueeContent) {
        const copy = marqueeContent.cloneNode(true);
        document.querySelector('.marquee-wrapper').appendChild(copy);
        // Ajuste en CSS para el contenedor padre (necesita display:flex)
        document.querySelector('.marquee-wrapper').style.display = 'flex';
    }
});