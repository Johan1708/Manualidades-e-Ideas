// ==========================================
// 1. Cursor Personalizado, Ripple y Estado
// ==========================================
const cursor = document.querySelector('.cursor');
const follower = document.querySelector('.cursor-follower');
const items = document.querySelectorAll('.categoria-item');
const sonidoHover = document.getElementById('sonido-hover');
const elCategoriaHeader = document.getElementById('categoria-actual');

let mouseX = 0, mouseY = 0;
let followerX = 0, followerY = 0;
let mouseSobreBtn = false;
let enOlaTransicion = false;

let lastMouseX = 0, lastMouseY = 0;
let mouseQuietoTimer = null;
let velocidadMouse = 0;
let deformacionActual = 0;

document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    
    if (cursor) {
        cursor.style.left = mouseX + 'px';
        cursor.style.top = mouseY + 'px';
    }

    if (!mouseSobreBtn && !enOlaTransicion) {
        const dx = e.clientX - lastMouseX;
        const dy = e.clientY - lastMouseY;
        const distancia = Math.sqrt(dx * dx + dy * dy);

        velocidadMouse = Math.min(distancia / 50, 0.3);

        clearTimeout(mouseQuietoTimer);
        mouseQuietoTimer = setTimeout(() => {
            velocidadMouse = 0;
        }, 80);
    } else {
        velocidadMouse = 0;
    }

    lastMouseX = e.clientX;
    lastMouseY = e.clientY;
});

function animarCursor() {
    if (follower) {
        followerX += (mouseX - followerX) * 0.10;
        followerY += (mouseY - followerY) * 0.10;
        follower.style.left = followerX + 'px';
        follower.style.top = followerY + 'px';
    }
    requestAnimationFrame(animarCursor);
}
animarCursor();

// Ripple expansivo al hacer clic
document.addEventListener('click', (e) => {
    crearRippleCursor(e.clientX, e.clientY);
});

function crearRippleCursor(x, y) {
    const ripple = document.createElement('div');
    ripple.classList.add('cursor-ripple');
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';

    const coloresTema = {
        0: '#ff6600',
        1: '#ff9900',
        2: '#dc143c',
        3: '#e91e63',
        4: '#03a9f4'
    };

    const color = coloresTema[seccionActual] || '#ffffff';
    ripple.style.borderColor = color;
    ripple.style.boxShadow = `0 0 25px ${color}`;

    document.body.appendChild(ripple);

    ripple.addEventListener('animationend', () => {
        ripple.remove();
    });
}

// Feedback en botones
document.querySelectorAll('.btn-3d, .btn-home-nav').forEach(btn => {
    btn.addEventListener('mouseenter', () => {
        mouseSobreBtn = true;
        if (follower) {
            follower.style.width = '70px';
            follower.style.height = '70px';
            follower.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
        }
        if (sonidoHover) {
            sonidoHover.volume = 0.2;
            sonidoHover.currentTime = 0;
            sonidoHover.play().catch(() => {});
        }
    });

    btn.addEventListener('mouseleave', () => {
        mouseSobreBtn = false;
        if (follower) {
            follower.style.width = '35px';
            follower.style.height = '35px';
            follower.style.backgroundColor = 'transparent';
        }
    });
});

// ==========================================
// 2. Navegación Fija Central (Con lectura de parámetro URL)
// ==========================================
const urlParams = new URLSearchParams(window.location.search);
let seccionActual = parseInt(urlParams.get('cat') || '0', 10);
let bloqueado = false;

function irASeccion(index) {
    if (index < 0 || index >= items.length || bloqueado) return;
    if (index === seccionActual && items[seccionActual].classList.contains('activo')) return;

    bloqueado = true;
    const rutaAnterior = items[seccionActual].getAttribute('data-bg');
    seccionActual = index;

    actualizarSeleccionDirecta(items[seccionActual], rutaAnterior);
    dispararOlaTransicion();

    setTimeout(() => {
        bloqueado = false;
    }, 1800);
}

// Botones de navegación lateral
const btnPrev = document.querySelector('.flecha-nav.prev');
const btnNext = document.querySelector('.flecha-nav.next');

if (btnPrev) {
    btnPrev.addEventListener('click', () => {
        const prevIndex = (seccionActual - 1 + items.length) % items.length;
        irASeccion(prevIndex);
    });
}

if (btnNext) {
    btnNext.addEventListener('click', () => {
        const nextIndex = (seccionActual + 1) % items.length;
        irASeccion(nextIndex);
    });
}

// Navegación Rueda del Mouse
window.addEventListener('wheel', (e) => {
    e.preventDefault();
    if (bloqueado) return;

    if (Math.abs(e.deltaY) > 8) {
        if (e.deltaY > 0) {
            const nextIndex = (seccionActual + 1) % items.length;
            irASeccion(nextIndex);
        } else {
            const prevIndex = (seccionActual - 1 + items.length) % items.length;
            irASeccion(prevIndex);
        }
    }
}, { passive: false });

// Navegación Teclado
window.addEventListener('keydown', (e) => {
    if (bloqueado) return;

    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        const nextIndex = (seccionActual + 1) % items.length;
        irASeccion(nextIndex);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        const prevIndex = (seccionActual - 1 + items.length) % items.length;
        irASeccion(prevIndex);
    }
});

// ==========================================
// 3. Deformación SVG del Fondo (Agua)
// ==========================================
let turbulencia = document.getElementById('turbulencia');
let mapaDesplazamiento = document.getElementById('mapa-desplazamiento');
let tiempo = 0;
let fX = 0.006, fY = 0.006;

function animarAgua() {
    if (!turbulencia) turbulencia = document.getElementById('turbulencia');
    if (!mapaDesplazamiento) mapaDesplazamiento = document.getElementById('mapa-desplazamiento');

    if (turbulencia && mapaDesplazamiento) {
        tiempo += 0.0025; 
        
        if (!enOlaTransicion) {
            deformacionActual += (velocidadMouse - deformacionActual) * 0.05;

            const escalaDinamica = 15 + (deformacionActual * 18);
            mapaDesplazamiento.setAttribute('scale', escalaDinamica);

            const freqDinamica = 0.006 + (deformacionActual * 0.008);
            const oscX = freqDinamica + Math.sin(tiempo) * 0.001;
            const oscY = freqDinamica + Math.cos(tiempo) * 0.001;

            turbulencia.setAttribute('baseFrequency', `${oscX} ${oscY}`);
        } else {
            const oscX = fX + Math.sin(tiempo) * 0.0015;
            const oscY = fY + Math.cos(tiempo) * 0.0015;
            turbulencia.setAttribute('baseFrequency', `${oscX} ${oscY}`);
        }
    }
    requestAnimationFrame(animarAgua);
}

function dispararOlaTransicion() {
    if (!turbulencia || !mapaDesplazamiento) return;

    enOlaTransicion = true;

    if (capaA) capaA.classList.add('ola-activa');
    if (capaB) capaB.classList.add('ola-activa');

    const startTime = performance.now();
    const duracionEfecto = 2200;

    function animarOndaPiedra(currentTime) {
        const transcurrito = currentTime - startTime;
        const progreso = Math.min(transcurrito / duracionEfecto, 1);

        if (progreso < 1) {
            const decaimiento = Math.exp(-3.5 * progreso); 
            const ondaSuave = (Math.sin(progreso * Math.PI * 6 - Math.PI / 2) + 1) / 2;
            const escalaImpacto = 15 + (ondaSuave * decaimiento * 35);

            const frecuenciaImpacto = 0.006 + (decaimiento * 0.006);
            fX = frecuenciaImpacto;
            fY = frecuenciaImpacto;

            mapaDesplazamiento.setAttribute('scale', escalaImpacto);

            requestAnimationFrame(animarOndaPiedra);
        } else {
            fX = 0.006;
            fY = 0.006;
            mapaDesplazamiento.setAttribute('scale', 15);
            velocidadMouse = 0;
            deformacionActual = 0;
            enOlaTransicion = false;

            if (capaA) capaA.classList.remove('ola-activa');
            if (capaB) capaB.classList.remove('ola-activa');
        }
    }

    requestAnimationFrame(animarOndaPiedra);
}

animarAgua();

// ==========================================
// 4. Motor 3D de Partículas
// ==========================================
let renderer3D, scene3D, camera3D;
let textureLoader3D = null;

function initThreeEngine() {
    const container = document.getElementById('three-container');
    if (!container || renderer3D) return;

    renderer3D = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer3D.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    renderer3D.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer3D.domElement);

    camera3D = new THREE.PerspectiveCamera(80, window.innerWidth / window.innerHeight, 1, 10000);
    camera3D.position.z = 60;

    scene3D = new THREE.Scene();
    textureLoader3D = new THREE.TextureLoader();

    window.addEventListener('resize', () => {
        if (!camera3D || !renderer3D) return;
        camera3D.aspect = window.innerWidth / window.innerHeight;
        camera3D.updateProjectionMatrix();
        renderer3D.setSize(window.innerWidth, window.innerHeight);
    });

    function loop() {
        if (renderer3D && scene3D && camera3D) {
            renderer3D.render(scene3D, camera3D);
        }
        requestAnimationFrame(loop);
    }
    loop();
}

function createParticleSlideGeometry(width, height, segX, segY, phase) {
    const geometry = new THREE.BufferGeometry();
    const dx = width / segX;
    const dy = height / segY;
    const count = segX * segY * 2 * 3;

    const positions = new Float32Array(count * 3);
    const uvs = new Float32Array(count * 2);
    const aAnimation = new Float32Array(count * 2);
    const aStartPosition = new Float32Array(count * 3);
    const aControl0 = new Float32Array(count * 3);
    const aControl1 = new Float32Array(count * 3);
    const aEndPosition = new Float32Array(count * 3);

    const minDuration = 0.8, maxDuration = 1.2;
    const maxDelayX = 0.9, maxDelayY = 0.125, stretch = 0.11;
    const totalDuration = maxDuration + maxDelayX + maxDelayY + stretch;

    let vIdx = 0, uvIdx = 0, animIdx = 0, pos3Idx = 0;

    for (let iy = 0; iy < segY; iy++) {
        for (let ix = 0; ix < segX; ix++) {
            const x0 = -width/2 + ix * dx;
            const x1 = x0 + dx;
            const y0 = -height/2 + iy * dy;
            const y1 = y0 + dy;

            const u0 = ix / segX;
            const u1 = (ix + 1) / segX;
            const v0 = iy / segY;
            const v1 = (iy + 1) / segY;

            const tris = [
                [{x:x0, y:y0}, {x:x1, y:y0}, {x:x0, y:y1}],
                [{x:x1, y:y0}, {x:x1, y:y1}, {x:x0, y:y1}]
            ];
            const triUvs = [
                [{u:u0, v:v0}, {u:u1, v:v0}, {u:u0, v:v1}],
                [{u:u1, v:v0}, {u:u1, v:v1}, {u:u0, v:v1}]
            ];

            for (let t = 0; t < 2; t++) {
                const verts = tris[t];
                const tuvs = triUvs[t];

                const cx = (verts[0].x + verts[1].x + verts[2].x) / 3;
                const cy = (verts[0].y + verts[1].y + verts[2].y) / 3;

                const delayX = (cx - (-width*0.5)) / width * maxDelayX;
                const delayY = (phase === 'in') 
                    ? (Math.abs(cy) / (height*0.5)) * maxDelayY 
                    : (1.0 - Math.abs(cy) / (height*0.5)) * maxDelayY;

                const duration = minDuration + Math.random() * (maxDuration - minDuration);
                const delay = delayX + delayY + (Math.random() * stretch * duration);

                const signY = cy >= 0 ? 1 : -1;
                const ctrl0X = cx + (phase === 'out' ? (0.1 + Math.random()*0.2)*50 : -(0.1 + Math.random()*0.2)*50);
                const ctrl0Y = cy + (phase === 'out' ? signY*(0.1 + Math.random()*0.2)*70 : -signY*(0.1 + Math.random()*0.2)*70);
                const ctrl0Z = (Math.random() - 0.5) * 30;

                const ctrl1X = cx + (phase === 'out' ? (0.3 + Math.random()*0.3)*50 : -(0.3 + Math.random()*0.3)*50);
                const ctrl1Y = cy + (phase === 'out' ? -signY*(0.3 + Math.random()*0.3)*70 : signY*(0.3 + Math.random()*0.3)*70);
                const ctrl1Z = (Math.random() - 0.5) * 30;

                for (let k = 0; k < 3; k++) {
                    positions[vIdx] = verts[k].x - cx;
                    positions[vIdx+1] = verts[k].y - cy;
                    positions[vIdx+2] = 0;
                    vIdx += 3;

                    uvs[uvIdx] = tuvs[k].u;
                    uvs[uvIdx+1] = tuvs[k].v;
                    uvIdx += 2;

                    aAnimation[animIdx] = delay;
                    aAnimation[animIdx+1] = duration;
                    animIdx += 2;

                    aStartPosition[pos3Idx] = cx;
                    aStartPosition[pos3Idx+1] = cy;
                    aStartPosition[pos3Idx+2] = 0;

                    aControl0[pos3Idx] = ctrl0X;
                    aControl0[pos3Idx+1] = ctrl0Y;
                    aControl0[pos3Idx+2] = ctrl0Z;

                    aControl1[pos3Idx] = ctrl1X;
                    aControl1[pos3Idx+1] = ctrl1Y;
                    aControl1[pos3Idx+2] = ctrl1Z;

                    aEndPosition[pos3Idx] = cx;
                    aEndPosition[pos3Idx+1] = cy;
                    aEndPosition[pos3Idx+2] = 0;

                    pos3Idx += 3;
                }
            }
        }
    }

    geometry.addAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.addAttribute('uv', new THREE.BufferAttribute(uvs, 2));
    geometry.addAttribute('aAnimation', new THREE.BufferAttribute(aAnimation, 2));
    geometry.addAttribute('aStartPosition', new THREE.BufferAttribute(aStartPosition, 3));
    geometry.addAttribute('aControl0', new THREE.BufferAttribute(aControl0, 3));
    geometry.addAttribute('aControl1', new THREE.BufferAttribute(aControl1, 3));
    geometry.addAttribute('aEndPosition', new THREE.BufferAttribute(aEndPosition, 3));

    return { geometry, totalDuration };
}

const particleVertexShader = `
uniform float uTime;
uniform float uPhase;

attribute vec2 aAnimation;
attribute vec3 aStartPosition;
attribute vec3 aControl0;
attribute vec3 aControl1;
attribute vec3 aEndPosition;

varying vec2 vUv;

vec3 cubicBezier(vec3 p0, vec3 c0, vec3 c1, vec3 p1, float t) {
    float tn = 1.0 - t;
    return tn * tn * tn * p0 + 3.0 * tn * tn * t * c0 + 3.0 * tn * t * t * c1 + t * t * t * p1;
}

float easeInOutCubic(float t) {
    return t < 0.5 ? 4.0 * t * t * t : 1.0 - pow(-2.0 * t + 2.0, 3.0) / 2.0;
}

void main() {
    vUv = uv;
    
    float tDelay = aAnimation.x;
    float tDuration = aAnimation.y;
    float tTime = clamp(uTime - tDelay, 0.0, tDuration);
    float tProgress = easeInOutCubic(tTime / tDuration);
    
    vec3 transformed = position;
    
    if (uPhase < 0.5) {
        transformed *= (1.0 - tProgress);
    } else {
        transformed *= tProgress;
    }
    
    vec3 center = cubicBezier(aStartPosition, aControl0, aControl1, aEndPosition, tProgress);
    transformed += center;
    
    vec4 mvPosition = modelViewMatrix * vec4(transformed, 1.0);
    gl_Position = projectionMatrix * mvPosition;
}
`;

const particleFragmentShader = `
uniform sampler2D map;
varying vec2 vUv;

void main() {
    vec4 texColor = texture2D(map, vUv);
    if (texColor.a < 0.01) discard;
    gl_FragColor = texColor;
}
`;

function dispararTransicionParticulas3D(urlAnterior, urlNueva) {
    if (!renderer3D) initThreeEngine();
    const container = document.getElementById('three-container');
    const galeria = document.querySelector('.galeria');
    if (!container || !renderer3D) return;

    container.classList.add('activo');
    if (galeria) galeria.classList.add('en-transicion');

    const width = 110;
    const height = 70;

    const dataOut = createParticleSlideGeometry(width, height, 80, 50, 'out');
    const dataIn = createParticleSlideGeometry(width, height, 80, 50, 'in');

    const materialOut = new THREE.ShaderMaterial({
        vertexShader: particleVertexShader,
        fragmentShader: particleFragmentShader,
        uniforms: {
            uTime: { value: 0 },
            uPhase: { value: 0.0 },
            map: { value: new THREE.Texture() }
        },
        side: THREE.DoubleSide,
        transparent: true
    });

    const materialIn = new THREE.ShaderMaterial({
        vertexShader: particleVertexShader,
        fragmentShader: particleFragmentShader,
        uniforms: {
            uTime: { value: 0 },
            uPhase: { value: 1.0 },
            map: { value: new THREE.Texture() }
        },
        side: THREE.DoubleSide,
        transparent: true
    });

    const meshOut = new THREE.Mesh(dataOut.geometry, materialOut);
    const meshIn = new THREE.Mesh(dataIn.geometry, materialIn);

    scene3D.add(meshOut);
    scene3D.add(meshIn);

    let loaded = 0;
    function checkReady() {
        loaded++;
        if (loaded < 2) return;

        const timelineObj = { time: 0 };
        const maxDuration = Math.max(dataOut.totalDuration, dataIn.totalDuration);

        TweenMax.to(timelineObj, 1.7, {
            time: maxDuration,
            ease: Power0.easeInOut,
            onUpdate: function () {
                materialOut.uniforms.uTime.value = timelineObj.time;
                materialIn.uniforms.uTime.value = timelineObj.time;
            },
            onComplete: function () {
                scene3D.remove(meshOut);
                scene3D.remove(meshIn);
                container.classList.remove('activo');
                if (galeria) galeria.classList.remove('en-transicion');
            }
        });
    }

    textureLoader3D.load(urlAnterior, (tex) => {
        materialOut.uniforms.map.value = tex;
        tex.needsUpdate = true;
        checkReady();
    });

    textureLoader3D.load(urlNueva, (tex) => {
        materialIn.uniforms.map.value = tex;
        tex.needsUpdate = true;
        checkReady();
    });
}

// ==========================================
// 5. Sincronización del Fondo y Categoría
// ==========================================
const capaA = document.querySelector('.fondo-agua.capa-a');
const capaB = document.querySelector('.fondo-agua.capa-b');
let capaActivaEsA = true;
let rutaImagenActual = '';

function actualizarSeleccionDirecta(elemento, rutaAnteriorOpcional) {
    if (!elemento) return;

    items.forEach(item => item.classList.remove('activo'));
    elemento.classList.add('activo');

    // Actualización del título en header
    const nuevoTitulo = elemento.getAttribute('data-titulo');
    if (elCategoriaHeader && nuevoTitulo && elCategoriaHeader.textContent !== nuevoTitulo) {
        elCategoriaHeader.classList.add('cambiando');
        setTimeout(() => {
            elCategoriaHeader.textContent = nuevoTitulo;
            elCategoriaHeader.classList.remove('cambiando');
        }, 150);
    }

    const nuevaRuta = elemento.getAttribute('data-bg');
    if (!nuevaRuta || nuevaRuta === rutaImagenActual) return;

    const urlOrigen = rutaAnteriorOpcional || rutaImagenActual || 'imagenes/halloween1.jpg';
    
    dispararTransicionParticulas3D(urlOrigen, nuevaRuta);

    rutaImagenActual = nuevaRuta;

    const capaEntrante = capaActivaEsA ? capaB : capaA;
    const capaSaliente = capaActivaEsA ? capaA : capaB;

    if (capaEntrante && capaSaliente) {
        capaEntrante.classList.add('capa-top');
        capaSaliente.classList.remove('capa-top');

        capaEntrante.classList.remove('visible', 'saliendo');
        capaEntrante.style.backgroundImage = `url('${nuevaRuta}')`;
        
        void capaEntrante.offsetWidth;

        capaEntrante.classList.add('visible');
        capaSaliente.classList.remove('visible');
        capaSaliente.classList.add('saliendo');
    }

    capaActivaEsA = !capaActivaEsA;
}

// Inicialización respetando la categoría enviada desde la Landing Page (?cat=X)
if (items.length > 0) {
    const idxInicial = Math.min(Math.max(seccionActual, 0), items.length - 1);
    actualizarSeleccionDirecta(items[idxInicial]);
}