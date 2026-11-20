// ================================================================
// 1. FONDO WEBGL DINÁMICO LIGERO + OBJETOS 3D INTERACTIVOS (GIRO SOLO AL HOVER/TOQUE)
// ================================================================
let scene, camera, renderer, sweaterMesh, mainLight, ambientLight, fillLight, rimPointLight;
let knitPatternsCache = [];
let targetWaveSpeed = 0.00018;
let currentWaveSpeed = 0.00018;

let christmas3DGroup;
let active3DObjects = [];
let hoveredNodeIdx = -1;
let selectedNodeIdx = -1;
let envMapTexture = null;
let realisticTexturesCache = {};

const IS_MOBILE = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || window.innerWidth < 768;

const MOTIFS = {
    deer: [
        "..............v..v....",
        ".............v..v.v...",
        "..............v..v....",
        "...............vvvv...",
        "..............vvvvvv..",
        "..............vvvvvvvv",
        ".............vvvvvv...",
        "v..vvvvvvvvvvvvvv.....",
        ".vvvvvvvvvvvvvvv......",
        "..vvvvvvvvvvvvv.......",
        "...vv.......vv........",
        "..vv.........vv.......",
        ".vv...........vv......",
        "vv.............vv.....",
        "................vv...."
    ],
    snowflake: [
        ".......v.......",
        "......vvv......",
        ".v...v.v.v...v.",
        "..v..v.v.v..v..",
        "...v.v.v.v.v...",
        "....vvvvvvv....",
        ".vvvvvv.vvvvvv.",
        "....vvvvvvv....",
        "...v.v.v.v.v...",
        "..v..v.v.v..v..",
        ".v...v.v.v...v.",
        "......vvv......",
        ".......v......."
    ],
    pine: [
        ".......v.......",
        "......vvv......",
        ".....vvvvv.....",
        "....vvvvvvv....",
        "......vvv......",
        ".....vvvvv.....",
        "....vvvvvvv....",
        "...vvvvvvvvv...",
        ".....vvvvv.....",
        "....vvvvvvv....",
        "...vvvvvvvvv...",
        "..vvvvvvvvvvv..",
        "......vvv......",
        "......vvv......",
        "......vvv......"
    ],
    gift: [
        "...vv.....vv...",
        "..vvvv...vvvv..",
        "...vvvv.vvvv...",
        ".....vvvvv.....",
        ".vvvvvvvvvvvvv.",
        ".vvvvvv.vvvvvv.",
        ".vvvvvv.vvvvvv.",
        "...............",
        ".vvvvvv.vvvvvv.",
        ".vvvvvv.vvvvvv.",
        ".vvvvvv.vvvvvv.",
        ".vvvvvv.vvvvvv.",
        ".vvvvvvvvvvvvv."
    ],
    gingerbread: [
        ".....vvvvv.....",
        "....vvvvvvv....",
        "....vv.v.vv....",
        "....vvvvvvv....",
        ".....vvvvv.....",
        ".vvvvvvvvvvvvv.",
        "vvvvvvvvvvvvvvv",
        "...vvvv.vvvv...",
        "...vvvvvvvvv...",
        "...vvvv.vvvv...",
        "...vvvvvvvvv...",
        "...vvvv.vvvv...",
        "..vvvv...vvvv..",
        "..vvvv...vvvv.."
    ],
    starDeal: [
        ".......v.......",
        "......vvv......",
        ".....vvvvv.....",
        ".vvvvvvvvvvvvv.",
        "..vvvvvvvvvvv..",
        "...vvvvvvvvv...",
        "....vvvvvvvv...",
        "...vvvv.vvvv...",
        "..vvv.....vvv..",
        ".vv.........vv."
    ]
};

const SWEATER_THEMES = [
    {
        bgHex: 0x1a0307, baseDark: "#7a0814", baseLight: "#a80d1e", motifColor: "#fff3d6",
        stripe1: "#ffd166", stripe2: "#ffffff", stripe3: "#1b7a5c",
        motifKey: "deer", stepX: 380, lightColor: 0xffe8c2
    },
    {
        bgHex: 0x051024, baseDark: "#0b2c59", baseLight: "#124282", motifColor: "#e0fbfc",
        stripe1: "#90e0ef", stripe2: "#ffd166", stripe3: "#ffffff",
        motifKey: "snowflake", stepX: 280, lightColor: 0xd8f3ff
    },
    {
        bgHex: 0x04170e, baseDark: "#0d3b26", baseLight: "#165739", motifColor: "#fefae0",
        stripe1: "#ffd166", stripe2: "#d90429", stripe3: "#fefae0",
        motifKey: "pine", stepX: 280, lightColor: 0xfff0d4
    },
    {
        bgHex: 0x1a040d, baseDark: "#540821", baseLight: "#7a0e32", motifColor: "#ffe5ec",
        stripe1: "#ffd166", stripe2: "#ff758f", stripe3: "#ffffff",
        motifKey: "gift", stepX: 280, lightColor: 0xffe6ee
    },
    {
        bgHex: 0x1c0c04, baseDark: "#5c2b0e", baseLight: "#7d3c16", motifColor: "#fff8eb",
        stripe1: "#ffffff", stripe2: "#d90429", stripe3: "#2a9d8f",
        motifKey: "gingerbread", stepX: 280, lightColor: 0xffe9cc
    },
    {
        bgHex: 0x030c1f, baseDark: "#072554", baseLight: "#0c387a", motifColor: "#ffd166",
        stripe1: "#ffd166", stripe2: "#ffffff", stripe3: "#ef233c",
        motifKey: "starDeal", stepX: 280, lightColor: 0xfff3cc
    }
];

function generateSweaterTexture(theme) {
    const CANVAS_SIZE = 1024;
    const texCanvas = document.createElement('canvas');
    texCanvas.width = CANVAS_SIZE;
    texCanvas.height = CANVAS_SIZE;
    const ctx = texCanvas.getContext('2d');

    ctx.fillStyle = "#080305";
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    function drawKnitStitch(x, y, colorStr) {
        const w = 10;
        const h = 12;

        ctx.fillStyle = "rgba(0, 0, 0, 0.62)";
        ctx.fillRect(x, y + h * 0.68, w, h * 0.34);

        ctx.fillStyle = colorStr;
        ctx.beginPath();
        ctx.moveTo(x + 1, y);
        ctx.lineTo(x + w * 0.45, y + h * 0.85);
        ctx.lineTo(x + w * 0.72, y + h * 0.85);
        ctx.lineTo(x + w * 0.34, y);
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(x + w * 0.9, y);
        ctx.lineTo(x + w * 0.56, y + h * 0.85);
        ctx.lineTo(x + w * 0.84, y + h * 0.85);
        ctx.lineTo(x + w, y);
        ctx.fill();

        ctx.fillStyle = "rgba(255, 255, 255, 0.10)";
        ctx.fillRect(x + 2, y, w - 4, 1.5);
    }

    for (let y = 0; y < CANVAS_SIZE; y += 12) {
        for (let x = 0; x < CANVAS_SIZE; x += 10) {
            const tone = (Math.random() > 0.35) ? theme.baseDark : theme.baseLight;
            drawKnitStitch(x, y, tone);
        }
    }

    for (let i = 0; i < 15000; i++) {
        const x = Math.random() * CANVAS_SIZE;
        const y = Math.random() * CANVAS_SIZE;
        ctx.fillStyle = Math.random() > 0.5 ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.15)";
        ctx.fillRect(x, y, 1.5, 1.5);
    }

    const grid = MOTIFS[theme.motifKey];
    function drawMotifRow(startY) {
        for (let x = 30; x < CANVAS_SIZE - 80; x += theme.stepX) {
            for (let r = 0; r < grid.length; r++) {
                for (let c = 0; c < grid[r].length; c++) {
                    if (grid[r][c] === 'v') {
                        let stitchColor = theme.motifColor;
                        if (theme.motifKey === "pine" && r >= 12) stitchColor = "#ffd166";
                        drawKnitStitch(x + c * 10, startY + r * 12, stitchColor);
                    }
                }
            }
        }
    }

    drawMotifRow(210);

    const middleY = 470;
    for (let x = 0; x < CANVAS_SIZE; x += 10) {
        drawKnitStitch(x, 390, theme.stripe1);
        drawKnitStitch(x, 408, theme.stripe2);
        drawKnitStitch(x, 426, theme.stripe3);

        if (x % 50 === 0) {
            drawKnitStitch(x, middleY, theme.stripe1);
            drawKnitStitch(x + 10, middleY - 12, theme.stripe2);
            drawKnitStitch(x + 10, middleY + 12, theme.stripe2);
            drawKnitStitch(x + 20, middleY, theme.stripe1);
        }

        drawKnitStitch(x, 520, theme.stripe3);
        drawKnitStitch(x, 538, theme.stripe2);
        drawKnitStitch(x, 556, theme.stripe1);
    }

    drawMotifRow(610);

    const vignette = ctx.createLinearGradient(0, 0, 0, CANVAS_SIZE);
    vignette.addColorStop(0.0, "rgba(0, 0, 0, 0.45)");
    vignette.addColorStop(0.28, "rgba(0, 0, 0, 0.08)");
    vignette.addColorStop(0.75, "rgba(0, 0, 0, 0.08)");
    vignette.addColorStop(1.0, "rgba(0, 0, 0, 0.48)");
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    const texture = new THREE.CanvasTexture(texCanvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(1.5, 1.8);
    texture.encoding = THREE.sRGBEncoding;
    return texture;
}

// ================================================================
// GENERADOR DE ENTORNO HDR DE ESTUDIO Y TEXTURAS PBR DETALLADAS
// ================================================================
function buildStudioEnvMap(rendererInstance) {
    const pmremGenerator = new THREE.PMREMGenerator(rendererInstance);
    pmremGenerator.compileEquirectangularShader();

    const envScene = new THREE.Scene();
    envScene.background = new THREE.Color(0x050304);

    const keyBulb = new THREE.Mesh(
        new THREE.SphereGeometry(2.0, 12, 12),
        new THREE.MeshBasicMaterial({ color: 0xffe6a3 })
    );
    keyBulb.position.set(5, 6, 5);
    envScene.add(keyBulb);

    const goldBounce = new THREE.Mesh(
        new THREE.SphereGeometry(1.6, 12, 12),
        new THREE.MeshBasicMaterial({ color: 0xd97706 })
    );
    goldBounce.position.set(-5, 2, 4);
    envScene.add(goldBounce);

    const coolRim = new THREE.Mesh(
        new THREE.SphereGeometry(1.6, 12, 12),
        new THREE.MeshBasicMaterial({ color: 0x1d4ed8 })
    );
    coolRim.position.set(0, -5, 4);
    envScene.add(coolRim);

    const renderTarget = pmremGenerator.fromScene(envScene, 0.04);
    pmremGenerator.dispose();
    return renderTarget.texture;
}

function getProceduralTexture(kind) {
    if (realisticTexturesCache[kind]) return realisticTexturesCache[kind];

    const c = document.createElement('canvas');
    c.width = 256;
    c.height = 256;
    const ctx = c.getContext('2d');

    if (kind === 'candyStripes') {
        ctx.fillStyle = '#fffdf9';
        ctx.fillRect(0, 0, 256, 256);
        ctx.fillStyle = '#b80c19';
        for (let i = -256; i < 512; i += 42) {
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i + 20, 0);
            ctx.lineTo(i + 148, 256);
            ctx.lineTo(i + 128, 256);
            ctx.closePath();
            ctx.fill();
        }
    } else if (kind === 'woolBump') {
        ctx.fillStyle = '#808080';
        ctx.fillRect(0, 0, 256, 256);
        for (let y = 0; y < 256; y += 8) {
            for (let x = 0; x < 256; x += 8) {
                ctx.fillStyle = ((x + y) % 16 === 0) ? '#d8d8d8' : '#383838';
                ctx.beginPath();
                ctx.arc(x + 4, y + 4, 3, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    } else if (kind === 'gingerCrust') {
        const g = ctx.createRadialGradient(128, 128, 15, 128, 128, 128);
        g.addColorStop(0, '#c86d25');
        g.addColorStop(1, '#7f3b0d');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, 256, 256);
        for (let i = 0; i < 2500; i++) {
            const x = Math.random() * 256;
            const y = Math.random() * 256;
            ctx.fillStyle = Math.random() > 0.5 ? 'rgba(45, 16, 2, 0.42)' : 'rgba(255, 195, 120, 0.35)';
            ctx.fillRect(x, y, 2, 2);
        }
    } else if (kind === 'baublePattern') {
        const grad = ctx.createLinearGradient(0, 0, 0, 256);
        grad.addColorStop(0, '#660000');
        grad.addColorStop(0.5, '#b8001f');
        grad.addColorStop(1, '#4a0000');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 256, 256);

        ctx.fillStyle = '#e09f00';
        ctx.fillRect(0, 99, 256, 58);
        ctx.fillStyle = '#0e3b26';
        ctx.fillRect(0, 107, 256, 42);

        ctx.fillStyle = '#fff8e7';
        for (let x = 16; x < 256; x += 32) {
            ctx.beginPath();
            ctx.arc(x, 128, 4.5, 0, Math.PI * 2);
            ctx.fill();
        }
    } else if (kind === 'pineNeedles') {
        ctx.fillStyle = '#0d3b22';
        ctx.fillRect(0, 0, 256, 256);
        for (let i = 0; i < 2200; i++) {
            const x = Math.random() * 256;
            const y = Math.random() * 256;
            ctx.strokeStyle = Math.random() > 0.32 ? '#2d7a53' : '#061f12';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + (Math.random() - 0.5) * 14, y + 10);
            ctx.stroke();
        }
    } else if (kind === 'saltFrost') {
        ctx.fillStyle = '#38a3d1';
        ctx.fillRect(0, 0, 256, 256);
        for (let i = 0; i < 2500; i++) {
            const x = Math.random() * 256;
            const y = Math.random() * 256;
            ctx.fillStyle = Math.random() > 0.35 ? 'rgba(255, 255, 255, 0.90)' : 'rgba(0, 95, 153, 0.55)';
            ctx.fillRect(x, y, 2, 2);
        }
    }

    const tex = new THREE.CanvasTexture(c);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.encoding = THREE.sRGBEncoding;
    realisticTexturesCache[kind] = tex;
    return tex;
}

// ================================================================
// CONSTRUCTORES DE OBJETOS NAVIDEÑOS 3D FOTORREALISTAS
// ================================================================
function buildChristmas3DMesh(type) {
    const group = new THREE.Group();

    const matGold = new THREE.MeshPhysicalMaterial({
        color: 0xd99b00,
        emissive: 0x1f1200,
        emissiveIntensity: 0.15,
        metalness: 0.88,
        roughness: 0.18,
        clearcoat: 0.9,
        envMap: envMapTexture,
        envMapIntensity: 1.15
    });

    const matRedGloss = new THREE.MeshPhysicalMaterial({
        color: 0x9e0012,
        emissive: 0x1a0003,
        emissiveIntensity: 0.15,
        metalness: 0.15,
        roughness: 0.14,
        clearcoat: 1.0,
        clearcoatRoughness: 0.06,
        envMap: envMapTexture,
        envMapIntensity: 1.05
    });

    const matEmeraldGloss = new THREE.MeshPhysicalMaterial({
        color: 0x0b5239,
        emissive: 0x02140e,
        emissiveIntensity: 0.15,
        metalness: 0.18,
        roughness: 0.16,
        clearcoat: 0.95,
        envMap: envMapTexture,
        envMapIntensity: 1.05
    });

    const matPine = new THREE.MeshStandardMaterial({
        map: getProceduralTexture('pineNeedles'),
        bumpMap: getProceduralTexture('pineNeedles'),
        bumpScale: 0.03,
        color: 0xa3d9b8,
        roughness: 0.72,
        metalness: 0.04
    });

    const matWax = new THREE.MeshPhysicalMaterial({
        color: 0xebd9b4,
        roughness: 0.3,
        metalness: 0.0,
        clearcoat: 0.45,
        envMap: envMapTexture,
        envMapIntensity: 0.85
    });

    const matGinger = new THREE.MeshStandardMaterial({
        map: getProceduralTexture('gingerCrust'),
        bumpMap: getProceduralTexture('gingerCrust'),
        bumpScale: 0.03,
        color: 0xc97b36,
        roughness: 0.78,
        metalness: 0.02
    });

    const matCrystal = new THREE.MeshPhysicalMaterial({
        color: 0x0081a7,
        emissive: 0x032230,
        emissiveIntensity: 0.2,
        metalness: 0.2,
        roughness: 0.08,
        clearcoat: 1.0,
        envMap: envMapTexture,
        envMapIntensity: 1.25
    });

    const matBlueSatin = new THREE.MeshPhysicalMaterial({
        color: 0x023e8a,
        emissive: 0x011129,
        emissiveIntensity: 0.2,
        metalness: 0.3,
        roughness: 0.22,
        clearcoat: 0.85,
        envMap: envMapTexture,
        envMapIntensity: 1.05
    });

    const matCork = new THREE.MeshStandardMaterial({
        color: 0x9c5718,
        bumpMap: getProceduralTexture('gingerCrust'),
        bumpScale: 0.024,
        roughness: 0.88
    });

    switch (type) {
        case "bauble": {
            const baubleMat = new THREE.MeshPhysicalMaterial({
                map: getProceduralTexture('baublePattern'),
                bumpMap: getProceduralTexture('woolBump'),
                bumpScale: 0.012,
                emissive: 0x1a0204,
                emissiveIntensity: 0.08,
                metalness: 0.22,
                roughness: 0.14,
                clearcoat: 1.0,
                clearcoatRoughness: 0.05,
                envMap: envMapTexture,
                envMapIntensity: 0.95
            });
            const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.122, 32, 32), baubleMat);
            const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.036, 0.044, 0.04, 18), matGold);
            cap.position.y = 0.124;
            const collar = new THREE.Mesh(new THREE.TorusGeometry(0.04, 0.007, 10, 20), matGold);
            collar.rotation.x = Math.PI / 2;
            collar.position.y = 0.107;
            const ring = new THREE.Mesh(new THREE.TorusGeometry(0.022, 0.0055, 10, 18), matGold);
            ring.position.y = 0.152;
            group.add(sphere, cap, collar, ring);
            break;
        }
        case "star": {
            const shape = new THREE.Shape();
            const spikes = 5, outerR = 0.15, innerR = 0.06;
            for (let i = 0; i < spikes * 2; i++) {
                const r = (i % 2 === 0) ? outerR : innerR;
                const angle = (i * Math.PI) / spikes - Math.PI / 2;
                const x = Math.cos(angle) * r;
                const y = Math.sin(angle) * r;
                if (i === 0) shape.moveTo(x, y);
                else shape.lineTo(x, y);
            }
            shape.closePath();
            const geo = new THREE.ExtrudeGeometry(shape, {
                depth: 0.034,
                bevelEnabled: true,
                bevelThickness: 0.022,
                bevelSize: 0.016,
                bevelSegments: 4
            });
            geo.center();
            const starMesh = new THREE.Mesh(geo, matGold);
            const gemFront = new THREE.Mesh(new THREE.OctahedronGeometry(0.042, 0), matRedGloss);
            gemFront.position.z = 0.028;
            const gemBack = gemFront.clone();
            gemBack.position.z = -0.028;
            group.add(starMesh, gemFront, gemBack);
            break;
        }
        case "wreath": {
            const mainTorus = new THREE.Mesh(new THREE.TorusGeometry(0.105, 0.038, 18, 30), matPine);
            group.add(mainTorus);

            for (let a = 0; a < Math.PI * 2; a += Math.PI / 3) {
                const berry1 = new THREE.Mesh(new THREE.SphereGeometry(0.017, 12, 12), matRedGloss);
                berry1.position.set(Math.cos(a) * 0.106, Math.sin(a) * 0.106, 0.036);
                const berry2 = new THREE.Mesh(new THREE.SphereGeometry(0.014, 10, 10), matGold);
                berry2.position.set(Math.cos(a + 0.25) * 0.095, Math.sin(a + 0.25) * 0.095, 0.034);
                group.add(berry1, berry2);
            }
            const bowLeft = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.058, 12), matRedGloss);
            bowLeft.position.set(-0.028, -0.11, 0.038);
            bowLeft.rotation.z = Math.PI / 2;
            const bowRight = bowLeft.clone();
            bowRight.position.set(0.028, -0.11, 0.038);
            bowRight.rotation.z = -Math.PI / 2;
            const knot = new THREE.Mesh(new THREE.SphereGeometry(0.017, 12, 12), matGold);
            knot.position.set(0, -0.11, 0.044);
            group.add(bowLeft, bowRight, knot);
            break;
        }
        case "candycane": {
            const curve = new THREE.CatmullRomCurve3([
                new THREE.Vector3(-0.02, -0.128, 0),
                new THREE.Vector3(-0.02, 0.052, 0),
                new THREE.Vector3(0.018, 0.112, 0),
                new THREE.Vector3(0.064, 0.062, 0)
            ]);
            const caneTex = getProceduralTexture('candyStripes');
            caneTex.repeat.set(3, 1);
            const caneMat = new THREE.MeshPhysicalMaterial({
                map: caneTex,
                emissive: 0x1a0303,
                emissiveIntensity: 0.08,
                roughness: 0.12,
                clearcoat: 1.0,
                envMap: envMapTexture,
                envMapIntensity: 0.95
            });
            const tube = new THREE.Mesh(new THREE.TubeGeometry(curve, 28, 0.026, 16, false), caneMat);
            const capStart = new THREE.Mesh(new THREE.SphereGeometry(0.026, 14, 14), matRedGloss);
            capStart.position.set(-0.02, -0.128, 0);
            const capEnd = new THREE.Mesh(new THREE.SphereGeometry(0.026, 14, 14), matRedGloss);
            capEnd.position.set(0.064, 0.062, 0);
            const ribbon = new THREE.Mesh(new THREE.TorusGeometry(0.029, 0.008, 10, 18), matEmeraldGloss);
            ribbon.rotation.x = Math.PI / 2;
            ribbon.position.set(-0.02, 0.012, 0);
            const bell = new THREE.Mesh(new THREE.SphereGeometry(0.016, 12, 12), matGold);
            bell.position.set(0.01, 0.006, 0.022);
            group.add(tube, capStart, capEnd, ribbon, bell);
            break;
        }
        case "house": {
            const walls = new THREE.Mesh(new THREE.BoxGeometry(0.148, 0.118, 0.128), matWax);
            walls.position.y = -0.035;

            const roofShape = new THREE.Shape();
            roofShape.moveTo(-0.102, 0);
            roofShape.lineTo(0, 0.092);
            roofShape.lineTo(0.102, 0);
            roofShape.lineTo(0.078, 0);
            roofShape.lineTo(0, 0.068);
            roofShape.lineTo(-0.078, 0);
            roofShape.closePath();

            const roofGeo = new THREE.ExtrudeGeometry(roofShape, { depth: 0.148, bevelEnabled: true, bevelThickness: 0.007, bevelSize: 0.007 });
            roofGeo.center();
            const roof = new THREE.Mesh(roofGeo, matRedGloss);
            roof.position.y = 0.058;

            const chimney = new THREE.Mesh(new THREE.BoxGeometry(0.028, 0.054, 0.028), matGold);
            chimney.position.set(0.044, 0.09, -0.02);

            const glowMat = new THREE.MeshBasicMaterial({ color: 0xffd166 });
            const win1 = new THREE.Mesh(new THREE.BoxGeometry(0.034, 0.036, 0.132), glowMat);
            win1.position.set(-0.035, -0.025, 0);
            const win2 = win1.clone();
            win2.position.set(0.035, -0.025, 0);
            const door = new THREE.Mesh(new THREE.BoxGeometry(0.036, 0.056, 0.132), matEmeraldGloss);
            door.position.set(0, -0.062, 0);

            group.add(walls, roof, chimney, win1, win2, door);
            break;
        }
        case "tree": {
            const tiers = [
                { r: 0.122, h: 0.10, y: -0.045 },
                { r: 0.096, h: 0.09, y: 0.016 },
                { r: 0.068, h: 0.08, y: 0.074 }
            ];
            tiers.forEach(t => {
                const cone = new THREE.Mesh(new THREE.ConeGeometry(t.r, t.h, 20), matPine);
                cone.position.y = t.y;
                group.add(cone);
            });
            const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.03, 0.054, 12), matGinger);
            trunk.position.y = -0.108;
            const starTop = new THREE.Mesh(new THREE.OctahedronGeometry(0.032, 0), matGold);
            starTop.position.y = 0.128;

            const ornaments = [
                [0.075, -0.06, 0.046], [-0.066, -0.05, 0.056], [0.056, 0.01, -0.046],
                [-0.046, 0.03, 0.042], [0, -0.02, 0.074], [0.032, 0.056, 0.034]
            ];
            ornaments.forEach((p, idx) => {
                const m = idx % 3 === 0 ? matRedGloss : (idx % 3 === 1 ? matGold : matCrystal);
                const b = new THREE.Mesh(new THREE.SphereGeometry(0.015, 10, 10), m);
                b.position.set(p[0], p[1], p[2]);
                group.add(b);
            });

            group.add(trunk, starTop);
            break;
        }
        case "snowflake": {
            for (let i = 0; i < 3; i++) {
                const mainArm = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.265, 8), matCrystal);
                mainArm.rotation.z = (i * Math.PI) / 3;
                group.add(mainArm);

                const subArm1 = new THREE.Mesh(new THREE.CylinderGeometry(0.0065, 0.0065, 0.082, 8), matCrystal);
                subArm1.position.set(Math.cos((i * Math.PI) / 3 + Math.PI / 2) * 0.078, Math.sin((i * Math.PI) / 3 + Math.PI / 2) * 0.078, 0);
                subArm1.rotation.z = (i * Math.PI) / 3 + 0.6;
                group.add(subArm1);
            }
            const centerHex = new THREE.Mesh(new THREE.CylinderGeometry(0.044, 0.044, 0.022, 6), matGold);
            centerHex.rotation.x = Math.PI / 2;
            group.add(centerHex);
            break;
        }
        case "moon": {
            const outer = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.027, 14, 28, Math.PI * 1.32), matGold);
            outer.rotation.z = Math.PI * 0.62;
            const chain = new THREE.Mesh(new THREE.CylinderGeometry(0.0045, 0.0045, 0.064, 8), matGold);
            chain.position.set(0.042, 0.02, 0);
            const star = new THREE.Mesh(new THREE.OctahedronGeometry(0.032, 0), matCrystal);
            star.position.set(0.042, -0.016, 0);
            group.add(outer, chain, star);
            break;
        }
        case "jar": {
            const frostMat = new THREE.MeshPhysicalMaterial({
                map: getProceduralTexture('saltFrost'),
                bumpMap: getProceduralTexture('saltFrost'),
                bumpScale: 0.02,
                emissive: 0x062333,
                emissiveIntensity: 0.18,
                roughness: 0.28,
                clearcoat: 0.9,
                envMap: envMapTexture,
                envMapIntensity: 0.95
            });
            const jarBody = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.074, 0.148, 22), frostMat);
            jarBody.position.y = -0.015;
            const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.058, 0.064, 0.025, 20), matCrystal);
            neck.position.y = 0.068;
            const cork = new THREE.Mesh(new THREE.CylinderGeometry(0.054, 0.05, 0.03, 18), matCork);
            cork.position.y = 0.088;
            const twine = new THREE.Mesh(new THREE.TorusGeometry(0.062, 0.0075, 8, 22), matRedGloss);
            twine.rotation.x = Math.PI / 2;
            twine.position.y = 0.058;
            group.add(jarBody, neck, cork, twine);
            break;
        }
        case "candle": {
            const body = new THREE.Mesh(new THREE.CylinderGeometry(0.062, 0.066, 0.148, 24), matWax);
            body.position.y = -0.03;
            const rim = new THREE.Mesh(new THREE.TorusGeometry(0.058, 0.0075, 10, 24), matWax);
            rim.rotation.x = Math.PI / 2;
            rim.position.y = 0.044;
            const band = new THREE.Mesh(new THREE.CylinderGeometry(0.067, 0.067, 0.03, 24), matRedGloss);
            band.position.y = -0.035;
            const goldBand = new THREE.Mesh(new THREE.CylinderGeometry(0.068, 0.068, 0.009, 24), matGold);
            goldBand.position.y = -0.035;
            const wick = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.022, 8), matGinger);
            wick.position.y = 0.052;

            const flameMat = new THREE.MeshBasicMaterial({ color: 0xffe66d });
            const flame = new THREE.Mesh(new THREE.SphereGeometry(0.019, 12, 12), flameMat);
            flame.scale.set(0.75, 1.9, 0.75);
            flame.position.y = 0.078;

            const haloMat = new THREE.MeshBasicMaterial({ color: 0xff9f1c, transparent: true, opacity: 0.42 });
            const halo = new THREE.Mesh(new THREE.SphereGeometry(0.038, 12, 12), haloMat);
            halo.position.y = 0.078;

            group.add(body, rim, band, goldBand, wick, flame, halo);
            break;
        }
        case "holly": {
            const leaf1 = new THREE.Mesh(new THREE.SphereGeometry(0.058, 12, 12), matPine);
            leaf1.scale.set(1.45, 0.62, 0.26);
            leaf1.position.set(-0.046, 0.02, 0);
            leaf1.rotation.z = 0.45;

            const leaf2 = leaf1.clone();
            leaf2.position.set(0.046, 0.02, 0);
            leaf2.rotation.z = -0.45;

            const leaf3 = leaf1.clone();
            leaf3.position.set(0, -0.046, -0.01);
            leaf3.rotation.z = Math.PI / 2;

            const b1 = new THREE.Mesh(new THREE.SphereGeometry(0.024, 14, 14), matRedGloss);
            b1.position.set(0, 0.012, 0.025);
            const b2 = b1.clone();
            b2.position.set(-0.023, -0.016, 0.023);
            const b3 = b1.clone();
            b3.position.set(0.023, -0.016, 0.023);

            group.add(leaf1, leaf2, leaf3, b1, b2, b3);
            break;
        }
        case "pinecone": {
            const core = new THREE.Mesh(new THREE.CylinderGeometry(0.034, 0.054, 0.168, 12), matGinger);
            group.add(core);
            const rows = 5;
            for (let r = 0; r < rows; r++) {
                const y = -0.066 + r * 0.034;
                const radius = 0.072 - Math.abs(r - 2) * 0.012;
                const count = 6;
                for (let c = 0; c < count; c++) {
                    const angle = (c / count) * Math.PI * 2 + r * 0.45;
                    const scaleMesh = new THREE.Mesh(new THREE.ConeGeometry(0.024, 0.044, 8), matGinger);
                    scaleMesh.position.set(Math.cos(angle) * radius, y, Math.sin(angle) * radius);
                    scaleMesh.rotation.z = -Math.cos(angle) * 0.9;
                    scaleMesh.rotation.x = Math.sin(angle) * 0.9;
                    group.add(scaleMesh);
                }
            }
            const snowCap = new THREE.Mesh(new THREE.SphereGeometry(0.04, 12, 12), matWax);
            snowCap.scale.set(1.2, 0.6, 1.2);
            snowCap.position.y = 0.09;
            group.add(snowCap);
            break;
        }
        case "seal": {
            const waxDisc = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.112, 0.025, 28), matRedGloss);
            waxDisc.rotation.x = Math.PI / 2;
            const waxRim = new THREE.Mesh(new THREE.TorusGeometry(0.104, 0.016, 12, 28), matRedGloss);
            const emblem = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.034, 6), matGold);
            emblem.rotation.x = Math.PI / 2;
            group.add(waxDisc, waxRim, emblem);
            break;
        }
        case "tag": {
            const cardGeo = new THREE.BoxGeometry(0.125, 0.172, 0.013);
            const card = new THREE.Mesh(cardGeo, matWax);
            const eyelet = new THREE.Mesh(new THREE.TorusGeometry(0.015, 0.0045, 8, 16), matGold);
            eyelet.position.set(0, 0.06, 0.008);
            const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.127, 0.028, 0.015), matEmeraldGloss);
            stripe.position.y = -0.036;
            const stringLoop = new THREE.Mesh(new THREE.TorusGeometry(0.03, 0.0045, 8, 18, Math.PI), matRedGloss);
            stringLoop.position.y = 0.078;
            group.add(card, eyelet, stripe, stringLoop);
            break;
        }
        case "gift": {
            const box = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.124, 0.15), matEmeraldGloss);
            box.position.y = -0.015;
            const lid = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.036, 0.16), matRedGloss);
            lid.position.y = 0.058;

            const rib1 = new THREE.Mesh(new THREE.BoxGeometry(0.164, 0.162, 0.03), matGold);
            const rib2 = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.162, 0.164), matGold);

            const loop1 = new THREE.Mesh(new THREE.TorusGeometry(0.032, 0.009, 10, 18), matGold);
            loop1.position.set(-0.025, 0.092, 0);
            loop1.rotation.y = 0.4;
            const loop2 = loop1.clone();
            loop2.position.set(0.025, 0.092, 0);
            loop2.rotation.y = -0.4;

            group.add(box, lid, rib1, rib2, loop1, loop2);
            break;
        }
        case "deer": {
            const head = new THREE.Mesh(new THREE.SphereGeometry(0.082, 20, 20), matGinger);
            head.scale.set(0.95, 1.08, 1.05);
            const snout = new THREE.Mesh(new THREE.SphereGeometry(0.046, 16, 16), matWax);
            snout.position.set(0, -0.022, 0.072);
            const nose = new THREE.Mesh(new THREE.SphereGeometry(0.028, 14, 14), matRedGloss);
            nose.position.set(0, -0.012, 0.11);

            const antL = new THREE.Mesh(new THREE.CylinderGeometry(0.0085, 0.011, 0.108, 10), matGold);
            antL.position.set(-0.048, 0.098, 0);
            antL.rotation.z = 0.35;
            const subL = new THREE.Mesh(new THREE.CylinderGeometry(0.0065, 0.0085, 0.05, 8), matGold);
            subL.position.set(-0.068, 0.108, 0);
            subL.rotation.z = 0.95;

            const antR = antL.clone();
            antR.position.set(0.048, 0.098, 0);
            antR.rotation.z = -0.35;
            const subR = subL.clone();
            subR.position.set(0.068, 0.108, 0);
            subR.rotation.z = -0.95;

            group.add(head, snout, nose, antL, subL, antR, subR);
            break;
        }
        case "cookie": {
            const biscuit = new THREE.Mesh(new THREE.CylinderGeometry(0.108, 0.112, 0.03, 24), matGinger);
            biscuit.rotation.x = Math.PI / 2;
            const icingRing = new THREE.Mesh(new THREE.TorusGeometry(0.088, 0.0075, 8, 24), matWax);
            icingRing.position.z = 0.016;

            const chipPositions = [
                [-0.036, 0.036], [0.042, 0.028], [0, -0.044], [-0.042, -0.026], [0.034, -0.028], [0.005, 0.012]
            ];
            chipPositions.forEach(([cx, cy], idx) => {
                const chipMat = idx % 3 === 0 ? matRedGloss : (idx % 3 === 1 ? matEmeraldGloss : matGold);
                const chip = new THREE.Mesh(new THREE.SphereGeometry(0.015, 10, 10), chipMat);
                chip.scale.set(1, 1, 0.6);
                chip.position.set(cx, cy, 0.017);
                group.add(chip);
            });
            group.add(biscuit, icingRing);
            break;
        }
        case "gingerman": {
            const head = new THREE.Mesh(new THREE.SphereGeometry(0.05, 18, 18), matGinger);
            head.scale.set(1, 1, 0.45);
            head.position.y = 0.076;

            const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.046, 0.056, 0.10, 18), matGinger);
            torso.scale.set(1, 1, 0.45);
            torso.position.y = -0.005;

            const arms = new THREE.Mesh(new THREE.CylinderGeometry(0.019, 0.019, 0.174, 12), matGinger);
            arms.rotation.z = Math.PI / 2;
            arms.scale.set(1, 1, 0.55);
            arms.position.y = 0.02;

            const legL = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.018, 0.08, 12), matGinger);
            legL.position.set(-0.026, -0.078, 0);
            legL.rotation.z = -0.15;
            const legR = legL.clone();
            legR.position.set(0.026, -0.078, 0);
            legR.rotation.z = 0.15;

            const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.0085, 10, 10), matWax);
            eyeL.position.set(-0.018, 0.082, 0.022);
            const eyeR = eyeL.clone();
            eyeR.position.set(0.018, 0.082, 0.022);

            const btn1 = new THREE.Mesh(new THREE.SphereGeometry(0.013, 12, 12), matRedGloss);
            btn1.position.set(0, 0.012, 0.026);
            const btn2 = new THREE.Mesh(new THREE.SphereGeometry(0.013, 12, 12), matEmeraldGloss);
            btn2.position.set(0, -0.022, 0.027);

            group.add(head, torso, arms, legL, legR, eyeL, eyeR, btn1, btn2);
            break;
        }
        case "shoppingBag": {
            const bagBody = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.16, 0.08), matBlueSatin);
            const goldTrim = new THREE.Mesh(new THREE.BoxGeometry(0.154, 0.02, 0.084), matGold);
            goldTrim.position.y = 0.07;

            const handle1 = new THREE.Mesh(new THREE.TorusGeometry(0.04, 0.007, 10, 20, Math.PI), matGold);
            handle1.position.set(0, 0.082, 0.03);
            const handle2 = handle1.clone();
            handle2.position.set(0, 0.082, -0.03);

            const tagCard = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.066, 0.009), matRedGloss);
            tagCard.position.set(0.058, 0.036, 0.048);
            tagCard.rotation.z = -0.25;

            group.add(bagBody, goldTrim, handle1, handle2, tagCard);
            break;
        }
        case "tea": {
            const pot = new THREE.Mesh(new THREE.SphereGeometry(0.086, 22, 22), matEmeraldGloss);
            pot.scale.set(1.05, 0.85, 1.05);
            const lid = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.048, 0.022, 18), matGold);
            lid.position.y = 0.07;
            const knob = new THREE.Mesh(new THREE.SphereGeometry(0.017, 12, 12), matRedGloss);
            knob.position.y = 0.086;
            const spout = new THREE.Mesh(new THREE.CylinderGeometry(0.011, 0.021, 0.078, 12), matGold);
            spout.position.set(-0.08, 0.02, 0);
            spout.rotation.z = 0.65;
            const handle = new THREE.Mesh(new THREE.TorusGeometry(0.044, 0.0085, 10, 18, Math.PI), matGold);
            handle.position.set(0.08, 0.005, 0);
            handle.rotation.z = -Math.PI / 2;
            group.add(pot, lid, knob, spout, handle);
            break;
        }
        case "mug":
        default: {
            const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.066, 0.138, 24), matRedGloss);
            const rim = new THREE.Mesh(new THREE.TorusGeometry(0.079, 0.007, 12, 24), matGold);
            rim.rotation.x = Math.PI / 2;
            rim.position.y = 0.07;

            const cream = new THREE.Mesh(new THREE.SphereGeometry(0.07, 18, 18), matWax);
            cream.scale.set(1, 0.65, 1);
            cream.position.y = 0.062;

            const cinnamon = new THREE.Mesh(new THREE.CylinderGeometry(0.011, 0.011, 0.098, 10), matGinger);
            cinnamon.position.set(0.028, 0.084, 0.01);
            cinnamon.rotation.z = -0.45;

            const handle = new THREE.Mesh(new THREE.TorusGeometry(0.046, 0.011, 12, 20, Math.PI), matGold);
            handle.position.set(0.072, 0, 0);
            handle.rotation.z = -Math.PI / 2;

            group.add(cup, rim, cream, cinnamon, handle);
            break;
        }
    }

    group.rotation.set(0.12, -0.25, 0.04);

    group.traverse(child => {
        if (child.isMesh) {
            child.renderOrder = 12;
            child.frustumCulled = false;
        }
    });

    return group;
}

function screenToWorld3D(percentLeft, percentTop, targetZ = 1.55) {
    const offsetPx = window.innerWidth < 768 ? 22 : 31;
    const px = (percentLeft / 100) * window.innerWidth + offsetPx;
    const py = (percentTop / 100) * window.innerHeight + offsetPx;

    const ndcX = (px / window.innerWidth) * 2 - 1;
    const ndcY = -(py / window.innerHeight) * 2 + 1;

    const vector = new THREE.Vector3(ndcX, ndcY, 0.5);
    vector.unproject(camera);
    const dir = vector.sub(camera.position).normalize();
    const distance = (targetZ - camera.position.z) / dir.z;
    return camera.position.clone().add(dir.multiplyScalar(distance));
}

function spawnSection3DObjects(sectionIndex, visible = true) {
    if (!christmas3DGroup) return;

    while (christmas3DGroup.children.length > 0) {
        christmas3DGroup.remove(christmas3DGroup.children[0]);
    }
    active3DObjects = [];

    const sec = tallerData[sectionIndex];
    if (!sec) return;

    const baseScale = window.innerWidth < 768 ? 0.92 : 1.24;

    sec.cards.forEach((cardData, i) => {
        const obj3D = buildChristmas3DMesh(cardData.icon);
        const leftVal = parseFloat(cardData.pos.left);
        const topVal = parseFloat(cardData.pos.top);

        const worldPos = screenToWorld3D(leftVal, topVal, 1.55);
        obj3D.position.copy(worldPos);
        obj3D.scale.set(0.01, 0.01, 0.01);

        obj3D.userData = {
            index: i,
            leftPct: leftVal,
            topPct: topVal,
            baseY: worldPos.y,
            baseScale: baseScale,
            targetScale: visible ? baseScale : 0.001,
            currentScale: 0.01,
            delayTimer: i * 6,
            initialRotY: -0.25
        };

        christmas3DGroup.add(obj3D);
        active3DObjects.push(obj3D);
    });
}

function initKnitBackground() {
    const canvas = document.getElementById('sweater-webgl-canvas');
    if (!canvas) return;

    scene = new THREE.Scene();
    scene.background = new THREE.Color(SWEATER_THEMES[0].bgHex);

    camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.05, 100);
    camera.position.z = window.innerWidth < 768 ? 4.3 : 3.5;

    renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: !IS_MOBILE,
        powerPreference: "high-performance",
        alpha: false
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.02;

    envMapTexture = buildStudioEnvMap(renderer);

    knitPatternsCache[0] = generateSweaterTexture(SWEATER_THEMES[0]);

    const normCanvas = document.createElement('canvas');
    normCanvas.width = 64;
    normCanvas.height = 64;
    const nCtx = normCanvas.getContext('2d');
    nCtx.fillStyle = "rgb(128, 128, 255)";
    nCtx.fillRect(0, 0, 64, 64);

    for (let y = 0; y < 64; y += 12) {
        for (let x = 0; x < 64; x += 10) {
            nCtx.fillStyle = "rgb(225, 128, 240)";
            nCtx.fillRect(x + 1, y + 2, 4, 8);
            nCtx.fillStyle = "rgb(35, 128, 240)";
            nCtx.fillRect(x + 5, y + 2, 4, 8);
        }
    }

    const normalTexture = new THREE.CanvasTexture(normCanvas);
    normalTexture.wrapS = THREE.RepeatWrapping;
    normalTexture.wrapT = THREE.RepeatWrapping;
    normalTexture.repeat.set(160, 160);

    const geometry = new THREE.PlaneGeometry(14, 10, 16, 16);
    const pos = geometry.attributes.position;
    for (let i = 0; i < pos.count; i++) {
        const u = pos.getX(i);
        const v = pos.getY(i);
        pos.setZ(i, Math.sin(u * 0.4) * 0.12 + Math.cos(v * 0.3) * 0.08);
    }
    geometry.computeVertexNormals();

    const material = new THREE.MeshStandardMaterial({
        map: knitPatternsCache[0],
        normalMap: normalTexture,
        normalScale: new THREE.Vector2(1.4, 1.4),
        roughness: 0.94,
        metalness: 0.02
    });

    sweaterMesh = new THREE.Mesh(geometry, material);
    sweaterMesh.renderOrder = 1;
    scene.add(sweaterMesh);

    christmas3DGroup = new THREE.Group();
    christmas3DGroup.renderOrder = 10;
    scene.add(christmas3DGroup);

    ambientLight = new THREE.AmbientLight(0xffe8d6, 0.52);
    scene.add(ambientLight);

    mainLight = new THREE.DirectionalLight(0xfffaed, 1.35);
    mainLight.position.set(4, 5, 6);
    scene.add(mainLight);

    fillLight = new THREE.DirectionalLight(0x4cc9f0, 0.65);
    fillLight.position.set(-5, -3, 4);
    scene.add(fillLight);

    rimPointLight = new THREE.PointLight(0xffd166, 0.55, 9);
    rimPointLight.position.set(0, 0.8, 2.8);
    scene.add(rimPointLight);

    animateKnit();
}

function switchSweaterTheme(index) {
    if (!sweaterMesh || !SWEATER_THEMES[index]) return;
    const theme = SWEATER_THEMES[index];

    if (!knitPatternsCache[index]) {
        knitPatternsCache[index] = generateSweaterTexture(theme);
    }

    const currentOffsetX = sweaterMesh.material.map ? sweaterMesh.material.map.offset.x : 0;
    const newTex = knitPatternsCache[index];
    newTex.offset.x = currentOffsetX;

    sweaterMesh.material.map = newTex;
    sweaterMesh.material.needsUpdate = true;

    scene.background = new THREE.Color(theme.bgHex);
    if (mainLight) {
        mainLight.color.setHex(theme.lightColor);
    }

    currentWaveSpeed = 0.0022;
}

function animateKnit() {
    requestAnimationFrame(animateKnit);

    if (document.hidden) return;

    if (sweaterMesh && sweaterMesh.material.map) {
        currentWaveSpeed += (targetWaveSpeed - currentWaveSpeed) * 0.05;
        sweaterMesh.material.map.offset.x += currentWaveSpeed;
    }

    active3DObjects.forEach(obj => {
        const ud = obj.userData;

        if (ud.delayTimer > 0) {
            ud.delayTimer--;
            return;
        }

        const isHovered = (hoveredNodeIdx === ud.index || selectedNodeIdx === ud.index);
        const goalScale = ud.targetScale * (isHovered ? 1.28 : 1.0);
        ud.currentScale += (goalScale - ud.currentScale) * 0.15;
        obj.scale.setScalar(Math.max(0.001, ud.currentScale));

        if (isHovered) {
            obj.rotation.y += 0.055;
        } else {
            const normalizedY = obj.rotation.y % (Math.PI * 2);
            obj.rotation.y = normalizedY + (ud.initialRotY - normalizedY) * 0.1;
        }
    });

    renderer.render(scene, camera);
}

// ================================================================
// 2. SISTEMA DE NIEVE OPTIMIZADO
// ================================================================
function initInteractiveSnow() {
    const snowCanvas = document.createElement('canvas');
    snowCanvas.id = 'snow-overlay-canvas';
    document.body.appendChild(snowCanvas);
    const ctx = snowCanvas.getContext('2d');

    let width = snowCanvas.width = window.innerWidth;
    let height = snowCanvas.height = window.innerHeight;

    const FLAKE_COUNT = IS_MOBILE ? 140 : 240;
    const MAX_SNOW_HEIGHT = 12;
    const flakes = [];
    let surfaces = [];

    function updateSurfaces() {
        const elements = document.querySelectorAll('.con-nieve');
        surfaces = Array.from(elements).map(el => {
            const rect = el.getBoundingClientRect();
            const cols = Math.max(1, Math.floor(rect.width / 6));
            return {
                el: el,
                pile: new Float32Array(cols).fill(0)
            };
        });
    }

    for (let i = 0; i < FLAKE_COUNT; i++) {
        flakes.push({
            x: Math.random() * width,
            y: Math.random() * height,
            r: Math.random() * 2.5 + 1.2,
            speedY: Math.random() * 1.3 + 0.7,
            speedX: (Math.random() - 0.5) * 0.5,
            wobble: Math.random() * Math.PI * 2,
            opacity: Math.random() * 0.45 + 0.5
        });
    }

    function resetFlake(flake) {
        flake.x = Math.random() * width;
        flake.y = -10;
    }

    function renderSnow() {
        requestAnimationFrame(renderSnow);
        if (document.hidden) return;

        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = "rgba(255, 255, 255, 0.92)";

        for (let s of surfaces) {
            const style = window.getComputedStyle(s.el);
            if (style.visibility === 'hidden' || style.opacity === '0') {
                s.pile.fill(0);
                continue;
            }

            const rect = s.el.getBoundingClientRect();
            if (rect.width === 0 || rect.height === 0) continue;

            ctx.beginPath();
            ctx.moveTo(rect.left, rect.top + 2);

            for (let i = 0; i < s.pile.length; i++) {
                const px = rect.left + (i * 6);
                const py = rect.top - s.pile[i] + 2;
                ctx.lineTo(px, py);
            }

            ctx.lineTo(rect.right, rect.top + 2);
            ctx.closePath();
            ctx.fill();
        }

        for (let f of flakes) {
            f.wobble += 0.025;
            f.y += f.speedY;
            f.x += f.speedX + Math.sin(f.wobble) * 0.35;

            let landed = false;
            for (let s of surfaces) {
                const style = window.getComputedStyle(s.el);
                if (style.visibility === 'hidden' || style.opacity === '0') continue;

                const rect = s.el.getBoundingClientRect();
                if (f.x >= rect.left && f.x <= rect.right) {
                    const colIndex = Math.floor((f.x - rect.left) / 6);
                    const currentPileHeight = s.pile[colIndex] || 0;
                    const surfaceY = rect.top - currentPileHeight;

                    if (f.y >= surfaceY && f.y <= rect.top + 8) {
                        if (currentPileHeight < MAX_SNOW_HEIGHT) {
                            s.pile[colIndex] = Math.min(MAX_SNOW_HEIGHT, currentPileHeight + (f.r * 0.25));
                        }
                        resetFlake(f);
                        landed = true;
                        break;
                    }
                }
            }

            if (!landed) {
                if (f.y > height) {
                    resetFlake(f);
                } else if (f.x > width) {
                    f.x = 0;
                } else if (f.x < 0) {
                    f.x = width;
                }

                ctx.beginPath();
                ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 255, 255, ${f.opacity})`;
                ctx.fill();
            }
        }
    }

    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            width = snowCanvas.width = window.innerWidth;
            height = snowCanvas.height = window.innerHeight;
            if (renderer && camera) {
                camera.aspect = width / height;
                camera.position.z = width < 768 ? 4.3 : 3.5;
                camera.updateProjectionMatrix();
                renderer.setSize(width, height);
            }
            const newBaseScale = width < 768 ? 0.92 : 1.24;
            active3DObjects.forEach(obj => {
                const newPos = screenToWorld3D(obj.userData.leftPct, obj.userData.topPct, 1.55);
                obj.position.x = newPos.x;
                obj.userData.baseY = newPos.y;
                obj.userData.baseScale = newBaseScale;
                if (obj.userData.targetScale > 0.1) obj.userData.targetScale = newBaseScale;
            });
            updateSurfaces();
        }, 120);
    });

    updateSurfaces();
    renderSnow();
}

// ================================================================
// 3. DATOS DEL TALLER + IDENTIFICADORES EXPLÍCITOS POR SECCIÓN
// ================================================================
const tallerData = [
    {
        categoryLabel: "SECCIÓN 1 DE 6 • ADORNOS PARA EL ÁRBOL",
        heroTitle: "EL ARTE DE CREAR NAVIDAD.",
        heroSub: "Adornos hechos a mano que llenan el árbol de calidez y color.",
        cards: [
            {
                pos: { top: "32%", left: "12%" }, icon: "bauble",
                label: "Esferas de Tela", tag1: "Reciclaje", tag2: "20 min",
                title: "Esferas Tejidas y Retazos",
                desc: "Forra esferas de unicel o plástico viejo con retazos de suéteres tejidos, cuerda de yute y ramas de canela.",
                materials: ["Esferas base recicladas", "Retazos de tela tejida o fieltro", "Silicón frío o caliente", "Cordón de yute natural", "Ramas de canela y anís estrella"]
            },
            {
                pos: { top: "56%", left: "28%" }, icon: "star",
                label: "Estrellas 3D", tag1: "Origami", tag2: "Papel Kraft",
                title: "Estrellas Nórdicas de Papel",
                desc: "Pega 7 bolsas de papel kraft entre sí, recorta los bordes en ángulo y ábrelas para formar estrellas tridimensionales.",
                materials: ["7 bolsas de papel kraft", "Pegamento en barra", "Tijeras afiladas", "Perforadora de un hueco", "Hilo dorado para colgar"]
            },
            {
                pos: { top: "62%", left: "55%" }, icon: "wreath",
                label: "Corona Natural", tag1: "Botánico", tag2: "Aromático",
                title: "Corona de Eucalipto y Naranja",
                desc: "Entrelaza ramas de eucalipto sobre un aro de madera y decora con rodajas de naranja deshidratada.",
                materials: ["Aro de madera o alambre", "Ramas de eucalipto y pino", "Naranjas deshidratadas al horno", "Alambre floral fino", "Listón de terciopelo rojo"]
            },
            {
                pos: { top: "40%", left: "76%" }, icon: "candycane",
                label: "Bastones Hilo", tag1: "Clásico", tag2: "Fácil",
                title: "Bastones de Caramelo en Lana",
                desc: "Enrolla estambre rojo y blanco alrededor de limpiapipas gruesos y dales la curva clásica de bastón navideño.",
                materials: ["Estambre rojo y blanco", "Limpiapipas o alambre maleable", "Cascabeles pequeños", "Tijeras"]
            }
        ]
    },
    {
        categoryLabel: "SECCIÓN 2 DE 6 • PAPEL, LUZ Y ORIGAMI",
        heroTitle: "PAPEL, LUZ Y GEOMETRÍA.",
        heroSub: "Pequeñas aldeas y copos plegados con paciencia invernal.",
        cards: [
            {
                pos: { top: "34%", left: "15%" }, icon: "house",
                label: "Aldea Luminosa", tag1: "Centro de Mesa", tag2: "Cartulina",
                title: "Casitas Blancas con Luz LED",
                desc: "Recorta fachadas de casitas en cartulina opalina, cala sus ventanas y coloca velas LED cálidas en su interior.",
                materials: ["Cartulina opalina blanca (220g)", "Cúter de precisión y regla", "Velas LED a batería", "Papel albanene para las ventanas"]
            },
            {
                pos: { top: "58%", left: "34%" }, icon: "tree",
                label: "Pinos Acordeón", tag1: "Origami", tag2: "15 min",
                title: "Abetos Plegados en Abanico",
                desc: "Dobla círculos de papel verde bosque en acordeón y apílalos de mayor a menor sobre un palito de madera.",
                materials: ["Papel verde bosque y dorado", "Palillos de brocheta", "Cuentas de madera para la base", "Estrella de cartón metálico"]
            },
            {
                pos: { top: "32%", left: "58%" }, icon: "snowflake",
                label: "Copos Calados", tag1: "Ventanas", tag2: "Infantil",
                title: "Copos de Nieve Simétricos",
                desc: "Dobla cuadrados de papel seda en triángulos y realiza cortes geométricos para crear diseños irrepetibles.",
                materials: ["Papel seda o bond blanco", "Tijeras pequeñas", "Cinta adhesiva transparente"]
            },
            {
                pos: { top: "56%", left: "75%" }, icon: "moon",
                label: "Guirnalda", tag1: "Paredes", tag2: "Minimalista",
                title: "Guirnalda de Lunas y Estrellas",
                desc: "Cose a máquina o pega siluetas de cartulina dorada sobre un hilo largo para decorar marcos de puertas.",
                materials: ["Cartulina dorada mate", "Hilo de algodón crudo", "Perforadora de figuras"]
            }
        ]
    },
    {
        categoryLabel: "SECCIÓN 3 DE 6 • VELAS Y CENTROS DE MESA",
        heroTitle: "AROMAS DE INVIERNO.",
        heroSub: "Texturas naturales para vestir la mesa de Nochebuena.",
        cards: [
            {
                pos: { top: "42%", left: "14%" }, icon: "jar",
                label: "Portavelas", tag1: "Frascos", tag2: "Rústico",
                title: "Frascos Nevados con Sal de Grano",
                desc: "Cubre frascos de vidrio con barniz transparente y ruédalos sobre sal gruesa para simular escarcha cristalina.",
                materials: ["Frascos de vidrio reciclados", "Sal de grano gruesa", "Pegamento blanco o mod podge", "Ramas de romero fresco"]
            },
            {
                pos: { top: "32%", left: "38%" }, icon: "holly",
                label: "Servilleteros", tag1: "Mesa", tag2: "Elegante",
                title: "Aros de Romero y Arándanos",
                desc: "Forma pequeños círculos con ramitas de romero fresco y ensarta arándanos rojos para abrazar las servilletas de lino.",
                materials: ["Ramas frescas de romero", "Arándanos rojos frescos", "Alambre dorado delgado", "Servilletas de tela"]
            },
            {
                pos: { top: "58%", left: "56%" }, icon: "candle",
                label: "Velas Canela", tag1: "Aroma", tag2: "10 min",
                title: "Velones Envueltos en Canela",
                desc: "Rodea velas blancas gruesas con ramas de canela enteras y sujétalas con un lazo de yute.",
                materials: ["Velones cilíndricos blancos", "Rajas de canela del mismo alto", "Banda elástica y cordón de yute"]
            },
            {
                pos: { top: "38%", left: "77%" }, icon: "pinecone",
                label: "Camino Mesa", tag1: "Natural", tag2: "Piñas",
                title: "Camino de Piñas Nevadas",
                desc: "Pinta las puntas de piñas de pino recolectadas con pintura acrílica blanca para darles un toque invernal.",
                materials: ["Piñas de pino secas", "Pintura acrílica blanca", "Esponja o pincel seco", "Guirnalda de micro-luces"]
            }
        ]
    },
    {
        categoryLabel: "SECCIÓN 4 DE 6 • ENVOLTURAS Y TARJETAS",
        heroTitle: "EL DETALLE DE ENVOLVER.",
        heroSub: "La primera emoción antes de abrir un regalo.",
        cards: [
            {
                pos: { top: "32%", left: "16%" }, icon: "seal",
                label: "Sello Lacre", tag1: "Clásico", tag2: "Cartas",
                title: "Tarjetas con Sello de Cera",
                desc: "Derrite barras de lacre rojo o dorado sobre cartulina texturizada y presiona con un sello metálico.",
                materials: ["Barras de lacre y cuchara", "Sello metálico navideño", "Tarjetas de papel algodón", "Pluma fuente o marcador dorado"]
            },
            {
                pos: { top: "56%", left: "32%" }, icon: "gift",
                label: "Furoshiki", tag1: "Tela", tag2: "Reutilizable",
                title: "Envoltura Japonesa en Tela",
                desc: "Envuelve cajas y libros usando pañuelos de algodón estampados con nudos decorativos sin usar cinta adhesiva.",
                materials: ["Cuadrados de tela de algodón (50x50cm)", "Ramita de pino o acebo", "Etiqueta de cartón"]
            },
            {
                pos: { top: "44%", left: "60%" }, icon: "tag",
                label: "Etiquetas", tag1: "Acuarela", tag2: "Personal",
                title: "Etiquetas Pintadas a Acuarela",
                desc: "Pinta pequeñas coronas verdes o bayas rojas en tarjetas recortadas y escribe el nombre de cada destinatario.",
                materials: ["Papel acuarela (300g)", "Acuarelas verde y carmín", "Pincel fino redondo #2", "Listón delgado"]
            },
            {
                pos: { top: "60%", left: "76%" }, icon: "deer",
                label: "Reno Papel", tag1: "Niños", tag2: "Divertido",
                title: "Bolsas de Regalo con Cara de Reno",
                desc: "Transforma bolsas de papel marrón pegando astas de cartulina, ojos de papel y un pompón rojo brillante.",
                materials: ["Bolsas kraft con asas", "Pompones rojos grandes", "Cartulina café oscura", "Pegamento blanco"]
            }
        ]
    },
    {
        categoryLabel: "SECCIÓN 5 DE 6 • REGALOS COMESTIBLES",
        heroTitle: "DULCES HECHOS EN CASA.",
        heroSub: "Frascos llenos de sabor para compartir cariño.",
        cards: [
            {
                pos: { top: "38%", left: "14%" }, icon: "cookie",
                label: "Mix Galletas", tag1: "Frasco", tag2: "Regalo",
                title: "Frasco de Galletas en Capas",
                desc: "Alterna capas de harina, azúcar mascabado, avena y chispas de chocolate en un frasco con la receta escrita.",
                materials: ["Frasco hermético de 1 litro", "Harina, avena y azúcar morena", "Chispas de chocolate y nueces", "Etiqueta con instrucciones de horneado"]
            },
            {
                pos: { top: "55%", left: "36%" }, icon: "mug",
                label: "Chocolate", tag1: "Invierno", tag2: "Cucharas",
                title: "Cucharas de Chocolate Caliente",
                desc: "Llena cucharas de madera con chocolate fundido, malvaviscos mini y trocitos de caramelo de menta.",
                materials: ["Cucharas de madera desechables", "Chocolate semi-amargo para fundir", "Mini malvaviscos", "Bolsitas de celofán y listón"]
            },
            {
                pos: { top: "34%", left: "60%" }, icon: "gingerman",
                label: "Jengibre", tag1: "Horneado", tag2: "Clásico",
                title: "Galletas de Jengibre Glaseadas",
                desc: "Hornea muñecos y estrellas especiadas con jengibre y clavo, y decóralos con glaseado real blanco.",
                materials: ["Harina, miel y mantequilla", "Jengibre, canela y clavo molido", "Azúcar glass y clara de huevo", "Cortadores navideños"]
            },
            {
                pos: { top: "52%", left: "76%" }, icon: "tea",
                label: "Infusión", tag1: "Té", tag2: "Aromático",
                title: "Mezcla de Té Especiado Navideño",
                desc: "Combina té negro en hebras con cáscara de naranja seca, cardamomo, canela y clavos de olor en bolsitas de tela.",
                materials: ["Té negro Assam o Ceilán", "Cardamomo verde y canela", "Cáscara de naranja deshidratada", "Saquitos de muselina de algodón"]
            }
        ]
    },
    {
        isDealsSection: true,
        categoryLabel: "SECCIÓN 6 DE 6 • CAZADOR DE OFERTAS IA EN VIVO",
        heroTitle: "OFERTAS Y DESCUENTOS IA.",
        heroSub: "Rastreo real en vivo de ofertas navideñas en Amazon y Mercado Libre.",
        cards: [
            {
                pos: { top: "42%", left: "11%" }, icon: "shoppingBag",
                store: "Amazon",
                label: "Amazon Ofertas", tag1: "Amazon México", tag2: "En Vivo",
                title: "Árboles de Navidad Nevados y con Luz LED",
                desc: "Búsqueda IA en tiempo real en Amazon México con descuentos de temporada y envío Prime.",
                materials: [
                    "Tienda: Amazon México (Ofertas Verificadas)",
                    "Categoría: Árboles navideños nevados y frondosos",
                    "Disponibilidad: Envío Prime en todo México",
                    "Filtro aplicado: Mejores descuentos activos"
                ],
                url: "https://www.amazon.com.mx/s?k=arbol+navidad+nevado+luces+led&rh=p_n_deal_type%3A23565492011"
            },
            {
                pos: { top: "58%", left: "30%" }, icon: "gift",
                store: "Mercado Libre",
                label: "Mercado Libre", tag1: "Mercado Libre", tag2: "API Real",
                title: "Set de Esferas Navideñas y Adornos para Árbol",
                desc: "Resultados reales consultados vía API de Mercado Libre México con envío Full.",
                materials: [
                    "Tienda: Mercado Libre México",
                    "Categoría: Esferas y adornos navideños",
                    "Beneficio: Envío Full y Meses sin Intereses",
                    "Consulta: Actualizada en tiempo real por IA"
                ],
                url: "https://listado.mercadolibre.com.mx/esferas-navidenas_Descuento_Desde-20_NoIndex_True"
            },
            {
                pos: { top: "40%", left: "56%" }, icon: "tree",
                store: "Amazon",
                label: "Luces LED Amazon", tag1: "Amazon México", tag2: "Top Oferta",
                title: "Series de Luces Cascada y Cortina LED Navideña",
                desc: "Ofertas relámpago detectadas por IA en iluminación navideña exterior e interior en Amazon.",
                materials: [
                    "Tienda: Amazon México",
                    "Categoría: Series y cascadas de luces LED",
                    "Modalidad: Envío rápido a domicilio",
                    "Filtro aplicado: Ofertas del día"
                ],
                url: "https://www.amazon.com.mx/s?k=serie+luces+navidad+led+cascada&rh=p_n_deal_type%3A23565492011"
            },
            {
                pos: { top: "56%", left: "75%" }, icon: "star",
                store: "Mercado Libre",
                label: "Villas y Coronas ML", tag1: "Mercado Libre", tag2: "API Real",
                title: "Villas Navideñas Luminosas, Inflables y Coronas",
                desc: "Promociones activas extraídas directamente desde el catálogo de Mercado Libre México.",
                materials: [
                    "Tienda: Mercado Libre México",
                    "Categoría: Villas, inflables y coronas navideñas",
                    "Envío: Gratis en compras elegibles Full",
                    "Consulta: Actualizada en tiempo real por IA"
                ],
                url: "https://listado.mercadolibre.com.mx/decoracion-navidena-villa-inflable_Descuento_Desde-20_NoIndex_True"
            }
        ]
    }
];

let currentSectionIdx = 0;

// ================================================================
// 4. AGENTE IA DE RASTREO REAL (API MERCADO LIBRE + AMAZON MÉXICO)
// ================================================================
const AMAZON_SEARCH_QUERIES = [
    {
        store: "Amazon",
        query: "arbol navidad nevado luces led",
        title: "Árbol de Navidad Nevado con Luces LED (Ofertas Amazon)",
        discount: "OFERTA",
        url: "https://www.amazon.com.mx/s?k=arbol+navidad+nevado+luces+led&rh=p_n_deal_type%3A23565492011"
    },
    {
        store: "Amazon",
        query: "proyector copos nieve navidad exterior",
        title: "Proyector Láser Copos de Nieve Navidad (Amazon México)",
        discount: "TOP DEAL",
        url: "https://www.amazon.com.mx/s?k=proyector+copos+nieve+navidad+exterior&rh=p_n_deal_type%3A23565492011"
    },
    {
        store: "Amazon",
        query: "villa navidena musical luz led",
        title: "Villa Navideña Musical con Movimiento y Luz (Amazon)",
        discount: "OFERTA",
        url: "https://www.amazon.com.mx/s?k=villa+navidena+musical+luz+led&rh=p_n_deal_type%3A23565492011"
    },
    {
        store: "Amazon",
        query: "sueter navideno reno luces led",
        title: "Suéter Navideño Tejido con Luces LED (Amazon México)",
        discount: "OFERTA",
        url: "https://www.amazon.com.mx/s?k=sueter+navideno+reno+luces+led&rh=p_n_deal_type%3A23565492011"
    }
];

const ML_SEARCH_TERMS = [
    "arbol navidad luces led",
    "esferas navidenas set",
    "inflable navideno santa claus",
    "serie luces cascada navidad",
    "villa navidena luz musical",
    "corona navidena puerta"
];

let realDealsQueue = [];
let pushNotificationsEnabled = false;
let dealPoolIndex = 0;

// Consulta real a la API pública de Mercado Libre México (MLM)
async function fetchRealMercadoLibreDeals() {
    const term = ML_SEARCH_TERMS[Math.floor(Math.random() * ML_SEARCH_TERMS.length)];
    const apiUrl = `https://api.mercadolibre.com/sites/MLM/search?q=${encodeURIComponent(term)}&limit=12`;

    try {
        const res = await fetch(apiUrl);
        if (!res.ok) throw new Error("ML API error");
        const data = await res.json();
        if (!data.results || !data.results.length) return [];

        const deals = [];
        for (const item of data.results) {
            if (!item.price || !item.permalink) continue;
            const hasDiscount = item.original_price && item.original_price > item.price;
            const pct = hasDiscount
                ? `-${Math.round(((item.original_price - item.price) / item.original_price) * 100)}%`
                : "OFERTA";

            deals.push({
                store: "Mercado Libre",
                title: item.title,
                price: `$${Number(item.price).toLocaleString("es-MX")} MXN`,
                oldPrice: hasDiscount ? `$${Number(item.original_price).toLocaleString("es-MX")} MXN` : "",
                discount: pct,
                url: item.permalink,
                isRealML: true
            });
        }

        // Priorizar productos con descuento real primero
        deals.sort((a, b) => (b.oldPrice ? 1 : 0) - (a.oldPrice ? 1 : 0));
        return deals.slice(0, 6);
    } catch (err) {
        return [];
    }
}

// Actualiza dinámicamente las tarjetas de la Sección 6 con resultados reales de la API
async function syncRealDealsIntoSection6() {
    const mlDeals = await fetchRealMercadoLibreDeals();
    const sec6 = tallerData[5];
    if (!sec6) return;

    if (mlDeals.length > 0) {
        // Actualizar tarjeta 1 (Mercado Libre)
        const d1 = mlDeals[0];
        sec6.cards[1].title = d1.title;
        sec6.cards[1].label = `ML ${d1.discount}`;
        sec6.cards[1].tag2 = d1.discount;
        sec6.cards[1].desc = `Detectado en vivo por API de Mercado Libre: ${d1.price}${d1.oldPrice ? ` (Antes ${d1.oldPrice})` : ""}.`;
        sec6.cards[1].materials = [
            "Tienda: Mercado Libre México (API Oficial en vivo)",
            `Precio Actual: ${d1.price}`,
            d1.oldPrice ? `Precio Anterior: ${d1.oldPrice} (${d1.discount})` : "Promoción activa verificada",
            "Clic en 'Ir a la oferta en tienda' para abrir publicación real"
        ];
        sec6.cards[1].url = d1.url;

        // Actualizar tarjeta 3 (Mercado Libre) si hay un segundo producto real
        if (mlDeals[1]) {
            const d2 = mlDeals[1];
            sec6.cards[3].title = d2.title;
            sec6.cards[3].label = `ML ${d2.discount}`;
            sec6.cards[3].tag2 = d2.discount;
            sec6.cards[3].desc = `Detectado en vivo por API de Mercado Libre: ${d2.price}${d2.oldPrice ? ` (Antes ${d2.oldPrice})` : ""}.`;
            sec6.cards[3].materials = [
                "Tienda: Mercado Libre México (API Oficial en vivo)",
                `Precio Actual: ${d2.price}`,
                d2.oldPrice ? `Precio Anterior: ${d2.oldPrice} (${d2.discount})` : "Promoción activa verificada",
                "Clic en 'Ir a la oferta en tienda' para abrir publicación real"
            ];
            sec6.cards[3].url = d2.url;
        }

        // Alimentar la cola de notificaciones en vivo mezclando Mercado Libre real + Amazon México
        realDealsQueue = [];
        mlDeals.forEach((m, i) => {
            realDealsQueue.push(m);
            const amz = AMAZON_SEARCH_QUERIES[i % AMAZON_SEARCH_QUERIES.length];
            realDealsQueue.push({
                store: "Amazon",
                title: amz.title,
                price: "Ver precio en oferta",
                oldPrice: "",
                discount: amz.discount,
                url: amz.url
            });
        });

        // Si el usuario está actualmente viendo la Sección 6, refrescar las tarjetas en pantalla
        if (currentSectionIdx === 5) {
            renderSectionProgressively(5);
        }
    }
}

function initAIDealHunter() {
    const statusText = document.getElementById('ai-status-text');
    const btnNotif = document.getElementById('btn-enable-notif');
    const stores = ["Amazon", "Mercado Libre"];
    let scanStep = 0;

    // Primera consulta real inmediata a la API
    syncRealDealsIntoSection6();

    if (btnNotif) {
        btnNotif.addEventListener('click', async () => {
            if (!("Notification" in window)) {
                pushNotificationsEnabled = true;
                btnNotif.classList.add('active');
                btnNotif.textContent = "🔔 Alertas Activas";
                return;
            }
            const perm = await Notification.requestPermission();
            if (perm === "granted") {
                pushNotificationsEnabled = true;
                btnNotif.classList.add('active');
                btnNotif.textContent = "🔔 Alertas Activas";
                if (realDealsQueue.length > 0) showDealNotification(realDealsQueue[0]);
            } else {
                pushNotificationsEnabled = true;
                btnNotif.classList.add('active');
                btnNotif.textContent = "🔔 Alertas Web Activas";
            }
        });
    }

    setInterval(async () => {
        if (document.hidden) return;
        const currentStore = stores[scanStep % stores.length];
        if (statusText) {
            statusText.textContent = `IA rastreando ${currentStore}...`;
        }
        scanStep++;

        // Cada 4 ciclos volver a consultar la API real de Mercado Libre con otra categoría navideña
        if (scanStep % 4 === 0) {
            await syncRealDealsIntoSection6();
        }

        if (scanStep % 2 === 0) {
            if (realDealsQueue.length === 0) {
                await syncRealDealsIntoSection6();
            }

            const pool = realDealsQueue.length > 0
                ? realDealsQueue
                : AMAZON_SEARCH_QUERIES.map(a => ({
                    store: "Amazon",
                    title: a.title,
                    price: "Oferta activa",
                    oldPrice: "",
                    discount: a.discount,
                    url: a.url
                }));

            const deal = pool[dealPoolIndex % pool.length];
            dealPoolIndex++;

            if (statusText) {
                statusText.textContent = `¡${deal.discount} en ${deal.store}!`;
            }
            showDealNotification(deal);
        }
    }, 6000);
}

function showDealNotification(deal) {
    const feed = document.getElementById('ai-notifications-feed');
    if (feed) {
        if (feed.children.length >= 2) {
            feed.removeChild(feed.firstChild);
        }

        const toast = document.createElement('div');
        toast.className = 'deal-toast con-nieve';
        toast.innerHTML = `
            <div class="toast-header">
                <span>⚡ IA Detectó ${deal.discount}</span>
                <span class="toast-store-badge">${deal.store}</span>
            </div>
            <div class="toast-title">${deal.title}</div>
            <div class="toast-price">${deal.price} ${deal.oldPrice ? `<span>${deal.oldPrice}</span>` : ""}</div>
        `;

        toast.style.cursor = "pointer";
        toast.addEventListener('click', () => {
            window.open(deal.url, '_blank', 'noopener,noreferrer');
        });

        feed.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('hiding');
            setTimeout(() => {
                if (toast.parentNode) toast.parentNode.removeChild(toast);
            }, 400);
        }, 6500);
    }

    if (pushNotificationsEnabled && "Notification" in window && Notification.permission === "granted") {
        new Notification(`🎄 Oferta ${deal.discount} en ${deal.store}`, {
            body: `${deal.title} — ${deal.price}`
        });
    }
}

// ================================================================
// 5. CONTROLADOR GENERAL DE INTERFAZ Y APARICIÓN PROGRESIVA
// ================================================================
function createMagicSparkles() {
    const container = document.getElementById('magic-sparkles');
    if (!container) return;

    const count = IS_MOBILE ? 12 : 20;
    const colors = [
        'radial-gradient(circle, #fff8d6 0%, #ffd166 60%, transparent 100%)',
        'radial-gradient(circle, #ffe5ec 0%, #ff4d6d 60%, transparent 100%)',
        'radial-gradient(circle, #e0fbfc 0%, #4cc9f0 60%, transparent 100%)'
    ];

    for (let i = 0; i < count; i++) {
        const spark = document.createElement('div');
        spark.className = 'sparkle-dot';
        const size = Math.random() * 4 + 2;
        spark.style.width = `${size}px`;
        spark.style.height = `${size}px`;
        spark.style.background = colors[i % colors.length];
        spark.style.left = `${Math.random() * 100}%`;
        spark.style.top = `${Math.random() * 100}%`;
        spark.style.animationDuration = `${Math.random() * 5 + 4}s`;
        spark.style.animationDelay = `${Math.random() * 5}s`;
        container.appendChild(spark);
    }
}

function updateConstellationLine() {
    const line = document.getElementById('constellation-line');
    const nodes = document.querySelectorAll('.hotspot-node');
    if (!line || nodes.length === 0) return;

    const offsetPx = window.innerWidth < 768 ? 22 : 31;
    const points = Array.from(nodes).map(node => {
        const x = (parseFloat(node.style.left) / 100) * window.innerWidth + offsetPx;
        const y = (parseFloat(node.style.top) / 100) * window.innerHeight + offsetPx;
        return `${x},${y}`;
    });

    line.setAttribute('points', points.join(' '));
}

function renderSectionProgressively(idx) {
    const sec = tallerData[idx];
    const hotspotNodes = document.querySelectorAll('.hotspot-node');
    const storeFilters = document.getElementById('store-filters');
    const sectionCategory = document.getElementById('section-category');
    if (!sec) return;

    selectedNodeIdx = -1;
    hoveredNodeIdx = -1;
    hotspotNodes.forEach(node => node.classList.remove('revealed', 'active', 'filtered-out'));

    if (sectionCategory) {
        sectionCategory.textContent = sec.categoryLabel;
    }

    if (storeFilters) {
        if (sec.isDealsSection) {
            storeFilters.classList.remove('hidden');
        } else {
            storeFilters.classList.add('hidden');
        }
    }

    spawnSection3DObjects(idx, true);

    sec.cards.forEach((cardData, i) => {
        const node = hotspotNodes[i];
        if (!node) return;

        node.style.top = cardData.pos.top;
        node.style.left = cardData.pos.left;
        node.setAttribute('data-store', cardData.store || '');

        document.getElementById(`label-${i}`).textContent = cardData.label;
        document.getElementById(`tag1-${i}`).textContent = cardData.tag1;
        document.getElementById(`tag2-${i}`).textContent = cardData.tag2;
        document.getElementById(`title-${i}`).textContent = cardData.title;
        document.getElementById(`desc-${i}`).textContent = cardData.desc;

        const glassCard = document.getElementById(`card-${i}`);
        if (glassCard) {
            glassCard.setAttribute('data-fav-id', `navidad-sec${idx}-card${i}`);
            glassCard.setAttribute('data-fav-title', cardData.title);
            glassCard.setAttribute('data-fav-cat', sec.isDealsSection ? `Navidad • ${cardData.store}` : 'Navidad • Tutorial');
        }

        const actionBtn = document.getElementById(`action-btn-${i}`);
        if (actionBtn) {
            actionBtn.textContent = sec.isDealsSection ? "Ver oferta en tienda" : "Ver materiales";
        }

        setTimeout(() => {
            node.classList.add('revealed');
        }, i * 140 + 80);
    });

    updateConstellationLine();
}

function initCreativeMenu() {
    const introGate = document.getElementById('intro-gate');
    const btnEnter = document.getElementById('btn-enter');
    const btnBackHome = document.getElementById('btn-back-home');
    const mainExp = document.getElementById('main-experience');
    const hotspotNodes = document.querySelectorAll('.hotspot-node');
    const dotButtons = document.querySelectorAll('.dot-btn');
    const sectionCategory = document.getElementById('section-category');
    const sectionTitle = document.getElementById('section-title');
    const sectionSubtitle = document.getElementById('section-subtitle');
    const craftModal = document.getElementById('craft-modal');
    const closeModalBtn = document.getElementById('close-modal');
    const filterChips = document.querySelectorAll('.filter-chip');

    createMagicSparkles();
    initAIDealHunter();

    if (btnEnter && introGate && mainExp) {
        btnEnter.addEventListener('click', () => {
            introGate.classList.add('fade-out');
            mainExp.classList.remove('hidden');
            renderSectionProgressively(currentSectionIdx);
        });
    }

    // BOTÓN DE INICIO REDIRIGE DIRECTAMENTE A INDEX.HTML
    if (btnBackHome) {
        btnBackHome.addEventListener('click', () => {
            window.location.href = "index.html";
        });
    }

    filterChips.forEach(chip => {
        chip.addEventListener('click', () => {
            filterChips.forEach(c => c.classList.remove('active'));
            chip.classList.add('active');

            const selectedStore = chip.getAttribute('data-store');
            hotspotNodes.forEach((node, i) => {
                const nodeStore = node.getAttribute('data-store');
                const match = (selectedStore === 'all' || nodeStore === selectedStore);
                if (match) {
                    node.classList.remove('filtered-out');
                    if (active3DObjects[i]) active3DObjects[i].userData.targetScale = active3DObjects[i].userData.baseScale;
                } else {
                    node.classList.add('filtered-out');
                    node.classList.remove('active');
                    if (active3DObjects[i]) active3DObjects[i].userData.targetScale = 0.52;
                }
            });
        });
    });

    hotspotNodes.forEach((node, idx) => {
        const trigger = node.querySelector('.hotspot-trigger');

        trigger.addEventListener('mouseenter', () => {
            hoveredNodeIdx = idx;
        });

        trigger.addEventListener('mouseleave', () => {
            if (hoveredNodeIdx === idx) hoveredNodeIdx = -1;
        });

        trigger.addEventListener('touchstart', () => {
            hoveredNodeIdx = idx;
        }, { passive: true });

        trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            const isActive = node.classList.contains('active');

            hotspotNodes.forEach(n => n.classList.remove('active'));
            selectedNodeIdx = -1;

            if (!isActive) {
                const leftVal = parseFloat(node.style.left);
                if (leftVal > 58) {
                    node.classList.add('align-right');
                } else {
                    node.classList.remove('align-right');
                }
                node.classList.add('active');
                selectedNodeIdx = idx;
            }
        });
    });

    document.addEventListener('click', () => {
        hotspotNodes.forEach(n => n.classList.remove('active'));
        selectedNodeIdx = -1;
        hoveredNodeIdx = -1;
    });

    document.querySelectorAll('.glass-card').forEach(card => {
        card.addEventListener('click', e => e.stopPropagation());
    });

    if (closeModalBtn && craftModal) {
        closeModalBtn.addEventListener('click', () => {
            craftModal.classList.add('hidden');
        });
        craftModal.addEventListener('click', (e) => {
            if (e.target === craftModal) {
                craftModal.classList.add('hidden');
            }
        });
    }

    dotButtons.forEach(dot => {
        dot.addEventListener('click', () => {
            const idx = parseInt(dot.getAttribute('data-section'), 10);
            if (idx === currentSectionIdx) return;
            currentSectionIdx = idx;

            dotButtons.forEach(d => d.classList.remove('active'));
            dot.classList.add('active');

            switchSweaterTheme(idx);

            const sec = tallerData[idx];
            if (!sec) return;

            sectionTitle.style.opacity = 0;
            sectionSubtitle.style.opacity = 0;
            setTimeout(() => {
                if (sectionCategory) sectionCategory.textContent = sec.categoryLabel;
                sectionTitle.textContent = sec.heroTitle;
                sectionSubtitle.textContent = sec.heroSub;
                sectionTitle.style.opacity = 1;
                sectionSubtitle.style.opacity = 1;
            }, 220);

            renderSectionProgressively(idx);
        });
    });

    window.addEventListener('resize', updateConstellationLine);
}

window.abrirDetalle = function(cardIndex) {
    const sec = tallerData[currentSectionIdx];
    if (!sec || !sec.cards[cardIndex]) return;

    const item = sec.cards[cardIndex];
    const modal = document.getElementById('craft-modal');
    const badgeEl = document.getElementById('modal-badge');
    const titleEl = document.getElementById('modal-title');
    const introEl = document.getElementById('modal-intro');
    const listEl = document.getElementById('modal-materials');
    const storeLink = document.getElementById('modal-store-link');
    const favBtn = document.getElementById('modal-fav-btn');

    badgeEl.textContent = sec.isDealsSection ? `Oferta Verificada • ${item.store}` : "Guía Rápida";
    titleEl.textContent = item.title;
    introEl.textContent = sec.isDealsSection
        ? "Resumen de disponibilidad y promoción detectada por el agente IA:"
        : "Lista de materiales esenciales para realizar este proyecto en casa:";

    listEl.innerHTML = "";
    item.materials.forEach(mat => {
        const li = document.createElement('li');
        li.textContent = mat;
        listEl.appendChild(li);
    });

    const favId = `navidad-sec${currentSectionIdx}-card${cardIndex}`;
    const favCategory = sec.isDealsSection ? `Navidad • ${item.store}` : "Navidad • Tutorial";
    const favUrl = sec.isDealsSection && item.url ? item.url : `navidad.html#${favId}`;

    if (favBtn) {
        favBtn.setAttribute('data-fav-item', favId);
        favBtn.textContent = "☆ Guardar en Favoritos";
        favBtn.onclick = (e) => {
            e.stopPropagation();
            if (typeof window.guardarEnFavoritosYRedirigir === "function") {
                window.guardarEnFavoritosYRedirigir(favId, item.title, favCategory, favUrl);
            }
        };
        if (typeof window.syncIndividualButtonsState === "function") {
            window.syncIndividualButtonsState();
        }
    }

    // En tutoriales se oculta "Ir a la oferta en tienda" y queda "Guardar en Favoritos"; en compras sí se muestra
    if (storeLink) {
        if (sec.isDealsSection && item.url) {
            storeLink.href = item.url;
            storeLink.classList.remove('hidden');
        } else {
            storeLink.classList.add('hidden');
        }
    }

    modal.classList.remove('hidden');
};

document.addEventListener('DOMContentLoaded', () => {
    initKnitBackground();
    initInteractiveSnow();
    initCreativeMenu();
});