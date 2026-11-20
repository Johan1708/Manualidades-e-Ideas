document.addEventListener('DOMContentLoaded', () => {
    // ==========================================================
    // 0. CURSOR FLUIDO CON INTERPOLACIÓN LERP Y ESTELA GALÁCTICA
    // ==========================================================
    const cursorDot = document.getElementById('galaxy-cursor-dot');
    const cursorRing = document.getElementById('galaxy-cursor-ring');
    const cursorCanvas = document.getElementById('galaxy-cursor-canvas');

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let dotX = mouseX, dotY = mouseY;
    let ringX = mouseX, ringY = mouseY;

    if (cursorCanvas) {
        cursorCanvas.width = window.innerWidth;
        cursorCanvas.height = window.innerHeight;
        const cCtx = cursorCanvas.getContext('2d');
        const trailParticles = [];

        window.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;

            for (let i = 0; i < 2; i++) {
                trailParticles.push({
                    x: mouseX + (Math.random() - 0.5) * 6,
                    y: mouseY + (Math.random() - 0.5) * 6,
                    size: Math.random() * 3.5 + 1,
                    alpha: 0.9,
                    color: Math.random() > 0.5 ? 'rgba(255, 255, 255, ' : 'rgba(180, 150, 255, '
                });
            }
            if (trailParticles.length > 50) trailParticles.splice(0, 2);
        });

        function renderCursorSmooth() {
            dotX += (mouseX - dotX) * 0.4;
            dotY += (mouseY - dotY) * 0.4;
            ringX += (mouseX - ringX) * 0.15;
            ringY += (mouseY - ringY) * 0.15;

            if (cursorDot) {
                cursorDot.style.left = `${dotX}px`;
                cursorDot.style.top = `${dotY}px`;
            }

            if (cursorRing) {
                cursorRing.style.left = `${ringX}px`;
                cursorRing.style.top = `${ringY}px`;
            }

            cCtx.clearRect(0, 0, cursorCanvas.width, cursorCanvas.height);

            for (let i = 0; i < trailParticles.length; i++) {
                const p = trailParticles[i];
                p.alpha -= 0.03;
                if (p.alpha <= 0) continue;

                cCtx.beginPath();
                cCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                cCtx.fillStyle = p.color + p.alpha + ')';
                cCtx.shadowBlur = 8;
                cCtx.shadowColor = '#ffffff';
                cCtx.fill();
            }

            requestAnimationFrame(renderCursorSmooth);
        }
        renderCursorSmooth();

        window.addEventListener('resize', () => {
            cursorCanvas.width = window.innerWidth;
            cursorCanvas.height = window.innerHeight;
        });
    }

    // ==========================================================
    // 0.1 MOTOR DE PARTÍCULAS PARA BOTONES (.btn)
    // ==========================================================
    function initButtonParticles(btnEl) {
        const canvas = btnEl.querySelector('.btn-canvas');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const NUM_PARTICLES = 40;
        const MAX_Z = 2;
        const MAX_R = 2;
        const Z_SPD = 2;
        const PARTICLES = [];
        let W = btnEl.offsetWidth || 160;
        let H = btnEl.offsetHeight || 45;
        let XO = W / 2;
        let YO = H / 2;
        let isGoing = false;

        class Vector {
            constructor(x, y, z) { this.x = x; this.y = y; this.z = z; }
            add(v) { this.x += v.x; this.y += v.y; this.z += v.z; }
            scale(n) { this.x *= n; this.y *= n; this.z *= n; }
        }

        function to2d(v) {
            return [(v.x - XO) / v.z + XO, (v.y - YO) / v.z + YO];
        }

        class Particle {
            constructor(x, y, z) {
                this.pos = new Vector(x, y, z);
                this.vel = new Vector(0, 0, -Z_SPD);
                this.vel.scale(0.01);
                this.fill = "rgba(255,255,255,0.7)";
            }

            update() { this.pos.add(this.vel); }

            render() {
                const PIXEL = to2d(this.pos);
                const X = PIXEL[0];
                const Y = PIXEL[1];
                const R = ((MAX_Z - this.pos.z) / MAX_Z) * MAX_R;

                if (X < 0 || X > W || Y < 0 || Y > H) this.pos.z = MAX_Z;

                this.update();
                ctx.beginPath();
                ctx.fillStyle = this.fill;
                ctx.arc(X, Y, R, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        for (let i = 0; i < NUM_PARTICLES; i++) {
            PARTICLES.push(new Particle(Math.random() * W, Math.random() * H, Math.random() * MAX_Z));
        }

        function loop() {
            requestAnimationFrame(loop);
            if (isGoing) {
                ctx.fillStyle = "rgba(0,0,0,0.18)";
                ctx.fillRect(0, 0, W, H);
                for (let i = 0; i < PARTICLES.length; i++) { PARTICLES[i].render(); }
            } else {
                ctx.clearRect(0, 0, W, H);
            }
        }

        btnEl.addEventListener('mouseenter', () => { isGoing = true; btnEl.classList.add('active'); });
        btnEl.addEventListener('mouseleave', () => { isGoing = false; btnEl.classList.remove('active'); });

        canvas.width = W;
        canvas.height = H;
        loop();
    }

    document.querySelectorAll('.btn-canvas-particle').forEach(btn => initButtonParticles(btn));

    const container = document.getElementById('webgl-container');
    if (!container) return;

    // ==========================================================
    // 1. MOTOR 3D Y ESCENA ALPINISTA
    // ==========================================================
    const scene = new THREE.Scene();
    const fogColor = new THREE.Color('#6c8ba4'); 
    scene.background = fogColor;
    scene.fog = new THREE.FogExp2(fogColor, 0.035); 

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15; 
    container.appendChild(renderer.domElement);

    const camera = new THREE.PerspectiveCamera(38, window.innerWidth / window.innerHeight, 0.1, 200);

    // Texturas Procedurales
    const noiseCanvas = document.createElement('canvas');
    noiseCanvas.width = 512; noiseCanvas.height = 512;
    const nCtx = noiseCanvas.getContext('2d');
    const imgData = nCtx.createImageData(512, 512);
    for(let i=0; i<imgData.data.length; i+=4) {
        let val = Math.random() * 255;
        imgData.data[i] = val; imgData.data[i+1] = val; imgData.data[i+2] = val; imgData.data[i+3] = 255;
    }
    nCtx.putImageData(imgData, 0, 0);
    const snowBumpMap = new THREE.CanvasTexture(noiseCanvas);
    snowBumpMap.wrapS = THREE.RepeatWrapping; snowBumpMap.wrapT = THREE.RepeatWrapping;
    snowBumpMap.repeat.set(40, 100);

    const fpCanvas = document.createElement('canvas');
    fpCanvas.width = 64; fpCanvas.height = 128;
    const fpCtx = fpCanvas.getContext('2d');
    const fpGrad = fpCtx.createRadialGradient(32, 64, 0, 32, 64, 30);
    fpGrad.addColorStop(0, 'rgba(30, 45, 65, 0.85)'); 
    fpGrad.addColorStop(1, 'rgba(30, 45, 65, 0)');
    fpCtx.fillStyle = fpGrad;
    fpCtx.fillRect(0, 0, 64, 128);
    const footprintTex = new THREE.CanvasTexture(fpCanvas);

    const partCanvas = document.createElement('canvas');
    partCanvas.width = 64; partCanvas.height = 64;
    const pCtx = partCanvas.getContext('2d');
    const pGrad = pCtx.createRadialGradient(32, 32, 0, 32, 32, 32);
    pGrad.addColorStop(0, 'rgba(255,255,255,1)');
    pGrad.addColorStop(1, 'rgba(255,255,255,0)');
    pCtx.fillStyle = pGrad;
    pCtx.fillRect(0, 0, 64, 64);
    const particleTex = new THREE.CanvasTexture(partCanvas);

    // Aurora Boreal
    const skyGeo = new THREE.SphereGeometry(140, 32, 32);
    const skyMat = new THREE.ShaderMaterial({
        uniforms: { uTime: { value: 0 } },
        side: THREE.BackSide, depthWrite: false,
        vertexShader: `
            varying vec3 vWorldPosition;
            void main() {
                vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform float uTime;
            varying vec3 vWorldPosition;
            void main() {
                vec3 dir = normalize(vWorldPosition);
                float h = dir.y;
                vec3 color = mix(vec3(0.02, 0.04, 0.08), vec3(0.08, 0.12, 0.2), max(0.0, h));
                float aurora1 = sin(dir.x * 5.0 + uTime * 0.4) * sin(dir.z * 4.0 + uTime * 0.2);
                float aurora2 = sin(dir.x * 7.0 - uTime * 0.6) * cos(dir.z * 6.0 + uTime * 0.3);
                float intensity = smoothstep(0.4, 0.8, (aurora1 + aurora2) * 0.5) * smoothstep(0.1, 0.6, h);
                color += vec3(0.1, 0.9, 0.6) * intensity * 0.8;
                gl_FragColor = vec4(color, 1.0);
            }
        `
    });
    scene.add(new THREE.Mesh(skyGeo, skyMat));

    // Iluminación
    scene.add(new THREE.AmbientLight(0x1a2535, 0.65));
    const sun = new THREE.DirectionalLight(0xffebd6, 3.2); 
    sun.position.set(0, 45, -5); sun.castShadow = true;
    sun.shadow.camera.near = 0.5; sun.shadow.camera.far = 80;
    sun.shadow.mapSize.width = 4096; sun.shadow.mapSize.height = 4096;
    scene.add(sun);
    const rimLight = new THREE.DirectionalLight(0x88bbff, 1.5); 
    rimLight.position.set(20, 15, 25); scene.add(rimLight);

    // Terreno Nieve
    const terrainSlope = 0.60; 
    const terrainGeo = new THREE.PlaneGeometry(120, 300, 256, 512);
    const pos = terrainGeo.attributes.position;
    
    for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i);
        const y = pos.getY(i);
        let elev = Math.sin(x*0.05) * Math.cos(y*0.05) * 4.0; 
        elev += Math.sin(x*0.2 + y*0.1) * 1.5;              
        elev += Math.sin(x*0.7 - y*0.5) * 0.4;              
        pos.setZ(i, elev);
    }
    terrainGeo.computeVertexNormals();

    const terrainMat = new THREE.MeshStandardMaterial({ 
        color: 0xebf2f9, roughness: 0.65, metalness: 0.1, bumpMap: snowBumpMap, bumpScale: 0.015, flatShading: true
    });
    const terrain = new THREE.Mesh(terrainGeo, terrainMat);
    terrain.rotation.x = -Math.PI / 2 + terrainSlope; 
    terrain.receiveShadow = true;
    scene.add(terrain);

    const bgMountains = new THREE.Group();
    scene.add(bgMountains);
    const mountGeo = new THREE.ConeGeometry(35, 90, 4); 
    const mountMat = new THREE.MeshBasicMaterial({ color: 0x2c3b4c, fog: true }); 
    for(let i=0; i<6; i++) {
        const m = new THREE.Mesh(mountGeo, mountMat);
        m.position.set((Math.random()-0.5)*160, 25, -120 - Math.random()*50);
        m.rotation.y = Math.random() * Math.PI;
        bgMountains.add(m);
    }

    // Huellas
    const maxFootprints = 300;
    const fpGeo = new THREE.PlaneGeometry(0.25, 0.4);
    fpGeo.rotateX(-Math.PI/2);
    const fpMat = new THREE.MeshBasicMaterial({ map: footprintTex, transparent: true, opacity: 0.85, depthWrite: false });
    const footprintInstanced = new THREE.InstancedMesh(fpGeo, fpMat, maxFootprints);
    footprintInstanced.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    scene.add(footprintInstanced);
    
    let fpIndex = 0;
    const dummy = new THREE.Object3D();
    
    function addFootprint(position) {
        dummy.position.copy(position);
        dummy.rotation.x = terrainSlope;
        dummy.position.y += 0.005; 
        dummy.updateMatrix();
        footprintInstanced.setMatrixAt(fpIndex, dummy.matrix);
        footprintInstanced.instanceMatrix.needsUpdate = true;
        fpIndex = (fpIndex + 1) % maxFootprints;
    }

    // Alpinista
    const character = new THREE.Group();
    scene.add(character);

    const cvs = document.createElement('canvas');
    cvs.width = 512; cvs.height = 512;
    const ctx = cvs.getContext('2d');
    ctx.fillStyle = '#888888'; ctx.fillRect(0,0,512,512);
    for(let i=0; i<40000; i++){
        ctx.fillStyle = Math.random() > 0.5 ? '#999999' : '#777777';
        ctx.fillRect(Math.random()*512, Math.random()*512, 2, 2);
    }
    const clothTex = new THREE.CanvasTexture(cvs);
    clothTex.wrapS = THREE.RepeatWrapping; clothTex.wrapT = THREE.RepeatWrapping;
    clothTex.repeat.set(8, 8);

    function deformPuffer(geo, rings, depth) {
        const pos = geo.attributes.position;
        for (let i = 0; i < pos.count; i++) {
            let y = pos.getY(i), x = pos.getX(i), z = pos.getZ(i);
            let p = Math.abs(Math.sin(y * rings)) * (depth * 1.5);
            let l = Math.sqrt(x*x + z*z);
            if (l > 0) { pos.setX(i, x + (x/l)*p); pos.setZ(i, z + (z/l)*p); }
        }
        geo.computeVertexNormals(); return geo;
    }

    function deformFolds(geo, freq, amp) {
        const pos = geo.attributes.position;
        for (let i = 0; i < pos.count; i++) {
            let y = pos.getY(i), x = pos.getX(i), z = pos.getZ(i);
            let noise = Math.sin(y*freq + x*freq) * Math.cos(z*freq - y*freq) * amp;
            let l = Math.sqrt(x*x + z*z);
            if (l > 0) { pos.setX(i, x + (x/l)*noise); pos.setZ(i, z + (z/l)*noise); }
        }
        geo.computeVertexNormals(); return geo;
    }

    const matJacket = new THREE.MeshStandardMaterial({ color: 0xeb341d, roughness: 0.5, bumpMap: clothTex, bumpScale: 0.02 }); 
    const matPants = new THREE.MeshStandardMaterial({ color: 0x161e2b, roughness: 0.85, bumpMap: clothTex, bumpScale: 0.02 });
    const matBag = new THREE.MeshStandardMaterial({ color: 0x181818, roughness: 0.75, bumpMap: clothTex, bumpScale: 0.01 });
    const matNylon = new THREE.MeshStandardMaterial({ color: 0x0f0f0f, roughness: 0.5 });
    const matVisor = new THREE.MeshPhysicalMaterial({ color: 0x050505, metalness: 0.95, roughness: 0.05, clearcoat: 1.0, clearcoatRoughness: 0.05 });
    const matSteel = new THREE.MeshStandardMaterial({ color: 0xdcdcdc, roughness: 0.2, metalness: 0.9 });
    const matGold = new THREE.MeshStandardMaterial({ color: 0xd4af37, roughness: 0.3, metalness: 0.8 });
    const matRope = new THREE.MeshStandardMaterial({ color: 0xff5500, roughness: 0.85, bumpMap: clothTex, bumpScale: 0.04 });
    const matGlove = new THREE.MeshStandardMaterial({ color: 0x1f1f1f, roughness: 0.6 });
    const matReinforce = new THREE.MeshStandardMaterial({ color: 0x111620, roughness: 0.7 });

    const hips = new THREE.Group();
    hips.position.y = 0.58; 
    hips.rotation.y = Math.PI; 
    character.add(hips);

    const harness = new THREE.Group(); harness.position.y = 0.05;
    const waistBelt = new THREE.Mesh(new THREE.TorusGeometry(0.20, 0.03, 16, 32), matNylon);
    waistBelt.rotation.x = Math.PI / 2; harness.add(waistBelt);
    
    for(let i=-1; i<=1; i+=2) {
        const loop = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.008, 8, 16), matNylon);
        loop.position.set(i*0.15, -0.05, -0.15); loop.rotation.y = i*0.5; harness.add(loop);
        const carabiner = new THREE.Mesh(new THREE.TorusGeometry(0.03, 0.006, 8, 16), matGold);
        carabiner.position.set(i*0.15, -0.1, -0.18); carabiner.rotation.y = Math.PI/2; harness.add(carabiner);
    }
    hips.add(harness);

    const torso = new THREE.Group(); torso.position.y = 0.05; hips.add(torso);
    const torsoMesh = new THREE.Mesh(deformPuffer(new THREE.CylinderGeometry(0.27, 0.21, 0.58, 32, 32), 36, 0.018), matJacket);
    torsoMesh.position.y = 0.28; torsoMesh.castShadow = true; torso.add(torsoMesh);

    const zipGeo = new THREE.BoxGeometry(0.02, 0.54, 0.03);
    const zipMesh = new THREE.Mesh(zipGeo, matSteel);
    zipMesh.position.set(0, 0.28, 0.22); torso.add(zipMesh);

    const flapGeo = new THREE.BoxGeometry(0.04, 0.54, 0.01);
    const flapMesh = new THREE.Mesh(flapGeo, matReinforce);
    flapMesh.position.set(0.02, 0.28, 0.225); torso.add(flapMesh);

    const packGroup = new THREE.Group(); packGroup.position.set(0, 0.32, -0.26); torso.add(packGroup);
    const bagGeo = new THREE.BoxGeometry(0.37, 0.60, 0.23, 16, 16, 16);
    const bagMain = new THREE.Mesh(bagGeo, matBag); bagMain.castShadow = true; packGroup.add(bagMain);

    const lid = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.14, 0.25), matBag);
    lid.position.set(0, 0.32, 0); lid.castShadow = true; packGroup.add(lid);

    const ropeGeo = new THREE.TorusKnotGeometry(0.11, 0.022, 100, 16, 2, 9);
    const rope = new THREE.Mesh(ropeGeo, matRope);
    rope.position.set(0, -0.08, -0.14); rope.castShadow = true; packGroup.add(rope);

    const headGroup = new THREE.Group(); headGroup.position.y = 0.56; torso.add(headGroup); 
    const head = new THREE.Object3D(); head.position.set(0, 0, 0.15); headGroup.add(head);

    const hood = new THREE.Mesh(new THREE.SphereGeometry(0.168, 32, 24), matJacket);
    hood.position.y = 0.11; hood.castShadow = true; headGroup.add(hood);

    const furGeo = new THREE.TorusGeometry(0.158, 0.045, 16, 64);
    const fPos = furGeo.attributes.position;
    for(let i=0; i<fPos.count; i++) { fPos.setXYZ(i, fPos.getX(i)+(Math.random()-0.5)*0.03, fPos.getY(i)+(Math.random()-0.5)*0.03, fPos.getZ(i)+(Math.random()-0.5)*0.03); }
    furGeo.computeVertexNormals();
    const fur = new THREE.Mesh(furGeo, new THREE.MeshStandardMaterial({color: 0x111111, roughness: 0.95}));
    fur.rotation.x = Math.PI/2; fur.position.set(0, 0.11, 0.12); headGroup.add(fur);

    const visor = new THREE.Mesh(new THREE.SphereGeometry(0.158, 32, 16, 0, Math.PI, 0, Math.PI / 2.5), matVisor);
    visor.rotation.x = -0.18; visor.position.set(0, 0.11, 0.03); headGroup.add(visor);

    const scarf = new THREE.Group(); scarf.position.y = 0.56; 
    const scarfMesh = new THREE.Mesh(deformFolds(new THREE.TorusGeometry(0.185, 0.075, 16, 32), 20, 0.015), matJacket);
    scarfMesh.rotation.x = Math.PI / 2; scarfMesh.position.y = 0.02; scarfMesh.castShadow = true;
    scarf.add(scarfMesh); hips.add(scarf);

    const tLen = 0.25, cLen = 0.25;

    function createExpeditionBoot() {
        const boot = new THREE.Group(); boot.position.set(0, -0.06, 0.06); 
        const bMain = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.14, 0.26), matNylon); bMain.castShadow = true; boot.add(bMain);
        const sole = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.02, 0.32), matNylon); sole.position.set(0, -0.08, 0.02); boot.add(sole);
        for(let z=-0.12; z<=0.12; z+=0.08) {
            for(let x=-0.06; x<=0.06; x+=0.12) {
                const spike = new THREE.Mesh(new THREE.ConeGeometry(0.015, 0.05, 4), matSteel);
                spike.position.set(x, -0.1, z+0.02); spike.rotation.x = Math.PI; boot.add(spike);
            }
        }
        return boot;
    }

    const lLeg = new THREE.Group(); lLeg.position.set(0.14, -0.10, 0); hips.add(lLeg);
    const lThigh = new THREE.Mesh(deformFolds(new THREE.CylinderGeometry(0.14, 0.105, tLen, 32, 16).translate(0, -tLen/2, 0), 25, 0.015), matPants); lThigh.castShadow = true; lLeg.add(lThigh);
    const lCalf = new THREE.Group(); lCalf.position.y = -tLen; lLeg.add(lCalf);
    lCalf.add(new THREE.Mesh(deformFolds(new THREE.CylinderGeometry(0.105, 0.085, cLen, 32, 16).translate(0, -cLen/2, 0), 25, 0.015), matPants));
    const lFoot = new THREE.Group(); lFoot.position.y = -cLen; lCalf.add(lFoot); lFoot.add(createExpeditionBoot());
    const lFootAnchor = new THREE.Object3D(); lFootAnchor.position.set(0, -0.12, 0); lFoot.add(lFootAnchor);

    const rLeg = new THREE.Group(); rLeg.position.set(-0.14, -0.10, 0); hips.add(rLeg);
    const rThigh = new THREE.Mesh(deformFolds(new THREE.CylinderGeometry(0.14, 0.105, tLen, 32, 16).translate(0, -tLen/2, 0), 25, 0.015), matPants); rThigh.castShadow = true; rLeg.add(rThigh);
    const rCalf = new THREE.Group(); rCalf.position.y = -tLen; rLeg.add(rCalf);
    rCalf.add(new THREE.Mesh(deformFolds(new THREE.CylinderGeometry(0.105, 0.085, cLen, 32, 16).translate(0, -cLen/2, 0), 25, 0.015), matPants));
    const rFoot = new THREE.Group(); rFoot.position.y = -cLen; rCalf.add(rFoot); rFoot.add(createExpeditionBoot());
    const rFootAnchor = new THREE.Object3D(); rFootAnchor.position.set(0, -0.12, 0); rFoot.add(rFootAnchor);

    const aLen = 0.48;
    const lArm = new THREE.Group(); lArm.position.set(0.28, 0.45, 0); torso.add(lArm); hips.add(lArm); 
    const lArmMesh = new THREE.Mesh(deformPuffer(new THREE.CylinderGeometry(0.11, 0.085, aLen, 32, 16).translate(0, -aLen/2, 0), 35, 0.01), matJacket);
    lArm.add(lArmMesh);
    const lElbow = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.1, 16), matReinforce);
    lElbow.position.set(0, -aLen/2, 0); lArm.add(lElbow);
    const lGlove = new THREE.Mesh(new THREE.SphereGeometry(0.09, 16, 16), matGlove); lGlove.position.set(0, -aLen, 0); lArm.add(lGlove);
    
    const rArm = new THREE.Group(); rArm.position.set(-0.28, 0.45, 0); torso.add(rArm); hips.add(rArm);
    const rArmMesh = new THREE.Mesh(deformPuffer(new THREE.CylinderGeometry(0.11, 0.085, aLen, 32, 16).translate(0, -aLen/2, 0), 35, 0.01), matJacket);
    rArm.add(rArmMesh);
    const rElbow = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.1, 16), matReinforce);
    rElbow.position.set(0, -aLen/2, 0); rArm.add(rElbow);
    const rGlove = new THREE.Mesh(new THREE.SphereGeometry(0.09, 16, 16), matGlove); rGlove.position.set(0, -aLen, 0); rArm.add(rGlove);

    // Ventisca ambiental
    const snowCount = 10000; 
    const snowGeo = new THREE.BufferGeometry();
    const snowPos = new Float32Array(snowCount * 3);
    for(let i=0; i<snowCount; i++) {
        snowPos[i*3] = (Math.random() - 0.5) * 90;
        snowPos[i*3+1] = Math.random() * 50;
        snowPos[i*3+2] = (Math.random() - 0.5) * 90;
    }
    snowGeo.setAttribute('position', new THREE.BufferAttribute(snowPos, 3));
    const snowSystem = new THREE.Points(snowGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.06, transparent: true, opacity: 0.75 }));
    scene.add(snowSystem);

    // Salpicadura de Nieve Suave al pisar
    const dustCount = 200;
    const dustPos = new Float32Array(dustCount * 3);
    const dustVel = new Float32Array(dustCount * 3);
    const dustLife = new Float32Array(dustCount);
    const dustGeo = new THREE.BufferGeometry();
    dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
    const dustSystem = new THREE.Points(dustGeo, new THREE.PointsMaterial({ 
        map: particleTex, 
        color: 0xffffff, 
        size: 0.75, 
        transparent: true, 
        opacity: 0.45, 
        depthWrite: false 
    }));
    scene.add(dustSystem);

    function triggerDust(pos) {
        for(let i=0; i<dustCount; i++) {
            if(dustLife[i] <= 0) {
                for(let j=0; j<18; j++) {
                    let idx = (i+j) % dustCount;
                    dustPos[idx*3] = pos.x + (Math.random()-0.5)*0.3;
                    dustPos[idx*3+1] = pos.y + 0.08;
                    dustPos[idx*3+2] = pos.z + (Math.random()-0.5)*0.3;
                    
                    dustVel[idx*3] = (Math.random()-0.5)*2.2;
                    dustVel[idx*3+1] = Math.random()*1.8 + 1.2; 
                    dustVel[idx*3+2] = (Math.random()-0.5)*2.2;
                    dustLife[idx] = 1.0;
                }
                break;
            }
        }
    }

    // Vapor de Aliento
    const breathCount = 50;
    const breathPos = new Float32Array(breathCount * 3);
    const breathVel = new Float32Array(breathCount * 3);
    const breathLife = new Float32Array(breathCount);
    const breathGeo = new THREE.BufferGeometry();
    breathGeo.setAttribute('position', new THREE.BufferAttribute(breathPos, 3));
    const breathSystem = new THREE.Points(breathGeo, new THREE.PointsMaterial({ map: particleTex, color: 0xffffff, size: 0.8, transparent: true, opacity: 0.15, depthWrite: false }));
    scene.add(breathSystem);

    function triggerBreath(headPos) {
        for(let i=0; i<breathCount; i++) {
            if(breathLife[i] <= 0) {
                for(let j=0; j<8; j++) {
                    let idx = (i+j) % breathCount;
                    breathPos[idx*3] = headPos.x;
                    breathPos[idx*3+1] = headPos.y;
                    breathPos[idx*3+2] = headPos.z + 0.2; 
                    breathVel[idx*3] = (Math.random()-0.5)*0.5;
                    breathVel[idx*3+1] = Math.random()*0.5 + 0.5;
                    breathVel[idx*3+2] = Math.random()*1.0 + 0.5; 
                    breathLife[idx] = 1.0;
                }
                break;
            }
        }
    }

    // Bucle Principal de Animación
    const clock = new THREE.Clock();
    let moveZ = 0;
    const climbSpeed = 0.28; 
    
    const cameraTarget = new THREE.Vector3();
    const cameraPos = new THREE.Vector3();

    const raycaster = new THREE.Raycaster();
    const downVector = new THREE.Vector3(0, -1, 0);

    let lastLPhase = false;
    let lastRPhase = false;
    let breathTimer = 0;

    function animate() {
        requestAnimationFrame(animate);
        const delta = Math.min(clock.getDelta(), 0.05);
        const time = clock.getElapsedTime();
        
        const strideSpeed = 1.8; 
        const t = time * strideSpeed;
        
        const windStrength = 2.5 + Math.sin(time * 0.8) * 1.5;
        const windX = Math.sin(time * 0.4) * windStrength;
        const windWave = Math.cos(time * 6.0) * 0.12 * windStrength;

        moveZ -= delta * climbSpeed;
        character.position.z = moveZ;
        
        const rayOrigin = new THREE.Vector3(character.position.x, 30, character.position.z);
        raycaster.set(rayOrigin, downVector);
        const intersects = raycaster.intersectObject(terrain);
        
        if (intersects.length > 0) {
            const groundY = intersects[0].point.y;
            character.position.y += (groundY + 0.45 - character.position.y) * 0.2;
        }

        hips.rotation.x = 0.56; 
        hips.rotation.z = Math.sin(t) * 0.06;
        hips.position.y = 0.58 + Math.abs(Math.sin(t)) * 0.07; 
        
        const breathScale = 1.0 + Math.sin(time * 1.8) * 0.04;
        torsoMesh.scale.set(breathScale, 1.0, breathScale);
        
        torso.rotation.y = -Math.sin(t) * 0.20; 
        headGroup.rotation.y = Math.sin(t) * 0.09; 
        headGroup.rotation.x = -0.25; 
        
        scarf.rotation.x = -Math.PI / 3 + Math.sin(time * 4) * 0.25;
        scarf.rotation.z = windX * 0.15 + windWave;

        const lWalk = Math.sin(t);
        lThigh.rotation.x = lWalk * 0.58 + 0.38; 
        lCalf.rotation.x = lWalk > 0 ? -lWalk * 0.90 : -0.14;
        lFoot.rotation.x = -lThigh.rotation.x - lCalf.rotation.x + 0.48;

        const rWalk = Math.sin(t + Math.PI);
        rThigh.rotation.x = rWalk * 0.58 + 0.38;
        rCalf.rotation.x = rWalk > 0 ? -rWalk * 0.90 : -0.14;
        rFoot.rotation.x = -rThigh.rotation.x - rCalf.rotation.x + 0.48;

        const currentLPhase = lWalk < 0;
        if(currentLPhase && !lastLPhase) {
            const pos = new THREE.Vector3(); lFootAnchor.getWorldPosition(pos);
            addFootprint(pos); triggerDust(pos);
        }
        lastLPhase = currentLPhase;

        const currentRPhase = rWalk < 0;
        if(currentRPhase && !lastRPhase) {
            const pos = new THREE.Vector3(); rFootAnchor.getWorldPosition(pos);
            addFootprint(pos); triggerDust(pos);
        }
        lastRPhase = currentRPhase;

        rArm.rotation.x = Math.sin(t + Math.PI) * 0.52 + 0.22;
        rArm.rotation.z = -0.18 + windWave * 0.3;

        lArm.rotation.x = Math.sin(t) * 0.52 + 0.22;
        lArm.rotation.z = 0.18 + windWave * 0.3;
        
        const sPos = snowSystem.geometry.attributes.position.array;
        for(let i=0; i<snowCount; i++) {
            sPos[i*3] -= delta * (60 + windX * 12); 
            sPos[i*3+1] -= delta * 10; 
            if(sPos[i*3+1] < character.position.y - 5 || sPos[i*3] < character.position.x - 45) {
                sPos[i*3+1] = character.position.y + 40;
                sPos[i*3] = character.position.x + 45 + (Math.random() - 0.5) * 20;
                sPos[i*3+2] = character.position.z + (Math.random() - 0.5) * 90;
            }
        }
        snowSystem.geometry.attributes.position.needsUpdate = true;

        for(let i=0; i<dustCount; i++) {
            if(dustLife[i] > 0) {
                dustLife[i] -= delta * 1.8;
                dustPos[i*3] += (dustVel[i*3] + windX * 2.0) * delta;
                dustPos[i*3+1] += dustVel[i*3+1] * delta;
                dustPos[i*3+2] += dustVel[i*3+2] * delta;
            } else { dustPos[i*3+1] = -999; }
        }
        dustSystem.geometry.attributes.position.needsUpdate = true;

        breathTimer += delta;
        if(breathTimer > 2.2) {
            const hp = new THREE.Vector3(); head.getWorldPosition(hp);
            triggerBreath(hp); breathTimer = 0;
        }

        for(let i=0; i<breathCount; i++) {
            if(breathLife[i] > 0) {
                breathLife[i] -= delta * 0.8;
                breathPos[i*3] += (breathVel[i*3] + windX * 0.8) * delta;
                breathPos[i*3+1] += breathVel[i*3+1] * delta;
                breathPos[i*3+2] += breathVel[i*3+2] * delta;
            } else { breathPos[i*3+1] = -999; }
        }
        breathSystem.geometry.attributes.position.needsUpdate = true;

        const shiver = Math.sin(time * 2) * 0.012; 
        const stepBob = Math.abs(Math.sin(t)) * - 0.12; 
        
        const idealCamPosX = character.position.x + Math.sin(time * 0.5) * 0.5 + shiver; 
        const idealCamPosY = character.position.y + 1.15 + stepBob; 
        const idealCamPosZ = character.position.z + 4.8; 
        
        cameraPos.lerp(new THREE.Vector3(idealCamPosX, idealCamPosY, idealCamPosZ), 0.06); 
        camera.position.copy(cameraPos);
        
        const idealTarget = new THREE.Vector3(character.position.x, character.position.y + 0.8, character.position.z - 5);
        cameraTarget.lerp(idealTarget, 0.08);
        camera.lookAt(cameraTarget);
        skyMat.uniforms.uTime.value = time;
        renderer.render(scene, camera);
    }
    animate();

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    setTimeout(() => {
        document.getElementById('glass-container')?.classList.add('visible');
        document.getElementById('fog-overlay')?.classList.add('cleared');
    }, 4000);

    // ==========================================================
    // 2. BASE DE DATOS EXTENDIDA
    // ==========================================================
    const sectionsDatabase = {
        objetos: [
            {
                title: "Reloj Casio Vintage Stainless Steel",
                age: "maduro",
                price: 979,
                formattedPrice: "$979 MXN",
                location: "Amazon México",
                img: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80",
                desc: "Reloj retro acero inoxidable con cronómetro digital, alarma y resistencia al agua.",
                shopUrl: "https://www.amazon.com.mx/s?k=reloj+casio+vintage+hombre"
            },
            {
                title: "Termo Negro 30oz Grabado Láser",
                age: "joven",
                price: 350,
                formattedPrice: "$350 MXN",
                location: "Mercado Libre México",
                img: "https://images.unsplash.com/photo-1511556532299-8f662fc26c06?auto=format&fit=crop&w=600&q=80",
                desc: "Termo de acero grabado con nombre personalizado. Bebidas frías por 24 horas.",
                shopUrl: "https://listado.mercadolibre.com.mx/termo-dia-del-padre-personalizado"
            },
            {
                title: "Kit Asador Profesional en Estuche",
                age: "maduro",
                price: 999,
                formattedPrice: "$999 MXN",
                location: "Amazon México",
                img: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80",
                desc: "Estuche ejecutivo de aluminio con 20 utensilios de acero inoxidable para parrillada.",
                shopUrl: "https://www.amazon.com.mx/s?k=kit+asador+profesional+para+regalo"
            },
            {
                title: "Bocina Bluetooth Portátil Resistent",
                age: "joven",
                price: 850,
                formattedPrice: "$850 MXN",
                location: "Amazon México",
                img: "https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=600&q=80",
                desc: "Sonido envolvente 360°, impermeable IPX7 y batería de 15 horas.",
                shopUrl: "https://www.amazon.com.mx/s?k=bocina+bluetooth+portatil+resistente"
            },
            {
                title: "Billetera Piel Tarjetero RFID",
                age: "mayor",
                price: 420,
                formattedPrice: "$420 MXN",
                location: "Mercado Libre México",
                img: "https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=600&q=80",
                desc: "Cartera de piel genuina con desplegable pop-up y protección antirrobo de datos.",
                shopUrl: "https://listado.mercadolibre.com.mx/billetera-hombre-rfid-piel"
            },
            {
                title: "Vasos de Whisky con Piedras de Basalto",
                age: "maduro",
                price: 490,
                formattedPrice: "$490 MXN",
                location: "Amazon México",
                img: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=600&q=80",
                desc: "Set de 2 vasos de cristal con piedras refrigerantes en caja de madera de lujo.",
                shopUrl: "https://www.amazon.com.mx/s?k=vasos+whisky+piedras+regalo"
            },
            {
                title: "Set Grooming & Barba de Lujo",
                age: "joven",
                price: 299,
                formattedPrice: "$299 MXN",
                location: "Amazon México",
                img: "https://images.unsplash.com/photo-1621607512214-68297480165e?auto=format&fit=crop&w=600&q=80",
                desc: "Aceite de argán, bálsamo, cepillo de cerdas naturales y tijeras de precisión.",
                shopUrl: "https://www.amazon.com.mx/s?k=kit+barba+grooming+regalo"
            }
        ],
        manualidades: [
            {
                id: "man-1",
                title: "Llavero de Cuero Grabado DIY",
                age: "joven",
                price: 0,
                formattedPrice: "DIY / GRATIS",
                location: "Materiales caseros",
                img: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=600&q=80",
                desc: "Corta y pirograba las iniciales de papá en un sobrante de piel sintética con argolla metálica.",
                isTutorial: true,
                tutorialSteps: [
                    { step: "Paso 1: Medir tira", text: "Corta un rectángulo de piel o sintético de 12x2 cm." },
                    { step: "Paso 2: Grabado", text: "Usa un cautín de punta fina o marcador permanente para grabar las iniciales." },
                    { step: "Paso 3: Argolla", text: "Haz una perforación en un extremo e inserta la argolla para llaves." }
                ]
            },
            {
                id: "man-2",
                title: "Marco 3D con Palitos de Madera",
                age: "joven",
                price: 0,
                formattedPrice: "DIY / GRATIS",
                location: "Materiales de reciclaje",
                img: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=600&q=80",
                desc: "Construye un marco rústico pegando palitos de paleta pintados en titanio o negro mate.",
                isTutorial: true,
                tutorialSteps: [
                    { step: "Paso 1: Estructura", text: "Pega 4 palitos formando un marco cuadrado con silicón frío." },
                    { step: "Paso 2: Pintura", text: "Pinta la estructura con acrílico negro mate o gris oscuro." },
                    { step: "Paso 3: Colocar Foto", text: "Pega la fotografía por la parte posterior con pegamento." }
                ]
            },
            {
                id: "man-3",
                title: "Organizador Rústico con Latas",
                age: "maduro",
                price: 0,
                formattedPrice: "DIY / GRATIS",
                location: "Reciclaje de cocina",
                img: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=80",
                desc: "Pinta latas de conserva en negro mate, pégalas sobre madera y envuélvelas con mecate de yute.",
                isTutorial: true,
                tutorialSteps: [
                    { step: "Paso 1: Limpieza y Pintura", text: "Lava 3 latas vacías, retira bordes filosos y píntalas con acrílico negro." },
                    { step: "Paso 2: Envoltorio", text: "Pega cuerda de yute en la parte media o inferior de las latas con silicón." },
                    { step: "Paso 3: Montaje", text: "Pega las latas juntas sobre un cartón grueso o trozo de tabla de madera." }
                ]
            },
            {
                id: "man-4",
                title: "Arte 3D con Hilos y Clavos",
                age: "joven",
                price: 0,
                formattedPrice: "DIY / GRATIS",
                location: "Madera casera e hilo",
                img: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=600&q=80",
                desc: "Traza una figura de montaña o corazón en madera, coloca chinches/clavos y entrecruza hilo.",
                isTutorial: true,
                tutorialSteps: [
                    { step: "Paso 1: Dibujo", text: "Traza el contorno de una montaña o corazón sobre una tabla de madera." },
                    { step: "Paso 2: Clavado", text: "Clava clavitos pequeños o chinches a lo largo del contorno a 1 cm de distancia." },
                    { step: "Paso 3: Tejido", text: "Amarra el hilo en un clavo y entrecrúzalo en todas direcciones hasta llenar el diseño." }
                ]
            },
            {
                id: "man-5",
                title: "Portalentes con Pinza de Madera",
                age: "mayor",
                price: 0,
                formattedPrice: "DIY / GRATIS",
                location: "Pinza y tabla",
                img: "https://images.unsplash.com/photo-1591076482161-42ce6da69f67?auto=format&fit=crop&w=600&q=80",
                desc: "Cuelga una pinza de ropa de madera sobre una tablita decorada para sujetar los lentes de papá.",
                isTutorial: true,
                tutorialSteps: [
                    { step: "Paso 1: Pintar tabla", text: "Decora un trozo de madera con una frase como 'Lentes de Papá'." },
                    { step: "Paso 2: Pegar pinza", text: "Pega una pinza de madera en el centro usando silicón líquido." },
                    { step: "Paso 3: Colgador", text: "Agrega una cinta o cordón por detrás para poder colgarlo en la pared." }
                ]
            },
            {
                id: "man-6",
                title: "Tarjeta Caja de Herramientas",
                age: "joven",
                price: 0,
                formattedPrice: "DIY / GRATIS",
                location: "Cartulinas y tijeras",
                img: "https://images.unsplash.com/photo-1581783342308-f792dbdd27c5?auto=format&fit=crop&w=600&q=80",
                desc: "Maletín de cartulina con cupones recortables (lavado de auto, botana a la cama, etc.).",
                isTutorial: true,
                tutorialSteps: [
                    { step: "Paso 1: Recorte", text: "Corta una cartulina roja formando la silueta de una caja de herramientas." },
                    { step: "Paso 2: Cupones", text: "Escribe 5 cupones como 'Vale por un café', 'Vale por lavar el coche'." },
                    { step: "Paso 3: Armado", text: "Inserta los cupones dentro de la tarjeta y decora con marcadores." }
                ]
            },
            {
                id: "man-7",
                title: "Posavasos Espiral de Yute",
                age: "maduro",
                price: 0,
                formattedPrice: "DIY / GRATIS",
                location: "Cartón y cordón",
                img: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80",
                desc: "Círculos de cartón grueso forrados con mecate en espiral pegado con silicón caliente.",
                isTutorial: true,
                tutorialSteps: [
                    { step: "Paso 1: Base", text: "Corta círculos de cartón de 10 cm de diámetro." },
                    { step: "Paso 2: Espiral", text: "Aplica silicón desde el centro e ir enrollando la cuerda de yute en espiral." },
                    { step: "Paso 3: Sellado", text: "Corta el sobrante de cuerda y sella con una gota de silicón en la orilla." }
                ]
            }
        ],
        lugares: [
            {
                title: "Cerro de las Campanas",
                age: "mayor",
                price: 20,
                formattedPrice: "$18 - $20 MXN / Gratis INAPAM",
                location: "Centro Histórico, Querétaro",
                img: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80",
                desc: "Parque histórico arbolado con vista panorámica, jardines y la capilla donde culminó el imperio.",
                mapsUrl: "https://www.google.com/maps/search/?api=1&query=Cerro+de+las+Campanas+Queretaro"
            },
            {
                title: "Museo de Arte de Querétaro (MAQRO)",
                age: "mayor",
                price: 0,
                formattedPrice: "ENTRADA LIBRE ($0 MXN)",
                location: "Exconvento San Agustín, Querétaro",
                img: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=600&q=80",
                desc: "Recorrido por uno de los patios barrocos más hermosos de América Latina y exposiciones de arte.",
                mapsUrl: "https://www.google.com/maps/search/?api=1&query=Museo+de+Arte+de+Queretaro"
            },
            {
                title: "Zona Arqueológica El Cerrito",
                age: "maduro",
                price: 0,
                formattedPrice: "GRATIS en Domingo / < $20 MXN",
                location: "El Pueblito, Corregidora",
                img: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80",
                desc: "Caminata al aire libre alrededor de la gran pirámide con acceso a su museo de sitio.",
                mapsUrl: "https://www.google.com/maps/search/?api=1&query=Zona+Arqueologica+El+Cerrito+Queretaro"
            },
            {
                title: "Paseo por la Alameda Hidalgo",
                age: "mayor",
                price: 0,
                formattedPrice: "GRATIS ($0 MXN)",
                location: "Av. Zaragoza, Querétaro",
                img: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=600&q=80",
                desc: "Caminata bajo fresnos y sauces centenarios, quiosco central y andadores llenos de sombra.",
                mapsUrl: "https://www.google.com/maps/search/?api=1&query=Alameda+Hidalgo+Queretaro"
            },
            {
                title: "Mirador de Los Arcos y Templo de la Cruz",
                age: "joven",
                price: 0,
                formattedPrice: "GRATIS ($0 MXN)",
                location: "La Cruz, Santiago de Querétaro",
                img: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80",
                desc: "Caminata por la calzada del acueducto icónico de la ciudad y atardecer desde el mirador.",
                mapsUrl: "https://www.google.com/maps/search/?api=1&query=Mirador+de+los+Arcos+Queretaro"
            },
            {
                title: "Cervecería Hércules",
                age: "joven",
                price: 650,
                formattedPrice: "$650 MXN (Consumo prom.)",
                location: "Hércules, Santiago de Querétaro",
                img: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80",
                desc: "Cerveza artesanal hecha en casa, ambiente industrial al aire libre y gastronomía internacional.",
                mapsUrl: "https://www.google.com/maps/search/?api=1&query=Cerveceria+Hercules+Queretaro"
            },
            {
                title: "Recorrido y Cata en Viñedos Freixenet",
                age: "maduro",
                price: 850,
                formattedPrice: "$850 MXN por persona",
                location: "Ezequiel Montes, Querétaro",
                img: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=600&q=80",
                desc: "Visita a las cavas subterráneas a 25 metros de profundidad con degustación de vinos.",
                mapsUrl: "https://www.google.com/maps/search/?api=1&query=Vinedos+Freixenet+Queretaro"
            }
        ]
    };

    let currentSectionKey = "objetos";
    const track = document.getElementById('ogl-track');
    const ageSelect = document.getElementById('age-select');
    const priceSelect = document.getElementById('price-select');
    const galeriaTitle = document.getElementById('galeria-title');

    // ==========================================================
    // 3. MOTOR RULETA 3D INTERACTIVA DENTRO DEL MODAL
    // ==========================================================
    let rouletteAngle = 0;

    function update3DRoulettePositions() {
        if (!track) return;
        const cards = track.querySelectorAll('.ogl-card');
        const count = cards.length;
        if (count === 0) return;

        const radiusX = Math.min(window.innerWidth * 0.35, 480); 
        const radiusZ = 220; 
        const step = (Math.PI * 2) / count;

        cards.forEach((card, i) => {
            const angle = rouletteAngle + (i * step);
            const x = Math.sin(angle) * radiusX;
            const z = Math.cos(angle) * radiusZ;
            
            const scale = 0.68 + ((z + radiusZ) / (radiusZ * 2)) * 0.32;
            const opacity = z < -80 ? 0.3 : 1.0; 
            const zIndex = Math.floor(z + radiusZ + 10);

            card.style.transform = `translate3d(${x}px, 0px, ${z}px) scale(${scale})`;
            card.style.opacity = opacity;
            card.style.zIndex = zIndex;

            if (scale > 0.92) {
                card.classList.add('active-card');
                card.style.pointerEvents = 'auto';
            } else {
                card.classList.remove('active-card');
                card.style.pointerEvents = z < -50 ? 'none' : 'auto';
            }
        });
    }

    function rotateRoulette(direction) {
        if (!track) return;
        const cards = track.querySelectorAll('.ogl-card');
        if (cards.length === 0) return;
        const step = (Math.PI * 2) / cards.length;
        rouletteAngle += direction * step;
        update3DRoulettePositions();
    }

    function renderSectionGallery() {
        if (!track) return;
        track.innerHTML = '';
        rouletteAngle = 0;
        
        const titlesMap = {
            objetos: "Objetos & Regalos (Amazon / Mercado Libre)",
            manualidades: "Manualidades DIY Paso a Paso (Económicas)",
            lugares: "Lugares para Visitar & Experiencias ($0 - $20 MXN o Más)"
        };
        if (galeriaTitle) galeriaTitle.textContent = titlesMap[currentSectionKey] || "Sección Seleccionada";

        const currentData = sectionsDatabase[currentSectionKey] || [];
        const selectedAge = ageSelect ? ageSelect.value : 'all';
        const selectedPrice = priceSelect ? priceSelect.value : 'all';

        const filtered = currentData.filter(item => {
            const matchesAge = selectedAge === 'all' || item.age === selectedAge;
            const matchesPrice = selectedPrice === 'all' || item.price <= parseFloat(selectedPrice);
            return matchesAge && matchesPrice;
        });

        filtered.forEach((item, index) => {
            const card = document.createElement('div');
            card.className = 'ogl-card roulette-3d-card';
            const numStr = (index + 1).toString().padStart(2, '0');
            
            let actionBtnHtml = "";
            if (item.isTutorial) {
                actionBtnHtml = `<div class="box" style="width:100%"><button class="btn btn-canvas-particle btn-card-action open-tut-btn" data-id="${item.id}" style="width:100%"><span><i class="fa-solid fa-book-open"></i> Ver Tutorial</span><canvas class="btn-canvas"></canvas></button></div>`;
            } else {
                const targetUrl = item.shopUrl || item.mapsUrl;
                actionBtnHtml = `<div class="box" style="width:100%"><a href="${targetUrl}" target="_blank" class="btn btn-canvas-particle btn-card-action" style="width:100%"><span><i class="fa-solid fa-cart-shopping"></i> Comprar / Ver Mapa</span><canvas class="btn-canvas"></canvas></a></div>`;
            }

            card.innerHTML = `
                <div class="ogl-card-img"><img src="${item.img}" alt="${item.title}"><span class="ogl-index-num">${numStr}</span><span class="ogl-price-tag">${item.formattedPrice}</span></div>
                <div class="ogl-card-body"><h4>${item.title}</h4><span class="ogl-location-info"><i class="fa-solid fa-store"></i> ${item.location}</span><p class="ogl-details">${item.desc}</p>${actionBtnHtml}</div>
            `;
            track.appendChild(card);
            
            const newBtn = card.querySelector('.btn-canvas-particle');
            if (newBtn) initButtonParticles(newBtn);
        });

        window.dispatchEvent(new Event('orbit:cards-updated'));
        setTimeout(update3DRoulettePositions, 50);
    }

    if (ageSelect) ageSelect.addEventListener('change', renderSectionGallery);
    if (priceSelect) priceSelect.addEventListener('change', renderSectionGallery);

    // Asistente IA
    const iaInput = document.getElementById('ia-user-input');
    const iaSendBtn = document.getElementById('ia-send-btn');
    const iaChatBox = document.getElementById('ia-chat-box');

    function processIaResponse() {
        if (!iaInput || !iaChatBox) return;
        const text = iaInput.value.trim();
        if (!text) return;

        const userDiv = document.createElement('div');
        userDiv.className = 'chat-msg user-msg';
        userDiv.innerHTML = `<span>${text}</span>`;
        iaChatBox.appendChild(userDiv);
        iaInput.value = '';

        iaChatBox.scrollTop = iaChatBox.scrollHeight;

        setTimeout(() => {
            const aiDiv = document.createElement('div');
            aiDiv.className = 'chat-msg ai-msg';
            const query = text.toLowerCase();
            let responseStr = "";

            if (query.includes("20") || query.includes("gratis") || query.includes("barato") || query.includes("parque")) {
                responseStr = "🌳 **Opciones por $20 o GRATIS en QRO:** El **Cerro de las Campanas ($18-$20 MXN)**, el **Museo de Arte MAQRO ($0 MXN)** o la pirámide de **El Cerrito** son increíbles opciones.";
            } else if (query.includes("cuero") || query.includes("lata") || query.includes("madera") || query.includes("casa")) {
                responseStr = "💡 **Recomendación DIY:** El **Organizador Rústico con Latas** o el **Arte con Hilos y Clavos** se hacen con cosas de casa por $0 MXN. ¡Abre la sección de Manualidades para ver las instrucciones!";
            } else if (query.includes("300") || query.includes("500") || query.includes("termo")) {
                responseStr = "🎁 **Ideal con tu presupuesto:** El **Termo Negro Grabado ($350 MXN)** en Mercado Libre o los **Vasos de Whisky con Piedras ($490 MXN)** en Amazon son excelentes opciones.";
            } else {
                responseStr = "✨ **Guía Inteligente:** Revisa nuestras 20 categorías de Objetos, Manualidades paso a paso o Paseos en Querétaro (varias gratis o por menos de $20 MXN) desde el Menú.";
            }

            aiDiv.innerHTML = `<i class="fa-solid fa-robot"></i> <span>${responseStr}</span>`;
            iaChatBox.appendChild(aiDiv);
            iaChatBox.scrollTop = iaChatBox.scrollHeight;
        }, 400);
    }

    if (iaSendBtn) iaSendBtn.onclick = (e) => { e.preventDefault(); processIaResponse(); };
    if (iaInput) iaInput.onkeydown = (e) => { if (e.key === 'Enter') { e.preventDefault(); processIaResponse(); } };

    // Gestor Global de Clics Corregido
    const menuOverlay = document.getElementById("menu-overlay");

    function closeAllModals() { document.querySelectorAll('.popup-modal').forEach(m => m.classList.remove('active')); }
    function openMenu() { closeAllModals(); if (menuOverlay) menuOverlay.classList.add('active'); }
    function closeMenu() { if (menuOverlay) menuOverlay.classList.remove('active'); }

    document.addEventListener('click', (e) => {
        const btnReturnMenu = e.target.closest('#btn-return-menu');
        if (btnReturnMenu) {
            e.preventDefault();
            openMenu();
            return;
        }

        const btnHome = e.target.closest('#btn-home-alpinista, #btn-return-alpinista');
        if (btnHome) {
            const href = btnHome.getAttribute('href');
            if (href && href !== '#' && !href.startsWith('javascript')) {
                window.location.href = href;
            } else {
                e.preventDefault();
                closeAllModals();
                closeMenu();
            }
            return;
        }

        if (e.target.closest('#toggle-menu-btn, #btn-ver-mas-regalos')) {
            e.preventDefault(); 
            openMenu(); 
            return;
        }

        if (e.target.closest('#close-menu-btn')) { 
            e.preventDefault(); 
            closeMenu(); 
            return; 
        }

        const closeMod = e.target.closest('.close-modal, #close-tutorial');
        if (closeMod) {
            e.preventDefault();
            const parentModal = closeMod.closest('.popup-modal');
            if (parentModal) parentModal.classList.remove('active');
            return;
        }

        const tutBtn = e.target.closest('.open-tut-btn');
        if (tutBtn) {
            e.preventDefault();
            const tutId = tutBtn.getAttribute('data-id');
            const itemData = sectionsDatabase.manualidades.find(m => m.id === tutId);
            if (itemData) {
                const tutTitle = document.getElementById('tut-title');
                const tutImg = document.getElementById('tut-img');
                const stepsList = document.getElementById('tut-steps-list');

                if (tutTitle) tutTitle.textContent = itemData.title;
                if (tutImg) tutImg.src = itemData.img;
                if (stepsList) {
                    stepsList.innerHTML = '';
                    itemData.tutorialSteps.forEach(s => {
                        const stepDiv = document.createElement('div');
                        stepDiv.className = 'tut-step-item';
                        stepDiv.innerHTML = `<h5>${s.step}</h5><p>${s.text}</p>`;
                        stepsList.appendChild(stepDiv);
                    });
                }
                document.getElementById('modal-tutorial')?.classList.add('active');
            }
        }
    });

    const menuItems = document.getElementsByClassName("menu-item");
    Array.from(menuItems).forEach((item) => {
        item.addEventListener('click', () => {
            const sectionKey = item.getAttribute('data-section');
            const targetModalId = item.getAttribute('data-modal');
            
            closeMenu();
            closeAllModals();

            if (sectionKey) {
                currentSectionKey = sectionKey;
                renderSectionGallery();
                document.getElementById('modal-galeria')?.classList.add('active');
            } else if (targetModalId) {
                document.getElementById(targetModalId)?.classList.add('active');
            }
        });
    });

    // Flechas de navegación para girar la ruleta 3D
    const prevBtn = document.getElementById('gallery-prev');
    const nextBtn = document.getElementById('gallery-next');

    if (prevBtn) prevBtn.onclick = (e) => { e.preventDefault(); rotateRoulette(-1); };
    if (nextBtn) nextBtn.onclick = (e) => { e.preventDefault(); rotateRoulette(1); };
});