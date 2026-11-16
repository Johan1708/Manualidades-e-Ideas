/* ==========================================================================
   BASE DE DATOS REGIONAL COMPLETA CON GALERÍAS Y COORDENADAS GPS
   ========================================================================== */
const regionalData = {
    michoacan: {
        title: "Ofrenda de Pátzcuaro & Janitzio",
        tag: "REGIONAL · MICHOACÁN",
        icon: "🚣",
        desc: "En Janitzio y Pátzcuaro, las veladoras iluminan las canoas con redes mariposa sobre el lago. Se construyen arcos de flor de cempasúchil y se elaboran las ofrendas ceremoniales con patzari (pescado blanco).",
        images: [
            "https://images.unsplash.com/photo-1512389142860-9c449e58a543?q=80&w=400&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1508361001413-7a9dca21d08a?q=80&w=400&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=80&w=400&auto=format&fit=crop"
        ],
        elements: ["✨ Arcos de Cempasúchil", "🕯️ Redes de Pesca con Velas", "🐟 Pescado Blanco", "🍞 Pan de Muerto Artesanal"],
        lat: 19.5133,
        lng: -101.6094,
        mapsUrl: "https://www.google.com/maps/search/?api=1&query=Patzcuaro+Michoacan+Dia+de+Muertos"
    },
    cdmx: {
        title: "Ofrenda de San Andrés Mixquic",
        tag: "REGIONAL · CDMX",
        icon: "💀",
        desc: "En Mixquic (Tláhuac), se celebra 'La Alumbrada' donde el panteón entero apaga sus luces para encender miles de velas. Abundan las calaveritas de azúcar picantes y la flor de aterciopelo.",
        images: [
            "https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=80&w=400&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1603988363607-e1e4a66962c6?q=80&w=400&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1512389142860-9c449e58a543?q=80&w=400&auto=format&fit=crop"
        ],
        elements: ["💀 Calaveras de Azúcar", "🕯️ La Alumbrada en Panteón", "🌺 Flor de Cresta de Gallo", "🌽 Tamales de Mole"],
        lat: 19.2253,
        lng: -98.9619,
        mapsUrl: "https://www.google.com/maps/search/?api=1&query=San+Andres+Mixquic+Dia+de+Muertos"
    },
    oaxaca: {
        title: "Altar Tradicional Zapoteca",
        tag: "REGIONAL · OAXACA",
        icon: "🌼",
        desc: "Ofrendas adornadas con mole negro de siete chiles, mezcal de pechuga, chocolate de agua, pan de yema con caritas de pasta y arcos revestidos con cempasúchil silvestre.",
        images: [
            "https://images.unsplash.com/photo-1508361001413-7a9dca21d08a?q=80&w=400&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1512389142860-9c449e58a543?q=80&w=400&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1603988363607-e1e4a66962c6?q=80&w=400&auto=format&fit=crop"
        ],
        elements: ["🍲 Mole Negro y Mezcal", "🥖 Pan de Yema con Caritas", "🌾 Copal y Sahumerio", "🍫 Chocolate de Agua"],
        lat: 17.0654,
        lng: -96.7236,
        mapsUrl: "https://www.google.com/maps/search/?api=1&query=Oaxaca+Centro+Dia+de+Muertos"
    },
    yucatan: {
        title: "Altar del Hanal Pixán",
        tag: "REGIONAL · YUCATÁN",
        icon: "🍲",
        desc: "La 'Comida de las Ánimas' maya. El altar se viste de blanco con manteles bordados en punto de cruz, Mukbilpollo (tamal horneado bajo tierra en pib) y jícaras con atole nuevo (sak-ha).",
        images: [
            "https://images.unsplash.com/photo-1603988363607-e1e4a66962c6?q=80&w=400&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=80&w=400&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1508361001413-7a9dca21d08a?q=80&w=400&auto=format&fit=crop"
        ],
        elements: ["🫔 Mukbilpollo (Pib)", "🥣 Atole Sak-Ha en Jícaras", "🪡 Manteletes Bordados Maya", "🕯️ Velas de Cera Virgen"],
        lat: 20.9676,
        lng: -89.6237,
        mapsUrl: "https://www.google.com/maps/search/?api=1&query=Merida+Yucatan+Hanal+Pixan"
    },
    puebla: {
        title: "Altares Monumentales de Huaquechula",
        tag: "REGIONAL · PUEBLA",
        icon: "🏛️",
        desc: "Altares piramidales de 3 a 5 niveles vestidos en satín y telas blancas pulcras. Incluyen espejos para reflejar la eternidad, alfeñiques dorados y la luz de velas monumentales.",
        images: [
            "https://images.unsplash.com/photo-1512389142860-9c449e58a543?q=80&w=400&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1508361001413-7a9dca21d08a?q=80&w=400&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=80&w=400&auto=format&fit=crop"
        ],
        elements: ["🏛️ Pirámide de Satín Blanco", "🪞 Espejos de la Eternidad", "🍯 Alfeñiques Dorados", "🕯️ Cirios Monumentales"],
        lat: 18.7725,
        lng: -98.5502,
        mapsUrl: "https://www.google.com/maps/search/?api=1&query=Huaquechula+Puebla+Altares+Monumentales"
    }
};

let activeRegion = regionalData.michoacan;

/* ==========================================================================
   ESCENA THREE.JS (OFRENDA 3D)
   ========================================================================== */
function setup3DOfrendaScene() {
    const canvas = document.querySelector('.webgl');
    if (!canvas) return;

    const scene = new THREE.Scene();
    const textureLoader = new THREE.TextureLoader();
    let composer;

    const sizes = { width: window.innerWidth, height: window.innerHeight };

    const camera = new THREE.PerspectiveCamera(10, sizes.width / sizes.height, 0.1, 100);
    camera.position.set(18, 8, 20);
    scene.add(camera);

    const controls = new THREE.OrbitControls(camera, canvas);
    controls.enableDamping = true;
    controls.minDistance = 12;
    controls.maxDistance = 35;
    controls.minPolarAngle = Math.PI / 5;
    controls.maxPolarAngle = Math.PI / 2;
    controls.target.set(0, 1.2, 0);

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputEncoding = THREE.sRGBEncoding;

    // Shader Materials
    const candleMaterial = new THREE.ShaderMaterial({
        uniforms: { time: { value: 1.0 }, delay: { value: 1.0 }, colorSpeed: { value: 5.0 }, baseColor: { value: new THREE.Color(0xFFD7BC) } },
        vertexShader: document.getElementById('vertexshaderCandle').textContent,
        fragmentShader: document.getElementById('fragmentshaderCandle').textContent,
    });

    const bubbleMaterial = new THREE.ShaderMaterial({
        uniforms: { time: { value: 0.0 } },
        vertexShader: document.getElementById('vertexshaderBubble').textContent,
        fragmentShader: document.getElementById('fragmentshaderBubble').textContent,
    });

    const doorMaterial = new THREE.ShaderMaterial({
        uniforms: { time: { value: 10.0 }, resolution: { value: new THREE.Vector2() } },
        vertexShader: document.getElementById('vertexshaderDoor').textContent,
        fragmentShader: document.getElementById('fragmentshaderDoor').textContent,
    });

    // Luciérnagas
    const firefliesGeometry = new THREE.BufferGeometry();
    const firefliesCount = 35;
    const positionArray = new Float32Array(firefliesCount * 3);
    const scaleArray = new Float32Array(firefliesCount);

    for (let i = 0; i < firefliesCount; i++) {
        new THREE.Vector3((Math.random() - 0.5) * 3, (Math.random() * 2.5) * 1, (Math.random() - 0.5) * 4).toArray(positionArray, i * 3);
        scaleArray[i] = Math.random();
    }

    firefliesGeometry.setAttribute("position", new THREE.BufferAttribute(positionArray, 3));
    firefliesGeometry.setAttribute("aScale", new THREE.BufferAttribute(scaleArray, 1));

    const firefliesMaterial = new THREE.ShaderMaterial({
        uniforms: { uTime: { value: 0 }, uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) }, uSize: { value: 16 } },
        vertexShader: document.getElementById('vertexshader').textContent,
        fragmentShader: document.getElementById('fragmentshader').textContent,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });
    scene.add(new THREE.Points(firefliesGeometry, firefliesMaterial));

    // Modelo 3D
    const bakedTexture = textureLoader.load('https://rawcdn.githack.com/ricardoolivaalonso/ThreeJS-Room08/7937528ab05555575b588691c884195b73459f89/dist/baked.jpg');
    bakedTexture.flipY = false;
    bakedTexture.encoding = THREE.sRGBEncoding;

    const bakedMaterial = new THREE.MeshBasicMaterial({ map: bakedTexture, side: THREE.DoubleSide });

    const candle = ['Sphere001', 'Sphere002', 'Sphere003'];
    const bubbles = ['Vela_Flama', 'Vela_Flama002', 'Vela_Flama003', 'Vela_Flama004', 'Vela_Flama005', 'Vela_Flama006', 'Vela_Flama007', 'Vela_Flama008', 'Vela_Flama009', 'Vela_Flama010', 'Vela_Flama018', 'Vela_Flama019', 'Vela_Flama020', 'Vela_Flama021', 'Vela_Flama022', 'Vela_Flama023', 'Vela_Flama024'];

    const loader = new THREE.GLTFLoader();
    loader.load('https://rawcdn.githack.com/ricardoolivaalonso/ThreeJS-Room08/d54201d862fc2225142bdfec341a93a726a11a74/dist/model.glb',
        (gltf) => {
            const model = gltf.scene;
            model.traverse(child => {
                child.material = bakedMaterial;
                if (candle.includes(child.name)) child.material = candleMaterial;
                if (bubbles.includes(child.name)) child.material = bubbleMaterial;
                if (child.name === 'Foto') child.material = doorMaterial;
            });
            scene.add(model);
        }
    );

    // Post-procesamiento Bloom
    const renderScene = new THREE.RenderPass(scene, camera);
    const bloomPass = new THREE.UnrealBloomPass(new THREE.Vector2(sizes.width, sizes.height), 1, 1, 1);
    bloomPass.threshold = 0.1;
    bloomPass.strength = 0.4;
    bloomPass.radius = 1;

    composer = new THREE.EffectComposer(renderer);
    composer.addPass(renderScene);
    composer.addPass(bloomPass);

    window.addEventListener('resize', () => {
        sizes.width = window.innerWidth; sizes.height = window.innerHeight;
        camera.aspect = sizes.width / sizes.height; camera.updateProjectionMatrix();
        renderer.setSize(sizes.width, sizes.height); composer.setSize(sizes.width, sizes.height);
    });

    const clock = new THREE.Clock();
    const tick = () => {
        const elapsedTime = clock.getElapsedTime();
        candleMaterial.uniforms.time.value += 0.075;
        doorMaterial.uniforms.time.value += 0.1;
        bubbleMaterial.uniforms.time.value += 0.035;
        firefliesMaterial.uniforms.uTime.value = elapsedTime;

        controls.update();
        composer.render();
        window.requestAnimationFrame(tick);
    };
    tick();
}

/* ==========================================================================
   INTERACCIÓN CON EL MAPA DEL FONDO Y VENTANA MODAL CON GEOLOCALIZACIÓN
   ========================================================================== */
function openRegionModal(regionKey) {
    const data = regionalData[regionKey];
    if (!data) return;

    activeRegion = data;

    const modal = document.getElementById("region-modal");
    const titleEl = document.getElementById("modal-title");
    const tagEl = document.getElementById("modal-tag");
    const iconEl = document.getElementById("modal-icon");
    const descEl = document.getElementById("modal-description");
    const galleryEl = document.getElementById("modal-gallery");
    const chipsEl = document.getElementById("modal-chips-list");
    const mapsLink = document.getElementById("modal-maps-link");
    const resultBox = document.getElementById("location-result");

    if (titleEl) titleEl.textContent = data.title;
    if (tagEl) tagEl.textContent = data.tag;
    if (iconEl) iconEl.textContent = data.icon;
    if (descEl) descEl.textContent = data.desc;

    // Cargar galería de imágenes
    if (galleryEl && data.images) {
        galleryEl.innerHTML = data.images.map(url => `<img src="${url}" alt="Tradición ${data.title}" loading="lazy">`).join('');
    }

    // Cargar etiquetas
    if (chipsEl && data.elements) {
        chipsEl.innerHTML = data.elements.map(item => `<span class="modal-chip-item">${item}</span>`).join('');
    }

    // Link a Google Maps
    if (mapsLink) mapsLink.href = data.mapsUrl;

    // Ocultar feedback de ubicación anterior
    if (resultBox) resultBox.classList.add("location-hidden");

    if (modal) modal.classList.remove("modal-hidden");
}

function setupMapPins() {
    const pins = document.querySelectorAll(".map-pin-bg");

    pins.forEach(pin => {
        pin.addEventListener("click", function (e) {
            e.stopPropagation();
            const region = this.getAttribute("data-region");
            openRegionModal(region);
        });
    });

    const closeBtn = document.getElementById("close-modal-btn");
    if (closeBtn) {
        closeBtn.addEventListener("click", () => {
            document.getElementById("region-modal")?.classList.add("modal-hidden");
        });
    }
}

/* GEOLOCALIZACIÓN Y CÁLCULO DE DISTANCIA/TIEMPO ESTIMADO */
function setupGeolocationCalculator() {
    const gpsBtn = document.getElementById("btn-calc-location");
    const resultBox = document.getElementById("location-result");
    const textEl = document.getElementById("location-text");

    if (!gpsBtn) return;

    gpsBtn.addEventListener("click", () => {
        if (!navigator.geolocation) {
            alert("Tu navegador no soporta geolocalización.");
            return;
        }

        if (resultBox) resultBox.classList.remove("location-hidden");
        if (textEl) textEl.textContent = "Obteniendo tu posición GPS...";

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const userLat = position.coords.latitude;
                const userLng = position.coords.longitude;

                // Fórmula Haversine para distancia aproximada
                const R = 6371; // Radio de la tierra en km
                const dLat = (activeRegion.lat - userLat) * Math.PI / 180;
                const dLon = (activeRegion.lng - userLng) * Math.PI / 180;
                const a = 
                    Math.sin(dLat/2) * Math.sin(dLat/2) +
                    Math.cos(userLat * Math.PI / 180) * Math.cos(activeRegion.lat * Math.PI / 180) * 
                    Math.sin(dLon/2) * Math.sin(dLon/2);
                const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
                const distanceKm = Math.round(R * c);

                // Estimado de tiempo en carretera (promedio 80 km/h)
                const hours = Math.floor(distanceKm / 80);
                const minutes = Math.round(((distanceKm / 80) - hours) * 60);

                let timeText = `${hours}h ${minutes}min`;
                if (hours === 0) timeText = `${minutes} min`;

                if (textEl) {
                    textEl.innerHTML = `Distancia aproximada: <strong>${distanceKm} km</strong> · Tiempo estimado en auto: <strong>~${timeText}</strong>`;
                }

                // Actualizar enlace directo con ruta origen y destino
                const dirUrl = `https://www.google.com/maps/dir/?api=1&origin=${userLat},${userLng}&destination=${activeRegion.lat},${activeRegion.lng}`;
                const mapsLink = document.getElementById("modal-maps-link");
                if (mapsLink) mapsLink.href = dirUrl;
            },
            () => {
                if (textEl) textEl.textContent = "No se pudo acceder a tu ubicación. Abre directamente Google Maps.";
            }
        );
    });
}

/* CURSOR INTERACTIVO */
function setupCursor() {
    const cursor = document.querySelector(".cursor");
    const follower = document.querySelector(".cursor-follower");
    let mouseX = window.innerWidth / 2, mouseY = window.innerHeight / 2;
    let followerX = mouseX, followerY = mouseY;

    document.addEventListener("mousemove", (e) => {
        mouseX = e.clientX; mouseY = e.clientY;
        if (cursor) cursor.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;
    });

    document.querySelectorAll("a, button, .map-pin-bg").forEach(el => {
        el.addEventListener("mouseenter", () => follower?.classList.add("active"));
        el.addEventListener("mouseleave", () => follower?.classList.remove("active"));
    });

    function animate() {
        followerX += (mouseX - followerX) * 0.2;
        followerY += (mouseY - followerY) * 0.2;
        if (follower) follower.style.transform = `translate3d(${followerX}px, ${followerY}px, 0) translate(-50%, -50%)`;
        requestAnimationFrame(animate);
    }
    animate();
}

document.addEventListener("DOMContentLoaded", () => {
    setup3DOfrendaScene();
    setupMapPins();
    setupGeolocationCalculator();
    setupCursor();
});