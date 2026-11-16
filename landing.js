// ==========================================
// 1. ESTILOS METALIZADOS PLATEADOS Y WARP BOX CON GLOW CROMÁTICO
// ==========================================
(function injectPureSilverStyles() {
    if (document.getElementById('pure-silver-css')) return;
    const style = document.createElement('style');
    style.id = 'pure-silver-css';
    style.textContent = `
        /* HEADER FIJO EN LA PARTE SUPERIOR */
        .landing-header-hud {
            position: absolute !important;
            top: 15px !important;
            left: 50% !important;
            transform: translateX(-50%) !important;
            width: 100% !important;
            max-width: 900px !important;
            z-index: 60 !important;
            text-align: center !important;
            pointer-events: auto !important;
        }

        .warp-title-box {
            position: relative !important;
            width: 100% !important;
            height: 65px !important;
            margin: 2px auto !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            overflow: visible !important;
            cursor: pointer !important;
        }

        .warp-fallback-text {
            font-family: 'Exo', sans-serif !important;
            font-weight: 900 !important;
            font-size: clamp(1.6rem, 3.2vw, 2.6rem) !important;
            background: linear-gradient(135deg, #ffffff 0%, #00f0ff 25%, #ff007f 50%, #ff5500 75%, #ffcc00 100%) !important;
            -webkit-background-clip: text !important;
            -webkit-text-fill-color: transparent !important;
            text-transform: uppercase !important;
            letter-spacing: 0.02em !important;
            white-space: nowrap !important;
            filter: drop-shadow(0 0 15px rgba(255, 85, 0, 0.8)) drop-shadow(0 0 30px rgba(255, 0, 127, 0.5)) !important;
            margin: 0 !important;
            padding: 0 !important;
            pointer-events: none !important;
            transition: opacity 0.3s ease !important;
        }

        /* TARJETAS PRINCIPALES EN ACERO / PLATINO */
        .orbital-node, .card, .sys-card, [class*="sys_card"], [class*="orbital_card"] {
            background: linear-gradient(135deg, rgba(22, 27, 38, 0.92) 0%, rgba(10, 13, 20, 0.96) 100%) !important;
            border: 1px solid rgba(220, 230, 245, 0.75) !important;
            box-shadow: 0 0 20px rgba(255, 255, 255, 0.25),
                        inset 0 1px 2px rgba(255, 255, 255, 0.6) !important;
            border-radius: 14px !important;
            outline: none !important;
            transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1) !important;
        }

        .orbital-node:hover, .card:hover, .sys-card:hover, [class*="sys_"]:hover,
        .orbital-node:focus, .card:focus, .sys-card:focus, [class*="sys_"]:focus,
        .orbital-node.active, .card.active, .sys-card.active, [class*="sys_"].active,
        *:hover {
            border-color: #ffffff !important;
        }

        /* ESTADO HOVER DE TARJETAS 100% FIJO (SIN TRANSLATE NI SCALE) */
        .orbital-node:hover, .card:hover, .sys-card:hover, [class*="sys_card"]:hover {
            border: 1px solid #ffffff !important;
            transform: translateY(0) scale(1) !important;
            box-shadow: 0 0 35px rgba(255, 255, 255, 0.95),
                        0 0 20px rgba(230, 235, 250, 0.7),
                        inset 0 0 15px rgba(255, 255, 255, 0.8) !important;
        }

        .orbital-node img, .card img, .sys-card img, [class*="sys_"] img {
            width: 100% !important;
            height: auto !important;
            max-height: 160px !important;
            object-fit: cover !important;
            display: block !important;
            opacity: 1 !important;
            visibility: visible !important;
            mix-blend-mode: normal !important;
            border-radius: 8px !important;
            border: 1px solid rgba(255, 255, 255, 0.5) !important;
            filter: contrast(108%) brightness(100%) !important;
            transition: filter 0.25s ease, border-color 0.25s ease !important;
        }

        /* Cambia esta regla en la Sección 1 de landing.js */
        .orbital-node:hover, .card:hover, .sys-card:hover, [class*="sys_card"]:hover {
            border: 1px solid #ffffff !important;
            transform: none !important; /* <-- Cambia translateY(-6px) por none */
            box-shadow: 0 0 35px rgba(255, 255, 255, 0.95),
                        0 0 20px rgba(230, 235, 250, 0.7),
                        inset 0 0 15px rgba(255, 255, 255, 0.8) !important;
        }

        .orbital-node span, .card span, .sys-card span, [class*="sys_"] span {
            background: linear-gradient(180deg, #ffffff 0%, #cbd5e1 50%, #94a3b8 100%) !important;
            color: #0b0f19 !important;
            font-weight: 800 !important;
            border: 1px solid #ffffff !important;
            border-radius: 5px !important;
            box-shadow: 0 2px 5px rgba(0,0,0,0.5), inset 0 1px 1px rgba(255,255,255,0.8) !important;
        }

        .orbital-node h2, .orbital-node h3, .orbital-node h4, .card h2, .card h3 {
            color: #ffffff !important;
            text-shadow: 0 0 10px rgba(255, 255, 255, 0.5) !important;
        }

        .orbital-node p, .card p {
            color: #cbd5e1 !important;
        }
    `;
    document.head.appendChild(style);
})();

// ==========================================
// 2. MOTOR BALATRO SHADER (FONDO LÍQUIDO INTERACTIVO)
// ==========================================
(function initBalatroEngine() {
    let canvas = document.getElementById('balatro-canvas');
    if (!canvas) {
        canvas = document.createElement('canvas');
        canvas.id = 'balatro-canvas';
        canvas.style.position = 'fixed';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.width = '100vw';
        canvas.style.height = '100vh';
        canvas.style.zIndex = '-3';
        canvas.style.pointerEvents = 'none';
        document.body.appendChild(canvas);
    }

    const gl = canvas.getContext('webgl2', {
        alpha: true,
        premultipliedAlpha: true,
        antialias: false,
        depth: false,
        stencil: false,
        powerPreference: 'high-performance'
    });

    if (!gl) return;

    const PIXEL_BUDGET = 2.4e6;
    const MAX_TWIRLS = 4;
    const FIELD_SCALE = 8;
    const STIR_RADIUS = 90;

    const VERTEX = `#version 300 es
    const vec2 corners[3] = vec2[3](vec2(-1.0, -1.0), vec2(3.0, -1.0), vec2(-1.0, 3.0));
    void main() {
      gl_Position = vec4(corners[gl_VertexID], 0.0, 1.0);
    }`;

    const FIELD = `#version 300 es
    precision highp float;
    uniform sampler2D uPrev;
    uniform vec2 uSize;
    uniform vec2 uCss;
    uniform vec2 uFrom;
    uniform vec2 uTo;
    uniform vec2 uPush;
    uniform float uRadius;
    uniform float uDecay;
    out vec4 fragColor;
    void main() {
      vec2 cell = gl_FragCoord.xy / uSize;
      vec2 p = vec2(cell.x, 1.0 - cell.y) * uCss;
      vec2 seg = uTo - uFrom;
      float len2 = max(dot(seg, seg), 1e-6);
      float h = clamp(dot(p - uFrom, seg) / len2, 0.0, 1.0);
      vec2 gap = p - uFrom - seg * h;
      vec2 delta = uPush * exp(-dot(gap, gap) / (uRadius * uRadius));
      vec2 src = p - delta;
      vec2 prev = texture(uPrev, vec2(src.x / uCss.x, 1.0 - src.y / uCss.y)).xy;
      fragColor = vec4((prev + delta) * uDecay, 0.0, 1.0);
    }`;

    const PAINT = `#version 300 es
    precision highp float;
    uniform vec2 uCss;
    uniform vec2 uCanvas;
    uniform float uBlock;
    uniform float uFlow;
    uniform float uSpin;
    uniform vec2 uOffset;
    uniform vec3 uColor1;
    uniform vec3 uColor2;
    uniform vec3 uColor3;
    uniform float uContrast;
    uniform float uLighting;
    uniform float uSwirl;
    uniform float uScale;
    uniform int uDetail;
    uniform sampler2D uField;
    uniform float uFieldOn;
    uniform vec4 uTwirls[${MAX_TWIRLS}];
    uniform float uReveal;
    uniform float uLight;
    uniform float uOpacity;
    out vec4 fragColor;

    vec3 paint(vec2 screenSize, vec2 coords) {
      vec2 uv = (coords - 0.5 * screenSize) / length(screenSize) - uOffset;
      float radius = length(uv);
      float speed = uSpin + 302.2;
      float angle = atan(uv.y, uv.x) + speed - 20.0 * (uSwirl * radius + (1.0 - uSwirl));
      vec2 mid = (screenSize / length(screenSize)) / 2.0;
      uv = vec2(radius * cos(angle) + mid.x, radius * sin(angle) + mid.y) - mid;
      uv *= 30.0 / uScale;
      speed = uFlow;
      vec2 uv2 = vec2(uv.x + uv.y);
      for (int i = 0; i < 8; i++) {
        if (i >= uDetail) break;
        uv2 += sin(max(uv.x, uv.y)) + uv;
        uv += 0.5 * vec2(cos(5.1123314 + 0.353 * uv2.y + speed * 0.131121), sin(uv2.x - 0.113 * speed));
        uv -= cos(uv.x + uv.y) - sin(uv.x * 0.711 - uv.y);
      }
      float contrastMod = 0.25 * uContrast + 0.5 * uSwirl + 1.2;
      float amount = min(2.0, max(0.0, length(uv) * 0.035 * contrastMod));
      float c1 = max(0.0, 1.0 - contrastMod * abs(1.0 - amount));
      float c2 = max(0.0, 1.0 - contrastMod * abs(amount));
      float c3 = 1.0 - min(1.0, c1 + c2);
      float light = (uLighting - 0.2) * max(c1 * 5.0 - 4.0, 0.0) + uLighting * max(c2 * 5.0 - 4.0, 0.0);
      vec3 gap = uLight > 0.5 ? mix(uColor3, vec3(1.0), 0.9) : uColor3;
      float base = 0.3 / uContrast;
      vec3 color = base * uColor1 + (1.0 - base) * (uColor1 * c1 + uColor2 * c2 + gap * c3) + light;
      return mix(gap, color, uReveal);
    }

    void main() {
      vec2 cell = floor(gl_FragCoord.xy) + 0.5;
      vec2 p = vec2(cell.x, uCanvas.y - cell.y) * uBlock;
      if (uFieldOn > 0.5) {
        p -= texture(uField, vec2(p.x / uCss.x, 1.0 - p.y / uCss.y)).xy;
      }
      for (int i = 0; i < ${MAX_TWIRLS}; i++) {
        vec4 twirl = uTwirls[i];
        if (twirl.w <= 0.0) continue;
        vec2 rel = p - twirl.xy;
        float turn = twirl.z * exp(-dot(rel, rel) / (twirl.w * twirl.w));
        float c = cos(turn);
        float s = sin(turn);
        p = twirl.xy + vec2(c * rel.x - s * rel.y, s * rel.x + c * rel.y);
      }
      vec3 color = paint(uCss, vec2(p.x, uCss.y - p.y));
      float grain = (fract(52.9829189 * fract(dot(cell, vec2(0.06711056, 0.00583715)))) - 0.5) / 255.0;
      color = clamp(color + grain, 0.0, 1.0);
      fragColor = vec4(color * uOpacity, uOpacity);
    }`;

    const clamp = (val, min, max) => Math.min(max, Math.max(min, val));
    const parseColor = hex => {
        const h = hex.replace('#', '');
        return [
            parseInt(h.substring(0, 2), 16) / 255,
            parseInt(h.substring(2, 4), 16) / 255,
            parseInt(h.substring(4, 6), 16) / 255
        ];
    };

    const compile = (type, source) => {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) return shader;
        gl.deleteShader(shader);
        return null;
    };

    const link = source => {
        const vertex = compile(gl.VERTEX_SHADER, VERTEX);
        const fragment = compile(gl.FRAGMENT_SHADER, source);
        const program = gl.createProgram();
        gl.attachShader(program, vertex);
        gl.attachShader(program, fragment);
        gl.linkProgram(program);
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return null;
        const uniforms = {};
        const count = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
        for (let i = 0; i < count; i++) {
            const info = gl.getActiveUniform(program, i);
            if (info) uniforms[info.name.replace(/\[0\]$/, '')] = gl.getUniformLocation(program, info.name);
        }
        return { program, uniforms };
    };

    const paintProgram = link(PAINT);
    if (!paintProgram) return;

    const floatTargets = !!(gl.getExtension('EXT_color_buffer_float') || gl.getExtension('EXT_color_buffer_half_float'));
    const fieldProgram = floatTargets ? link(FIELD) : null;

    const vao = gl.createVertexArray();
    const settings = {
        color1: parseColor('#E2E4E6'),
        color2: parseColor('#1A1C1E'),
        color3: parseColor('#1A1C1E'),
        contrast: 3.5,
        lighting: 0.25,
        swirl: 0.22,
        speed: 0.10,
        rotation: 0.8,
        scale: 1.15,
        detail: 3,
        offset: [0, 0],
        pixelSize: 0.5,
        crt: 0,
        mouse: true,
        strength: 1,
        clickSwirl: true,
        intro: true,
        light: false,
        opacity: 0.85,
        maxRatio: 2
    };

    const view = { cssWidth: 1, cssHeight: 1, block: 1, device: 1, width: 1, height: 1 };
    const field = { width: 0, height: 0, targets: [], energy: 0 };
    const pointer = { x: window.innerWidth / 2, y: window.innerHeight / 2, lastX: 0, lastY: 0, vx: 0, ready: true };
    const steer = { value: 0 };
    const twirls = [];
    const twirlData = new Float32Array(MAX_TWIRLS * 4);

    let flow = 14;
    let spin = 0;
    let opening = 0;
    let last = 0;

    const makeTarget = (w, h) => {
        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RG16F, w, h, 0, gl.RG, gl.HALF_FLOAT, null);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        const framebuffer = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
        return { texture, framebuffer };
    };

    const dropField = () => {
        field.targets.forEach(t => { gl.deleteTexture(t.texture); gl.deleteFramebuffer(t.framebuffer); });
        field.targets = []; field.width = 0; field.height = 0; field.energy = 0;
    };

    const resize = () => {
        const cssWidth = Math.max(1, window.innerWidth);
        const cssHeight = Math.max(1, window.innerHeight);
        const dpr = Math.min(window.devicePixelRatio || 1, settings.maxRatio);
        const budget = Math.ceil(Math.sqrt((cssWidth * cssHeight * dpr * dpr) / PIXEL_BUDGET) - 0.05);
        const device = Math.max(settings.pixelSize > 0 ? Math.round(settings.pixelSize * dpr) : 1, budget, 1);
        const width = Math.max(1, Math.ceil((cssWidth * dpr) / device));
        const height = Math.max(1, Math.ceil((cssHeight * dpr) / device));

        canvas.width = width * device;
        canvas.height = height * device;

        view.cssWidth = cssWidth;
        view.cssHeight = cssHeight;
        view.block = device / dpr;
        view.device = device;
        view.width = width;
        view.height = height;

        if (!fieldProgram) return;
        const fieldWidth = clamp(Math.ceil(cssWidth / FIELD_SCALE), 8, 320);
        const fieldHeight = clamp(Math.ceil(cssHeight / FIELD_SCALE), 8, 320);
        if (fieldWidth === field.width && fieldHeight === field.height) return;
        dropField();
        field.width = fieldWidth;
        field.height = fieldHeight;
        field.targets = [makeTarget(fieldWidth, fieldHeight), makeTarget(fieldWidth, fieldHeight)];
    };

    window.addEventListener('resize', resize);
    resize();

    const stir = (fromX, fromY, toX, toY, pushX, pushY, decay) => {
        if (!fieldProgram || !field.targets.length) return;
        const [read, write] = field.targets;
        gl.bindFramebuffer(gl.FRAMEBUFFER, write.framebuffer);
        gl.viewport(0, 0, field.width, field.height);
        gl.useProgram(fieldProgram.program);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, read.texture);
        const u = fieldProgram.uniforms;
        gl.uniform1i(u.uPrev, 0);
        gl.uniform2f(u.uSize, field.width, field.height);
        gl.uniform2f(u.uCss, view.cssWidth, view.cssHeight);
        gl.uniform2f(u.uFrom, fromX, fromY);
        gl.uniform2f(u.uTo, toX, toY);
        gl.uniform2f(u.uPush, pushX, pushY);
        gl.uniform1f(u.uRadius, STIR_RADIUS);
        gl.uniform1f(u.uDecay, decay);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
        field.targets = [write, read];
    };

    const smoother = t => {
        const x = clamp(t, 0, 1);
        return x * x * x * (x * (x * 6 - 15) + 10);
    };

    window.addEventListener('pointermove', e => {
        if (!pointer.ready) { pointer.lastX = e.clientX; pointer.lastY = e.clientY; }
        pointer.vx = e.clientX - pointer.x;
        pointer.x = e.clientX;
        pointer.y = e.clientY;
        pointer.ready = true;
    }, { passive: true });

    window.addEventListener('pointerdown', e => {
        if (!settings.clickSwirl) return;
        twirls.push({ x: e.clientX, y: e.clientY, age: 0, direction: pointer.vx < 0 ? 1 : -1 });
        if (twirls.length > MAX_TWIRLS) twirls.shift();
    }, { passive: true });

    function frame(now) {
        const dt = clamp((now - last) / 1000 || 0, 0, 0.05);
        last = now;

        flow += dt * settings.speed * 7;
        spin += dt * settings.rotation * 0.2;
        if (opening < 1) opening = Math.min(1, opening + dt / 2.2);

        const steerTarget = (pointer.x / view.cssWidth - 0.5) * 0.35 * settings.strength;
        steer.value += (steerTarget - steer.value) * (1 - Math.exp(-dt / 0.8));

        gl.bindVertexArray(vao);

        if (fieldProgram && field.targets.length) {
            const dx = pointer.x - pointer.lastX;
            const dy = pointer.y - pointer.lastY;
            const moved = pointer.ready && (dx !== 0 || dy !== 0);
            const decay = Math.exp(-dt / 1.6);
            if (moved || field.energy > 0.05) {
                const amount = 0.85 * settings.strength;
                const travel = moved ? Math.hypot(dx, dy) * amount : 0;
                const steps = Math.max(1, Math.ceil(travel / (STIR_RADIUS * 0.3)));
                for (let step = 0; step < steps; step++) {
                    const a = step / steps;
                    const b = (step + 1) / steps;
                    stir(
                        pointer.lastX + dx * a, pointer.lastY + dy * a,
                        pointer.lastX + dx * b, pointer.lastY + dy * b,
                        moved ? dx * (b - a) * amount : 0, moved ? dy * (b - a) * amount : 0,
                        step === steps - 1 ? decay : 1
                    );
                }
                field.energy = field.energy * decay + travel;
            }
        }

        pointer.lastX = pointer.x;
        pointer.lastY = pointer.y;

        for (let i = twirls.length - 1; i >= 0; i--) {
            twirls[i].age += dt;
            if (twirls[i].age >= 3.2) twirls.splice(i, 1);
        }

        twirlData.fill(0);
        twirls.forEach((twirl, idx) => {
            const t = twirl.age;
            const rise = smoother(t / 0.25);
            const fall = 1 - smoother((t - 0.25) / 2.95);
            twirlData[idx * 4] = twirl.x;
            twirlData[idx * 4 + 1] = twirl.y;
            twirlData[idx * 4 + 2] = twirl.direction * 1.9 * rise * fall;
            twirlData[idx * 4 + 3] = 150 * (1 + 0.6 * smoother(t / 3.2));
        });

        const eased = 1 - Math.pow(1 - opening, 3);
        const unwind = 1 - eased;

        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.useProgram(paintProgram.program);

        const u = paintProgram.uniforms;
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, field.targets.length ? field.targets[0].texture : null);
        gl.uniform1i(u.uField, 0);
        gl.uniform1f(u.uFieldOn, field.targets.length && field.energy > 0.05 ? 1 : 0);
        gl.uniform2f(u.uCss, view.cssWidth, view.cssHeight);
        gl.uniform2f(u.uCanvas, view.width, view.height);
        gl.uniform1f(u.uBlock, view.block);
        gl.uniform1f(u.uFlow, flow);
        gl.uniform1f(u.uSpin, -0.4 + spin + steer.value + 2.6 * unwind * unwind);
        gl.uniform2f(u.uOffset, settings.offset[0], settings.offset[1]);
        gl.uniform3f(u.uColor1, settings.color1[0], settings.color1[1], settings.color1[2]);
        gl.uniform3f(u.uColor2, settings.color2[0], settings.color2[1], settings.color2[2]);
        gl.uniform3f(u.uColor3, settings.color3[0], settings.color3[1], settings.color3[2]);
        gl.uniform1f(u.uContrast, settings.contrast);
        gl.uniform1f(u.uLighting, settings.lighting);
        gl.uniform1f(u.uSwirl, Math.min(1, settings.swirl + 0.55 * unwind));
        gl.uniform1f(u.uScale, settings.scale);
        gl.uniform1i(u.uDetail, settings.detail);
        gl.uniform4fv(u.uTwirls, twirlData);
        gl.uniform1f(u.uReveal, smoother(opening / 0.45));
        gl.uniform1f(u.uLight, 0);
        gl.uniform1f(u.uOpacity, settings.opacity);

        gl.drawArrays(gl.TRIANGLES, 0, 3);
        requestAnimationFrame(frame);
    }

    requestAnimationFrame(frame);
})();

// ==========================================
// 3. FONDO ESPACIAL LIGERO Y METEORITOS (COLORES AL AZAR)
// ==========================================
(function initSpaceMeteorBackground() {
    let bgCanvas = document.getElementById('space-bg-canvas');
    if (!bgCanvas) {
        bgCanvas = document.createElement('canvas');
        bgCanvas.id = 'space-bg-canvas';
        bgCanvas.style.position = 'fixed';
        bgCanvas.style.top = '0';
        bgCanvas.style.left = '0';
        bgCanvas.style.width = '100vw';
        bgCanvas.style.height = '100vh';
        bgCanvas.style.zIndex = '-2';
        bgCanvas.style.pointerEvents = 'none';
        document.body.appendChild(bgCanvas);
    }

    const ctx = bgCanvas.getContext('2d');
    let w = bgCanvas.width = window.innerWidth;
    let h = bgCanvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
        w = bgCanvas.width = window.innerWidth;
        h = bgCanvas.height = window.innerHeight;
    });

    const stars = Array.from({ length: 70 }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        size: Math.random() * 1.4 + 0.4,
        alpha: Math.random() * 0.7 + 0.3,
        speed: Math.random() * 0.02 + 0.005
    }));

    const COLOR_PALETTES = [
        { head: '166, 255, 234', mid: '255, 85, 0', tail: '180, 0, 255' },
        { head: '255, 0, 150', mid: '255, 220, 0', tail: '0, 255, 200' },
        { head: '0, 240, 255', mid: '130, 0, 255', tail: '255, 0, 100' },
        { head: '255, 215, 0', mid: '255, 50, 0', tail: '120, 0, 255' },
        { head: '100, 255, 100', mid: '0, 200, 255', tail: '200, 0, 255' }
    ];

    const meteors = [];

    function spawnMeteor() {
        if (meteors.length < 5 && Math.random() < 0.06) {
            const randomPalette = COLOR_PALETTES[Math.floor(Math.random() * COLOR_PALETTES.length)];
            meteors.push({
                x: Math.random() * w * 1.2 - w * 0.2,
                y: Math.random() * -80,
                length: Math.random() * 100 + 70,
                speed: Math.random() * 8 + 10,
                size: Math.random() * 1.8 + 0.8,
                alpha: 1.0,
                colors: randomPalette
            });
        }
    }

    function renderSpace() {
        ctx.clearRect(0, 0, w, h);

        for (let s of stars) {
            s.alpha += Math.sin(Date.now() * s.speed) * 0.01;
            ctx.fillStyle = `rgba(230, 240, 255, ${Math.abs(s.alpha)})`;
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
            ctx.fill();
        }

        spawnMeteor();
        for (let i = meteors.length - 1; i >= 0; i--) {
            const m = meteors[i];
            m.x += m.speed * 1.2;
            m.y += m.speed;
            m.alpha -= 0.009;

            const tailX = m.x - m.length * 1.2;
            const tailY = m.y - m.length;

            const meteorGrad = ctx.createLinearGradient(m.x, m.y, tailX, tailY);
            meteorGrad.addColorStop(0, `rgba(${m.colors.head}, ${m.alpha})`);
            meteorGrad.addColorStop(0.35, `rgba(${m.colors.mid}, ${m.alpha * 0.85})`);
            meteorGrad.addColorStop(0.7, `rgba(${m.colors.tail}, ${m.alpha * 0.5})`);
            meteorGrad.addColorStop(1, 'transparent');

            ctx.strokeStyle = meteorGrad;
            ctx.lineWidth = m.size * 1.2;
            ctx.lineCap = 'round';

            ctx.beginPath();
            ctx.moveTo(m.x, m.y);
            ctx.lineTo(tailX, tailY);
            ctx.stroke();

            ctx.fillStyle = `rgba(${m.colors.head}, ${m.alpha})`;
            ctx.beginPath();
            ctx.arc(m.x, m.y, m.size + 0.8, 0, Math.PI * 2);
            ctx.fill();

            if (m.y > h + 100 || m.x > w + 100 || m.alpha <= 0) {
                meteors.splice(i, 1);
            }
        }

        requestAnimationFrame(renderSpace);
    }
    renderSpace();
})();

// ==========================================
// 4. MOTOR DITHERVEIL OPTIMIZADO
// ==========================================
const CONFIG = {
    src: 'imagenes/chrome-head.jpg',
    fallbackSrc: 'https://images.unsplash.com/photo-1737071371043-761e02b1ef95?q=80&w=1400&auto=format&fit=crop',
    revealRadius: 180,
    softness: 0.5,
    pixelSize: 2,
    bgNoiseCutoff: 0.09
};

function initDitherVeilEngine() {
    const container = document.getElementById('dither-canvas-container');
    if (!container) return;

    container.innerHTML = '';

    const canvas = document.createElement('canvas');
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.display = 'block';
    container.appendChild(canvas);

    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    const bufferCanvas = document.createElement('canvas');
    const bufferCtx = bufferCanvas.getContext('2d', { willReadFrequently: true });

    let headImage = new Image();
    let headData = null;
    let imgWidth = 800;
    let imgHeight = 900;

    function cargarImagen(url) {
        headImage = new Image();
        headImage.crossOrigin = 'anonymous';
        headImage.onload = () => {
            imgWidth = headImage.naturalWidth || 800;
            imgHeight = headImage.naturalHeight || 900;
            bufferCanvas.width = imgWidth;
            bufferCanvas.height = imgHeight;
            bufferCtx.drawImage(headImage, 0, 0, imgWidth, imgHeight);
            headData = bufferCtx.getImageData(0, 0, imgWidth, imgHeight).data;
        };
        headImage.onerror = () => {
            if (url !== CONFIG.fallbackSrc) {
                cargarImagen(CONFIG.fallbackSrc);
            }
        };
        headImage.src = url;
    }

    cargarImagen(CONFIG.src);

    let width = window.innerWidth;
    let height = window.innerHeight;

    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resize);
    resize();

    const pointer = { x: width / 2, y: height / 2 };
    const bursts = [];

    window.addEventListener('pointermove', (e) => {
        pointer.x = e.clientX;
        pointer.y = e.clientY;
    });

    window.addEventListener('pointerdown', (e) => {
        bursts.push({ x: e.clientX, y: e.clientY, radius: 10 });
        if (bursts.length > 5) bursts.shift();
    });

    const bayer4x4 = [
        [ 0,  8,  2, 10],
        [12,  4, 14,  6],
        [ 3, 11,  1,  9],
        [15,  7, 13,  5]
    ];

    function render() {
        ctx.clearRect(0, 0, width, height);

        if (!headData) {
            requestAnimationFrame(render);
            return;
        }

        const targetSize = Math.min(width, height) * 1.80;
        const scale = targetSize / Math.max(imgWidth, imgHeight);

        const hw = Math.round(imgWidth * scale);
        const hh = Math.round(imgHeight * scale);
        const hx = Math.round((width - hw) / 2);
        const hy = Math.round((height - hh) / 2 + 150);

        for (let i = bursts.length - 1; i >= 0; i--) {
            bursts[i].radius += 14;
            if (bursts[i].radius > 380) bursts.splice(i, 1);
        }

        const imgData = ctx.getImageData(0, 0, width, height);
        const data = imgData.data;

        const step = CONFIG.pixelSize;
        const radius = CONFIG.revealRadius;

        const startY = Math.max(0, hy);
        const endY = Math.min(height, hy + hh);
        const startX = Math.max(0, hx);
        const endX = Math.min(width, hx + hw);

        for (let y = startY; y < endY; y += step) {
            for (let x = startX; x < endX; x += step) {
                const bx = Math.round((x - hx) / scale);
                const by = Math.round((y - hy) / scale);

                if (bx >= 0 && bx < imgWidth && by >= 0 && by < imgHeight) {
                    const bIdx = (by * imgWidth + bx) * 4;
                    const alpha = headData[bIdx + 3];

                    if (alpha > 10) {
                        const r = headData[bIdx];
                        const g = headData[bIdx + 1];
                        const b = headData[bIdx + 2];
                        const brightness = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

                        if (brightness <= CONFIG.bgNoiseCutoff) continue;

                        const dx = x - pointer.x;
                        const dy = y - pointer.y;
                        const dist = Math.sqrt(dx * dx + dy * dy);

                        let reveal = Math.max(0, Math.min(1, (radius - dist) / (radius * CONFIG.softness)));

                        for (let k = 0; k < bursts.length; k++) {
                            const bBurst = bursts[k];
                            const bdx = x - bBurst.x;
                            const bdy = y - bBurst.y;
                            const bDist = Math.sqrt(bdx * bdx + bdy * bdy);
                            if (Math.abs(bDist - bBurst.radius) < 35) {
                                reveal = 1.0;
                                break;
                            }
                        }

                        let finalR, finalG, finalB, finalAlpha = 255;

                        if (reveal >= 1.0) {
                            finalR = r;
                            finalG = g;
                            finalB = b;
                        } else {
                            const gridX = Math.floor(x / step) % 4;
                            const gridY = Math.floor(y / step) % 4;
                            const threshold = (bayer4x4[gridY][gridX] + 0.5) / 16;

                            if (brightness > threshold) {
                                finalR = Math.round(244 * (1 - reveal) + r * reveal);
                                finalG = Math.round(241 * (1 - reveal) + g * reveal);
                                finalB = Math.round(234 * (1 - reveal) + b * reveal);
                            } else {
                                finalAlpha = Math.round(255 * reveal);
                                if (finalAlpha <= 5) continue;
                                finalR = r;
                                finalG = g;
                                finalB = b;
                            }
                        }

                        const alphaFactor = (alpha / 255) * (finalAlpha / 255);
                        finalR = Math.round(finalR * alphaFactor);
                        finalG = Math.round(finalG * alphaFactor);
                        finalB = Math.round(finalB * alphaFactor);

                        for (let py = 0; py < step && (y + py) < height; py++) {
                            for (let px = 0; px < step && (x + px) < width; px++) {
                                const pIdx = ((y + py) * width + (x + px)) * 4;
                                data[pIdx] = finalR;
                                data[pIdx + 1] = finalG;
                                data[pIdx + 2] = finalB;
                                data[pIdx + 3] = Math.round(255 * alphaFactor);
                            }
                        }
                    }
                }
            }
        }

        ctx.putImageData(imgData, 0, 0);
        requestAnimationFrame(render);
    }

    render();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDitherVeilEngine);
} else {
    initDitherVeilEngine();
}

// ==========================================
// 5. MOTOR GLOW CURSOR (FLUIDO WEBGL2)
// ==========================================
(function initGlowCursorEngine() {
    const VERTEX = `#version 300 es
    in vec2 aPosition;
    uniform vec2 uTexel;
    out vec2 vUv;
    out vec2 vL;
    out vec2 vR;
    out vec2 vT;
    out vec2 vB;
    void main() {
      vUv = aPosition * 0.5 + 0.5;
      vL = vUv - vec2(uTexel.x, 0.0);
      vR = vUv + vec2(uTexel.x, 0.0);
      vT = vUv + vec2(0.0, uTexel.y);
      vB = vUv - vec2(0.0, uTexel.y);
      gl_Position = vec4(aPosition, 0.0, 1.0);
    }`;

    const HEADER = `#version 300 es
    precision highp float;
    precision highp sampler2D;
    in vec2 vUv;
    in vec2 vL;
    in vec2 vR;
    in vec2 vT;
    in vec2 vB;
    out vec4 outColor;
    `;

    const SPLAT = `${HEADER}
    uniform sampler2D uTarget;
    uniform float uAspect;
    uniform vec2 uA;
    uniform vec2 uB;
    uniform float uRadius;
    uniform float uWide;
    uniform vec3 uValue;
    uniform float uMode;
    uniform float uStrength;
    float erf(float x) {
      float x2 = x * x;
      float a = 0.147;
      return sign(x) * sqrt(1.0 - exp(-x2 * (1.2732395 + a * x2) / (1.0 + a * x2)));
    }
    float sweep(float along, float length, float across, float radius) {
      return exp(-across * across / (radius * radius)) * 0.5 * (erf(along / radius) - erf((along - length) / radius));
    }
    void main() {
      vec2 p = vec2(vUv.x * uAspect, vUv.y);
      vec2 a = vec2(uA.x * uAspect, uA.y);
      vec2 ab = vec2(uB.x * uAspect, uB.y) - a;
      float len = length(ab);
      vec2 dir = len > 1e-6 ? ab / len : vec2(1.0, 0.0);
      vec2 ap = p - a;
      vec3 base = texture(uTarget, vUv).xyz;
      if (uMode > 1.5) {
        float along = dot(ap, dir);
        float across = dot(ap, vec2(-dir.y, dir.x));
        if (uMode > 2.5) {
          outColor = vec4(mix(base, uValue, sweep(along, len, across, uRadius) * uStrength), 1.0);
          return;
        }
        vec3 add = vec3(uValue.xy * sweep(along, len, across, uRadius), uValue.z * sweep(along, len, across, uWide));
        outColor = vec4(base + add, 1.0);
        return;
      }
      float h = clamp(dot(ap, ab) / max(dot(ab, ab), 1e-9), 0.0, 1.0);
      vec2 d = ap - ab * h;
      float r2 = dot(d, d);
      float falloff = exp(-r2 / (uRadius * uRadius));
      float wide = exp(-r2 / (uWide * uWide));
      vec3 result = uMode > 0.5 ? mix(base, uValue, falloff * uStrength) : base + vec3(uValue.xy * falloff, uValue.z * wide);
      outColor = vec4(result, 1.0);
    }`;

    const ADVECT = `${HEADER}
    uniform sampler2D uVelocity;
    uniform sampler2D uSource;
    uniform vec2 uVelocityTexel;
    uniform float uDt;
    uniform vec4 uDecay;
    void main() {
      vec2 coord = vUv - uDt * texture(uVelocity, vUv).xy * uVelocityTexel;
      outColor = texture(uSource, coord) * uDecay;
    }`;

    const MACCORMACK = `${HEADER}
    uniform sampler2D uVelocity;
    uniform sampler2D uSource;
    uniform sampler2D uForward;
    uniform sampler2D uBack;
    uniform vec2 uVelocityTexel;
    uniform vec2 uSourceTexel;
    uniform float uDt;
    uniform vec4 uDecay;
    void main() {
      vec2 coord = vUv - uDt * texture(uVelocity, vUv).xy * uVelocityTexel;
      vec4 forward = texture(uForward, vUv);
      vec4 corrected = forward + 0.5 * (texture(uSource, vUv) - texture(uBack, vUv));
      vec2 base = (floor(coord / uSourceTexel - 0.5) + 0.5) * uSourceTexel;
      vec4 a = texture(uSource, base);
      vec4 b = texture(uSource, base + vec2(uSourceTexel.x, 0.0));
      vec4 c = texture(uSource, base + vec2(0.0, uSourceTexel.y));
      vec4 d = texture(uSource, base + uSourceTexel);
      vec4 low = min(min(a, b), min(c, d));
      vec4 high = max(max(a, b), max(c, d));
      outColor = clamp(corrected, low, high) * uDecay;
    }`;

    const DIVERGENCE = `${HEADER}
    uniform sampler2D uVelocity;
    void main() {
      float left = texture(uVelocity, vL).x;
      float right = texture(uVelocity, vR).x;
      float top = texture(uVelocity, vT).y;
      float bottom = texture(uVelocity, vB).y;
      vec2 center = texture(uVelocity, vUv).xy;
      if (vL.x < 0.0) left = -center.x;
      if (vR.x > 1.0) right = -center.x;
      if (vT.y > 1.0) top = -center.y;
      if (vB.y < 0.0) bottom = -center.y;
      outColor = vec4(0.5 * (right - left + top - bottom), 0.0, 0.0, 1.0);
    }`;

    const SCALE = `${HEADER}
    uniform sampler2D uSource;
    uniform float uValue;
    void main() {
      outColor = texture(uSource, vUv) * uValue;
    }`;

    const PRESSURE = `${HEADER}
    uniform sampler2D uPressure;
    uniform sampler2D uDivergence;
    void main() {
      float left = texture(uPressure, vL).x;
      float right = texture(uPressure, vR).x;
      float top = texture(uPressure, vT).x;
      float bottom = texture(uPressure, vB).x;
      float divergence = texture(uDivergence, vUv).x;
      outColor = vec4((left + right + bottom + top - divergence) * 0.25, 0.0, 0.0, 1.0);
    }`;

    const GRADIENT = `${HEADER}
    uniform sampler2D uPressure;
    uniform sampler2D uVelocity;
    void main() {
      float left = texture(uPressure, vL).x;
      float right = texture(uPressure, vR).x;
      float top = texture(uPressure, vT).x;
      float bottom = texture(uPressure, vB).x;
      vec2 velocity = texture(uVelocity, vUv).xy - vec2(right - left, top - bottom);
      outColor = vec4(velocity, 0.0, 1.0);
    }`;

    const SHADE = `
    uniform vec3 uColor;
    uniform vec3 uSecondary;
    uniform float uIntensity;
    uniform float uHotspot;
    vec3 shade(vec3 dye) {
      float energy = max(dye.x, 0.0);
      float heat = clamp(dye.y, 0.0, energy);
      float gas = max(dye.z, 0.0);
      float fresh = heat / max(energy, 0.0001);
      vec3 tint = mix(uSecondary, uColor, fresh);
      return (tint * energy + uSecondary * gas + vec3(heat * heat * 0.3 * uHotspot)) * uIntensity;
    }
    `;

    const PREFILTER = `${HEADER}${SHADE}
    uniform sampler2D uDye;
    uniform vec2 uDyeTexel;
    void main() {
      vec2 o = uDyeTexel * 0.5;
      vec3 light = shade(texture(uDye, vUv + vec2(-o.x, -o.y)).xyz);
      light += shade(texture(uDye, vUv + vec2(o.x, -o.y)).xyz);
      light += shade(texture(uDye, vUv + vec2(-o.x, o.y)).xyz);
      light += shade(texture(uDye, vUv + vec2(o.x, o.y)).xyz);
      outColor = vec4(light * 0.25, 1.0);
    }`;

    const DOWN = `${HEADER}
    uniform sampler2D uSource;
    uniform vec2 uSourceTexel;
    void main() {
      vec2 o = uSourceTexel;
      vec3 color = texture(uSource, vUv).rgb * 4.0;
      color += texture(uSource, vUv + vec2(-o.x, -o.y)).rgb;
      color += texture(uSource, vUv + vec2(o.x, -o.y)).rgb;
      color += texture(uSource, vUv + vec2(-o.x, o.y)).rgb;
      color += texture(uSource, vUv + vec2(o.x, o.y)).rgb;
      outColor = vec4(color / 8.0, 1.0);
    }`;

    const UP = `${HEADER}
    uniform sampler2D uSource;
    uniform vec2 uSourceTexel;
    void main() {
      vec2 o = uSourceTexel;
      vec3 color = texture(uSource, vUv + vec2(-o.x * 2.0, 0.0)).rgb;
      color += texture(uSource, vUv + vec2(o.x * 2.0, 0.0)).rgb;
      color += texture(uSource, vUv + vec2(0.0, -o.y * 2.0)).rgb;
      color += texture(uSource, vUv + vec2(0.0, o.y * 2.0)).rgb;
      color += texture(uSource, vUv + vec2(-o.x, -o.y)).rgb * 2.0;
      color += texture(uSource, vUv + vec2(o.x, -o.y)).rgb * 2.0;
      color += texture(uSource, vUv + vec2(-o.x, o.y)).rgb * 2.0;
      color += texture(uSource, vUv + vec2(o.x, o.y)).rgb * 2.0;
      outColor = vec4(color / 12.0, 1.0);
    }`;

    const DISPLAY = `${HEADER}${SHADE}
    uniform sampler2D uDye;
    uniform sampler2D uBloom;
    uniform float uGlow;
    uniform float uGrain;
    uniform float uTime;
    uniform float uLight;
    float hash(vec2 p) {
      p = fract(p * vec2(123.34, 456.21));
      p += dot(p, p + 45.32);
      return fract(p.x * p.y);
    }
    void main() {
      vec3 dye = texture(uDye, vUv).xyz;
      vec3 light = shade(dye);
      vec3 bloom = texture(uBloom, vUv).rgb * uGlow;
      float edge = smoothstep(0.0, 0.02, min(min(vUv.x, 1.0 - vUv.x), min(vUv.y, 1.0 - vUv.y)));
      float grain = 1.0 + (hash(gl_FragCoord.xy + fract(uTime * 13.7) * 97.0) - 0.5) * uGrain * 2.0;
      if (uLight > 0.5) {
        float energy = max(dye.x, 0.0);
        float heat = clamp(dye.y, 0.0, energy);
        float gas = max(dye.z, 0.0);
        float fresh = heat / max(energy, 0.0001);
        vec3 tint = mix(uSecondary, uColor, fresh);
        float halo = dot(bloom, vec3(0.2126, 0.7152, 0.0722));
        float density = 1.0 - exp(-((energy * 1.1 + gas * 0.8) * uIntensity + halo * 0.25));
        float tone = dot(tint, vec3(0.2126, 0.7152, 0.0722));
        vec3 ink = tint * min(1.0, 0.5 / max(tone, 0.001)) * mix(0.95, 0.72, smoothstep(0.5, 3.0, energy));
        ink = mix(ink, vec3(1.0), clamp(heat * heat * 0.05 * uHotspot, 0.0, 0.45));
        density = clamp(density * grain, 0.0, 1.0) * edge;
        outColor = vec4(ink * density, density);
      } else {
        vec3 color = 1.0 - exp(-(light + bloom) * grain);
        color *= edge;
        outColor = vec4(color, max(color.r, max(color.g, color.b)));
      }
    }`;

    const QUALITY = {
      low: { sim: 96, dye: 384 },
      medium: { sim: 128, dye: 576 },
      high: { sim: 160, dye: 768 }
    };

    const PRESSURE_STEPS = 20;
    const FLOW = 0.75;
    const BLOOM_LEVELS = 5;

    const clampVal = (value, min, max) => Math.min(max, Math.max(min, value));

    let canvas = document.getElementById('glow-cursor-canvas');
    if (!canvas) {
        canvas = document.createElement('canvas');
        canvas.id = 'glow-cursor-canvas';
        canvas.style.position = 'fixed';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.width = '100vw';
        canvas.style.height = '100vh';
        canvas.style.zIndex = '99';
        canvas.style.pointerEvents = 'none';
        document.body.appendChild(canvas);
    }

    const gl = canvas.getContext('webgl2', {
        alpha: true,
        premultipliedAlpha: true,
        antialias: false,
        depth: false,
        stencil: false
    });

    if (!gl || !gl.getExtension('EXT_color_buffer_float')) return;

    const compileShader = (type, source) => {
        const shader = gl.createShader(type);
        if (!shader) return null;
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) return shader;
        gl.deleteShader(shader);
        return null;
    };

    const vertexShader = compileShader(gl.VERTEX_SHADER, VERTEX);
    if (!vertexShader) return;

    const buildProgram = source => {
        const fragment = compileShader(gl.FRAGMENT_SHADER, source);
        const program = gl.createProgram();
        if (!fragment || !program) return null;
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragment);
        gl.bindAttribLocation(program, 0, 'aPosition');
        gl.linkProgram(program);
        gl.deleteShader(fragment);
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            gl.deleteProgram(program);
            return null;
        }
        const uniforms = {};
        const count = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
        for (let i = 0; i < count; i++) {
            const info = gl.getActiveUniform(program, i);
            if (info) uniforms[info.name] = gl.getUniformLocation(program, info.name);
        }
        return { program, uniforms };
    };

    const passes = {
        splat: buildProgram(SPLAT),
        advect: buildProgram(ADVECT),
        maccormack: buildProgram(MACCORMACK),
        divergence: buildProgram(DIVERGENCE),
        scale: buildProgram(SCALE),
        pressure: buildProgram(PRESSURE),
        gradient: buildProgram(GRADIENT),
        prefilter: buildProgram(PREFILTER),
        down: buildProgram(DOWN),
        up: buildProgram(UP),
        display: buildProgram(DISPLAY)
    };

    if (Object.values(passes).some(pass => !pass)) return;

    const vao = gl.createVertexArray();
    const buffer = gl.createBuffer();
    gl.bindVertexArray(vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

    const settings = {
        color: '#00ffcc',
        secondaryColor: '#ffffff',
        intensity: 1.3,
        trailWidth: clampVal(3, 0.5, 40),
        linger: clampVal(1.4, 0.1, 10),
        glow: 1.2,
        hotspot: 0.8,
        followSpeed: clampVal(0.6, 0, 1),
        grain: 0,
        clickBurst: true,
        quality: 'high',
        theme: 'dark',
        maxDevicePixelRatio: 2,
        enabled: true
    };

    const state = {
        width: window.innerWidth,
        height: window.innerHeight,
        ratio: 1,
        colorKey: '',
        color: [0, 1, 0.8],
        secondary: [1, 1, 1],
        pointer: { x: window.innerWidth / 2, y: window.innerHeight / 2, inside: true },
        emitter: { x: window.innerWidth / 2, y: window.innerHeight / 2, vx: 0, vy: 0, px: window.innerWidth / 2, py: window.innerHeight / 2 },
        ready: true,
        bursts: [],
        active: Date.now(),
        time: 0,
        allocated: '',
        targets: null
    };

    const createTarget = (w, h, internalFormat, format, filter) => {
        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, w, h, 0, format, gl.HALF_FLOAT, null);
        const fbo = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
        gl.viewport(0, 0, w, h);
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        return { texture, fbo, width: w, height: h, texel: [1 / w, 1 / h] };
    };

    const createPair = (w, h, internalFormat, format, filter) => {
        let read = createTarget(w, h, internalFormat, format, filter);
        let write = createTarget(w, h, internalFormat, format, filter);
        return {
            get read() { return read; },
            get write() { return write; },
            swap() { const next = read; read = write; write = next; },
            targets() { return [read, write]; }
        };
    };

    const destroyTarget = target => {
        gl.deleteTexture(target.texture);
        gl.deleteFramebuffer(target.fbo);
    };

    const release = () => {
        const t = state.targets;
        if (!t) return;
        [
            ...t.velocity.targets(),
            ...t.dye.targets(),
            ...t.pressure.targets(),
            t.divergence,
            t.forward,
            t.back,
            ...t.bloom
        ].forEach(destroyTarget);
        state.targets = null;
    };

    const allocate = () => {
        const key = `${settings.quality}|${state.width}|${state.height}|${canvas.width}|${canvas.height}`;
        if (key === state.allocated && state.targets) return;
        release();
        state.allocated = key;
        const preset = QUALITY[settings.quality];
        const aspect = state.width / state.height;
        const dims = base => (aspect >= 1 ? [Math.round(base * aspect), base] : [base, Math.round(base / aspect)]);
        const [simW, simH] = dims(preset.sim);
        let [dyeW, dyeH] = dims(preset.dye);
        const shrink = Math.min(1, canvas.width / dyeW, canvas.height / dyeH);
        dyeW = Math.max(2, Math.round(dyeW * shrink));
        dyeH = Math.max(2, Math.round(dyeH * shrink));
        const bloom = [];
        let bloomW = dyeW >> 1;
        let bloomH = dyeH >> 1;
        for (let i = 0; i < BLOOM_LEVELS; i++) {
            bloom.push(createTarget(Math.max(1, bloomW), Math.max(1, bloomH), gl.RGBA16F, gl.RGBA, gl.LINEAR));
            bloomW >>= 1;
            bloomH >>= 1;
        }
        state.targets = {
            velocity: createPair(simW, simH, gl.RG16F, gl.RG, gl.LINEAR),
            dye: createPair(dyeW, dyeH, gl.RGBA16F, gl.RGBA, gl.LINEAR),
            forward: createTarget(dyeW, dyeH, gl.RGBA16F, gl.RGBA, gl.LINEAR),
            back: createTarget(dyeW, dyeH, gl.RGBA16F, gl.RGBA, gl.LINEAR),
            pressure: createPair(simW, simH, gl.R16F, gl.RED, gl.NEAREST),
            divergence: createTarget(simW, simH, gl.R16F, gl.RED, gl.NEAREST),
            bloom
        };
    };

    const resize = () => {
        const width = Math.max(1, window.innerWidth);
        const height = Math.max(1, window.innerHeight);
        const ratio = Math.min(window.devicePixelRatio || 1, 2);
        const pixelWidth = Math.max(1, Math.round(width * ratio));
        const pixelHeight = Math.max(1, Math.round(height * ratio));
        if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
            canvas.width = pixelWidth;
            canvas.height = pixelHeight;
        }
        state.width = width;
        state.height = height;
        state.ratio = ratio;
        allocate();
    };

    window.addEventListener('resize', resize);
    resize();

    const draw = target => {
        if (target) {
            gl.bindFramebuffer(gl.FRAMEBUFFER, target.fbo);
            gl.viewport(0, 0, target.width, target.height);
        } else {
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
            gl.viewport(0, 0, canvas.width, canvas.height);
        }
        gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    const use = (pass, texel) => {
        gl.useProgram(pass.program);
        if (pass.uniforms.uTexel) gl.uniform2f(pass.uniforms.uTexel, texel[0], texel[1]);
        return pass.uniforms;
    };

    const bind = (unit, target) => {
        gl.activeTexture(gl.TEXTURE0 + unit);
        gl.bindTexture(gl.TEXTURE_2D, target.texture);
        return unit;
    };

    const splat = (pair, ax, ay, bx, by, radius, value, mode, strength, wide = radius) => {
        const u = use(passes.splat, pair.read.texel);
        gl.uniform1i(u.uTarget, bind(0, pair.read));
        gl.uniform1f(u.uAspect, state.width / state.height);
        gl.uniform2f(u.uA, ax / state.width, 1 - ay / state.height);
        gl.uniform2f(u.uB, bx / state.width, 1 - by / state.height);
        gl.uniform1f(u.uRadius, radius / state.height);
        gl.uniform1f(u.uWide, wide / state.height);
        gl.uniform3f(u.uValue, value[0], value[1], value[2]);
        gl.uniform1f(u.uMode, mode);
        gl.uniform1f(u.uStrength, strength);
        draw(pair.write);
        pair.swap();
    };

    const toGrid = (vx, vy) => {
        const { velocity } = state.targets;
        return [(vx * velocity.read.width) / state.width, (-vy * velocity.read.height) / state.height];
    };

    const lightRadius = () => Math.max(settings.trailWidth * 0.5, (state.height / state.targets.dye.read.height) * 0.9);

    const emit = (dt, now) => {
        const { emitter, pointer } = state;
        const { velocity, dye } = state.targets;
        emitter.px = emitter.x;
        emitter.py = emitter.y;
        
        const omega = 10 + settings.followSpeed * 50;
        const steps = Math.max(1, Math.ceil(dt / 0.004));
        const h = dt / steps;
        for (let k = 0; k < steps; k++) {
            emitter.vx += (omega * omega * (pointer.x - emitter.x) - 2 * omega * emitter.vx) * h;
            emitter.vy += (omega * omega * (pointer.y - emitter.y) - 2 * omega * emitter.vy) * h;
            emitter.x += emitter.vx * h;
            emitter.y += emitter.vy * h;
        }

        const dx = emitter.x - emitter.px;
        const dy = emitter.y - emitter.py;
        const length = Math.hypot(dx, dy);
        if (length < 0.05) return;
        const radius = lightRadius();

        const target = toGrid(dx / Math.max(dt, 1e-3), dy / Math.max(dt, 1e-3));
        splat(
            velocity,
            emitter.px,
            emitter.py,
            emitter.x,
            emitter.y,
            radius * 4 + 18,
            [target[0], target[1], 0],
            3,
            FLOW * 0.6
        );
        splat(dye, emitter.px, emitter.py, emitter.x, emitter.y, radius, [5.6, 5.6, 0.7], 2, 1, radius * 5 + 6);
        state.active = now;
    };

    const burst = (x, y, now) => {
        const { velocity, dye } = state.targets;
        const radius = lightRadius();
        const jets = 6;
        const base = Math.random() * Math.PI * 2;
        for (let k = 0; k < jets; k++) {
            const angle = base + (k / jets) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
            const cx = Math.cos(angle);
            const cy = Math.sin(angle);
            const reach = 20 + Math.random() * 14;
            const ax = x + cx * 3;
            const ay = y + cy * 3;
            const bx = x + cx * reach;
            const by = y + cy * reach;

            const target = toGrid(Math.cos(angle + 0.6) * 760, Math.sin(angle + 0.6) * 760);
            splat(velocity, ax, ay, bx, by, 18, [target[0], target[1], 0], 1, 0.9);
            splat(dye, ax, ay, bx, by, radius * 1.1, [2.4, 2.4, 0.3], 0, 1, radius * 5 + 6);
        }
        splat(dye, x, y, x + 0.01, y, radius * 2.2, [1.8, 1.8, 0.4], 0, 1, radius * 7 + 10);
        state.active = now;
    };

    const step = dt => {
        const { velocity, dye, pressure, divergence } = state.targets;

        let u = use(passes.divergence, velocity.read.texel);
        gl.uniform1i(u.uVelocity, bind(0, velocity.read));
        draw(divergence);

        u = use(passes.scale, pressure.read.texel);
        gl.uniform1i(u.uSource, bind(0, pressure.read));
        gl.uniform1f(u.uValue, 0.8);
        draw(pressure.write);
        pressure.swap();

        u = use(passes.pressure, pressure.read.texel);
        gl.uniform1i(u.uDivergence, bind(1, divergence));
        for (let i = 0; i < PRESSURE_STEPS; i++) {
            gl.uniform1i(u.uPressure, bind(0, pressure.read));
            draw(pressure.write);
            pressure.swap();
        }

        u = use(passes.gradient, velocity.read.texel);
        gl.uniform1i(u.uPressure, bind(0, pressure.read));
        gl.uniform1i(u.uVelocity, bind(1, velocity.read));
        draw(velocity.write);
        velocity.swap();

        u = use(passes.advect, velocity.read.texel);
        gl.uniform2f(u.uVelocityTexel, velocity.read.texel[0], velocity.read.texel[1]);
        gl.uniform1i(u.uVelocity, bind(0, velocity.read));
        gl.uniform1i(u.uSource, bind(0, velocity.read));
        gl.uniform1f(u.uDt, dt);
        const calm = Math.exp(-dt * 1.2);
        gl.uniform4f(u.uDecay, calm, calm, 1, 1);
        draw(velocity.write);
        velocity.swap();

        const decay = [
            Math.exp((-dt * 4.6) / (settings.linger * 0.8)),
            Math.exp((-dt * 4.6) / (settings.linger * 0.2)),
            Math.exp((-dt * 4.6) / (settings.linger * 1.2)),
            1
        ];
        const { forward, back } = state.targets;

        u = use(passes.advect, dye.read.texel);
        gl.uniform2f(u.uVelocityTexel, velocity.read.texel[0], velocity.read.texel[1]);
        gl.uniform1i(u.uVelocity, bind(0, velocity.read));
        gl.uniform1i(u.uSource, bind(1, dye.read));
        gl.uniform1f(u.uDt, dt);
        gl.uniform4f(u.uDecay, 1, 1, 1, 1);
        draw(forward);
        gl.uniform1i(u.uSource, bind(1, forward));
        gl.uniform1f(u.uDt, -dt);
        draw(back);
        u = use(passes.maccormack, dye.read.texel);
        gl.uniform2f(u.uVelocityTexel, velocity.read.texel[0], velocity.read.texel[1]);
        gl.uniform2f(u.uSourceTexel, dye.read.texel[0], dye.read.texel[1]);
        gl.uniform1i(u.uVelocity, bind(0, velocity.read));
        gl.uniform1i(u.uSource, bind(1, dye.read));
        gl.uniform1i(u.uForward, bind(2, forward));
        gl.uniform1i(u.uBack, bind(3, back));
        gl.uniform1f(u.uDt, dt);
        gl.uniform4f(u.uDecay, decay[0], decay[1], decay[2], decay[3]);
        draw(dye.write);
        dye.swap();
    };

    const setShade = u => {
        gl.uniform3f(u.uColor, state.color[0], state.color[1], state.color[2]);
        gl.uniform3f(u.uSecondary, state.secondary[0], state.secondary[1], state.secondary[2]);
        gl.uniform1f(u.uIntensity, settings.intensity);
        gl.uniform1f(u.uHotspot, settings.hotspot);
    };

    const render = () => {
        const { dye, bloom } = state.targets;
        if (settings.glow > 0) {
            let u = use(passes.prefilter, bloom[0].texel);
            gl.uniform1i(u.uDye, bind(0, dye.read));
            gl.uniform2f(u.uDyeTexel, dye.read.texel[0], dye.read.texel[1]);
            setShade(u);
            draw(bloom[0]);
            u = use(passes.down, bloom[0].texel);
            for (let i = 1; i < bloom.length; i++) {
                gl.uniform1i(u.uSource, bind(0, bloom[i - 1]));
                gl.uniform2f(u.uSourceTexel, bloom[i - 1].texel[0], bloom[i - 1].texel[1]);
                draw(bloom[i]);
            }
            gl.enable(gl.BLEND);
            gl.blendFunc(gl.ONE, gl.ONE);
            u = use(passes.up, bloom[0].texel);
            for (let i = bloom.length - 1; i > 0; i--) {
                gl.uniform1i(u.uSource, bind(0, bloom[i]));
                gl.uniform2f(u.uSourceTexel, bloom[i - 1].texel[0], bloom[i - 1].texel[1]);
                draw(bloom[i - 1]);
            }
            gl.disable(gl.BLEND);
        }
        const u = use(passes.display, [1 / canvas.width, 1 / canvas.height]);
        gl.uniform1i(u.uDye, bind(0, dye.read));
        gl.uniform1i(u.uBloom, bind(1, bloom[0]));
        setShade(u);
        gl.uniform1f(u.uGlow, settings.glow > 0 ? (settings.glow * 1.4) / BLOOM_LEVELS : 0);
        gl.uniform1f(u.uGrain, settings.grain);
        gl.uniform1f(u.uTime, state.time);
        gl.uniform1f(u.uLight, 0);
        draw(null);
    };

    let lastTime = 0;
    const frame = now => {
        const dt = lastTime ? Math.min(1 / 30, (now - lastTime) / 1000) : 1 / 60;
        lastTime = now;
        state.time += dt;

        allocate();
        gl.bindVertexArray(vao);
        gl.disable(gl.BLEND);

        if (state.ready) emit(dt, now);
        while (state.bursts.length) {
            const [x, y] = state.bursts.shift();
            burst(x, y, now);
        }
        step(dt);
        render();

        requestAnimationFrame(frame);
    };

    window.addEventListener('pointermove', event => {
        state.pointer.x = event.clientX;
        state.pointer.y = event.clientY;
        state.pointer.inside = true;
    }, { passive: true });

    window.addEventListener('pointerdown', event => {
        state.bursts.push([event.clientX, event.clientY]);
    }, { passive: true });

    requestAnimationFrame(frame);
})();

// ==========================================
// 6. CONTROL DEL CURSOR Y REFLECTOR SVG (PARALAJE 3D DESACTIVADO)
// ==========================================
const cursor = document.querySelector('.cursor');
const follower = document.querySelector('.cursor-follower');
const sonidoHover = document.getElementById('sonido-hover');
const orbitalSystem = document.getElementById('orbital-system');

let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;
let followerX = mouseX, followerY = mouseY;

document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    if (cursor) {
        cursor.style.left = mouseX + 'px';
        cursor.style.top = mouseY + 'px';
    }

    /* PARALAJE 3D DESACTIVADO PARA EVITAR QUE SE MUEVAN LOS NODOS */
    if (orbitalSystem) {
        orbitalSystem.style.transform = 'none';
    }
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

document.querySelectorAll('.orbital-node, .btn-hud-launch, .card, .hideBtn').forEach(node => {
    node.addEventListener('mouseenter', () => {
        if (follower) {
            follower.style.width = '60px';
            follower.style.height = '60px';
            follower.style.backgroundColor = 'rgba(255, 255, 255, 0.22)';
            follower.style.borderColor = '#ffffff';
            follower.style.boxShadow = '0 0 20px rgba(255, 255, 255, 0.8)';
        }
        if (sonidoHover) {
            sonidoHover.volume = 0.2;
            sonidoHover.currentTime = 0;
            sonidoHover.play().catch(() => {});
        }
    });

    node.addEventListener('mouseleave', () => {
        if (follower) {
            follower.style.width = '35px';
            follower.style.height = '35px';
            follower.style.backgroundColor = 'transparent';
            follower.style.borderColor = 'rgba(255, 255, 255, 0.5)';
            follower.style.boxShadow = 'none';
        }
    });
});

// Botón interactivo para ocultar el reflector de luz del título SVG
const btnHideLight = document.querySelector(".hideBtn");
if (btnHideLight) {
    btnHideLight.addEventListener('click', function() {
        const reflector = document.querySelector("#reflector");
        if (reflector) reflector.style.display = "none";
        this.style.display = "none";
    }, false);
}

// ==========================================
// 7. MOTOR WARP TEXT WEBGL CON RESPLANDOR CROMÁTICO E IRIDISCENTE
// ==========================================
(function initWarpTextEngine() {
    const container = document.getElementById('warp-title-container');
    if (!container) return;

    const fallbackText = container.querySelector('.warp-fallback-text');

    const startEngine = () => {
        if (typeof OGL === 'undefined') {
            setTimeout(startEngine, 100);
            return;
        }

        const OGLObj = window.OGL || OGL;
        const { Renderer, Program, Mesh, Triangle, Texture } = OGLObj;

        const LENS_MODES = { bulge: 0, pinch: 1, swirl: 2 };
        const INTRO_MS = 1000;
        const RIPPLE_LIFE = 1.6;
        const MAX_CLICKS = 4;

        const props = {
            text: 'MANUALIDADES & IDEAS',
            fontWeight: '900',
            fontFamily: "'Exo', sans-serif",
            warpStrength: 0.18,
            warpScale: 2.2,
            speed: 0.80,
            pointerInfluence: 0.55,
            pointerStrength: 0.85,
            refraction: 0.045,
            chromatic: 0.65,
            ripple: true,
            clickRipple: true,
            idleDrift: 0.25,
            lens: 'bulge'
        };

        const vertex = `#version 300 es
        in vec2 position;
        in vec2 uv;
        out vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = vec4(position, 0.0, 1.0);
        }`;

        const fragment = `#version 300 es
        precision highp float;
        uniform sampler2D uTextTexture;
        uniform vec2 uResolution;
        uniform vec2 uPointer;
        uniform float uPointerActive;
        uniform float uTime;
        uniform float uWarpStrength;
        uniform float uWarpScale;
        uniform float uSpeed;
        uniform float uPointerInfluence;
        uniform float uPointerStrength;
        uniform float uRefraction;
        uniform float uChromatic;
        uniform float uRipple;
        uniform float uMotion;
        uniform float uLens;
        uniform float uIntro;
        uniform float uReveal;
        uniform float uBackdrop;
        uniform vec4 uClicks[4];
        in vec2 vUv;
        out vec4 fragColor;

        float hash(vec2 p) {
          p = fract(p * vec2(123.34, 456.21));
          p += dot(p, p + 45.32);
          return fract(p.x * p.y);
        }

        float noise(vec2 p) {
          vec2 i = floor(p);
          vec2 f = fract(p);
          vec2 u = f * f * (3.0 - 2.0 * f);
          float a = hash(i);
          float b = hash(i + vec2(1.0, 0.0));
          float c = hash(i + vec2(0.0, 1.0));
          float d = hash(i + vec2(1.0, 1.0));
          return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
        }

        float fbm(vec2 p) {
          float value = 0.0;
          float amplitude = 0.5;
          for (int i = 0; i < 4; i++) {
            value += amplitude * noise(p);
            p *= 2.02;
            amplitude *= 0.5;
          }
          return value;
        }

        vec4 sampleText(vec2 uv) {
          if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) {
            return vec4(0.0);
          }
          return texture(uTextTexture, uv);
        }

        void main() {
          vec2 uv = vUv;
          float aspect = uResolution.x / max(uResolution.y, 1.0);
          float time = uTime * uSpeed;
          float scale = max(uWarpScale, 0.001);
          vec2 drift = vec2(time * 0.085, -time * 0.065);
          float n1 = fbm(uv * scale * 3.1 + drift);
          float n2 = fbm((uv + 19.17) * scale * 3.4 - drift.yx);
          vec2 ambient = (vec2(n1, n2) - 0.5) * (uWarpStrength * 0.055 * uMotion + uIntro * 0.22);
          vec2 pointerDelta = uv - uPointer;
          vec2 aspectDelta = vec2(pointerDelta.x * aspect, pointerDelta.y);
          float dist = length(aspectDelta);
          float radius = max(uPointerInfluence, 0.001);
          float t = clamp(dist / radius, 0.0, 1.0);
          float lens = smoothstep(radius, 0.0, dist) * uPointerActive;
          float bulge = t * (1.0 - t) * (1.0 - t) * 6.75 * uPointerActive;
          vec2 dir = dist > 0.0001 ? vec2(aspectDelta.x / aspect, aspectDelta.y) / dist : vec2(0.0);
          float rippleWave = sin(dist * 32.0 - time * 5.0) * 0.5 + 0.5;
          float rippleRing = (rippleWave - 0.5) * uRipple;
          vec2 pointerWarp = dir * rippleRing * bulge * uPointerStrength * 0.022;
          
          if (uLens > 1.5) {
            float twist = (1.0 - t) * (1.0 - t) * uPointerActive * uPointerStrength * 2.8;
            float s = sin(twist);
            float c = cos(twist);
            vec2 turned = vec2(aspectDelta.x * c - aspectDelta.y * s, aspectDelta.x * s + aspectDelta.y * c);
            pointerWarp += vec2(turned.x / aspect, turned.y) - pointerDelta;
          } else {
            float side = uLens > 0.5 ? -1.0 : 1.0;
            pointerWarp -= dir * side * bulge * uPointerStrength * 0.055;
          }

          vec2 shock = vec2(0.0);
          float shockLight = 0.0;
          for (int i = 0; i < 4; i++) {
            vec4 click = uClicks[i];
            if (click.w <= 0.0) continue;
            vec2 clickDelta = uv - click.xy;
            vec2 clickAspect = vec2(clickDelta.x * aspect, clickDelta.y);
            float clickDist = length(clickAspect);
            float age = click.z;
            float offset = (clickDist - age * 0.9) / (0.06 + age * 0.06);
            float fade = 1.0 - smoothstep(0.0, 1.6, age);
            float energy = exp(-offset * offset) * fade * smoothstep(0.0, 0.08, age) * click.w;
            vec2 clickDir = clickDist > 0.0001 ? vec2(clickAspect.x / aspect, clickAspect.y) / clickDist : vec2(0.0);
            shock -= clickDir * offset * energy * 0.12;
            shockLight += energy;
          }

          vec2 bend = pointerWarp + shock;
          vec2 rest = uv + ambient;
          vec2 splitDir = ambient + bend;
          float splitLen = length(splitDir);
          splitDir = splitLen > 0.00001 ? splitDir / splitLen : vec2(0.7071, 0.7071);
          vec2 split = splitDir * uRefraction * 0.22 * (0.4 + lens * 2.1 + uIntro * 3.5);
          float dispersion = uChromatic * 0.8;

          vec3 ink = vec3(0.0);
          vec3 cover = vec3(0.0);
          vec3 weight = vec3(0.0);

          for (int i = 0; i < 7; i++) {
            float k = 1.0 - float(i) / 3.0;
            vec4 tap = sampleText(rest + bend * (1.0 + dispersion * k) + split * k);
            vec3 band = vec3(max(k, 0.0), 1.0 - abs(k), max(-k, 0.0));
            ink += tap.rgb * band;
            cover += tap.a * band;
            weight += band;
          }

          ink /= weight;
          cover /= weight;
          float a = max(max(cover.r, cover.g), cover.b);

          // EFECTO IRIDISCENTE CROMÁTICO (NARANJA / MAGENTA / CIAN / DORADO)
          vec3 irid = vec3(
            0.5 + 0.5 * cos(uv.x * 8.0 + time * 3.0),
            0.5 + 0.5 * cos(uv.y * 6.0 + time * 2.5 + 2.094),
            0.5 + 0.5 * cos((uv.x + uv.y) * 7.0 + time * 3.5 + 4.188)
          );

          vec3 warmFlare = mix(vec3(1.0, 0.35, 0.05), vec3(1.0, 0.0, 0.55), sin(uv.x * 5.0 + time * 2.0) * 0.5 + 0.5);
          vec3 holoColor = mix(warmFlare, irid, 0.35);

          vec3 color = ink;
          // Aplicar destello iridiscente enriquecido
          color = mix(color, color * holoColor * 2.2 + warmFlare * (lens * 0.55 + shockLight * 0.9), cover.g * 0.75);

          fragColor = vec4(color, a) * uReveal;
        }`;

        function buildTextCanvas(width, height, dpr) {
            const canvas = document.createElement('canvas');
            canvas.width = Math.max(1, Math.floor(width * dpr));
            canvas.height = Math.max(1, Math.floor(height * dpr));
            const ctx = canvas.getContext('2d');
            if (!ctx) return { canvas };

            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            ctx.clearRect(0, 0, width, height);
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            let fontPx = Math.min(width * 0.045, 38);
            if (fontPx < 20) fontPx = 20;
            ctx.font = `900 ${fontPx}px ${props.fontFamily}`;

            // Gradient neón holográfico
            const grad = ctx.createLinearGradient(0, 0, width, height);
            grad.addColorStop(0.0, '#1A1C1E');
            grad.addColorStop(0.2, '#00f0ff');
            grad.addColorStop(0.45, '#C0C2C5');
            grad.addColorStop(0.7, '#C0C2C5');
            grad.addColorStop(0.85, '#BDB2FF');
            grad.addColorStop(1.0, '#ffffff');

            // Capa 1: Sombra neón fuego profunda
            ctx.shadowColor = 'rgb(192,194,197)';
            ctx.shadowBlur = 24;
            ctx.fillStyle = grad;
            ctx.fillText(props.text, width / 2, height / 2);

            // Capa 2: Resplandor magenta neón
            ctx.shadowColor = 'rgb(255,255,255)';
            ctx.shadowBlur = 14;
            ctx.fillText(props.text, width / 2, height / 2);

            return { canvas };
        }

        let renderer, gl, program, geometry, mesh, texture;
        const clicks = Array.from({ length: MAX_CLICKS }, () => [0.5, 0.5, 0, 0]);
        let clickSlot = 0;
        const pointer = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5, active: 0, activeTarget: 0 };
        const startTime = performance.now();
        let textReady = false;
        let introProgress = 0;
        let lastFrame = 0;

        try {
            renderer = new Renderer({
                webgl: 2,
                alpha: true,
                premultipliedAlpha: true,
                antialias: true,
                dpr: Math.min(window.devicePixelRatio || 1, 2)
            });
            gl = renderer.gl;
        } catch (e) {
            console.warn('WarpText WebGL error:', e);
            if (fallbackText) fallbackText.style.opacity = '1';
            return;
        }

        gl.clearColor(0, 0, 0, 0);
        const canvas = gl.canvas;
        canvas.style.position = 'absolute';
        canvas.style.inset = '0';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.display = 'block';
        canvas.style.zIndex = '10';
        canvas.style.pointerEvents = 'auto';
        container.appendChild(canvas);

        texture = new Texture(gl, {
            generateMipmaps: false,
            premultiplyAlpha: true,
            minFilter: gl.LINEAR,
            magFilter: gl.LINEAR,
            wrapS: gl.CLAMP_TO_EDGE,
            wrapT: gl.CLAMP_TO_EDGE
        });

        geometry = new Triangle(gl);
        program = new Program(gl, {
            vertex,
            fragment,
            transparent: true,
            depthTest: false,
            depthWrite: false,
            uniforms: {
                uTextTexture: { value: texture },
                uResolution: { value: new Float32Array([1, 1]) },
                uPointer: { value: new Float32Array([0.5, 0.5]) },
                uPointerActive: { value: 0 },
                uTime: { value: 0 },
                uWarpStrength: { value: props.warpStrength },
                uWarpScale: { value: props.warpScale },
                uSpeed: { value: props.speed },
                uPointerInfluence: { value: props.pointerInfluence },
                uPointerStrength: { value: props.pointerStrength },
                uRefraction: { value: props.refraction },
                uChromatic: { value: props.chromatic },
                uRipple: { value: props.ripple ? 1 : 0 },
                uMotion: { value: 1 },
                uLens: { value: LENS_MODES[props.lens] ?? 0 },
                uIntro: { value: 0 },
                uReveal: { value: 1.0 },
                uBackdrop: { value: 0 },
                uClicks: { value: clicks }
            }
        });

        mesh = new Mesh(gl, { geometry, program });

        function rasterize() {
            let width = container.clientWidth || 800;
            let height = container.clientHeight || 65;

            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            const raster = buildTextCanvas(width, height, dpr);
            texture.image = raster.canvas;
            texture.needsUpdate = true;
            textReady = true;

            if (fallbackText) fallbackText.style.opacity = '0';
        }

        function resize() {
            let width = container.clientWidth || 800;
            let height = container.clientHeight || 65;

            renderer.dpr = Math.min(window.devicePixelRatio || 1, 2);
            renderer.setSize(width, height);
            program.uniforms.uResolution.value[0] = gl.drawingBufferWidth;
            program.uniforms.uResolution.value[1] = gl.drawingBufferHeight;
            rasterize();
        }

        window.addEventListener('resize', resize);

        canvas.addEventListener('pointermove', (e) => {
            const rect = canvas.getBoundingClientRect();
            pointer.tx = (e.clientX - rect.left) / rect.width;
            pointer.ty = 1 - (e.clientY - rect.top) / rect.height;
            pointer.activeTarget = 1;
        });

        canvas.addEventListener('pointerleave', () => {
            pointer.activeTarget = 0;
        });

        canvas.addEventListener('pointerdown', (e) => {
            if (!props.clickRipple) return;
            const rect = canvas.getBoundingClientRect();
            const click = clicks[clickSlot];
            clickSlot = (clickSlot + 1) % clicks.length;
            click[0] = (e.clientX - rect.left) / rect.width;
            click[1] = 1 - (e.clientY - rect.top) / rect.height;
            click[2] = 0;
            click[3] = 1;
        });

        function loop(now) {
            const elapsed = (now - startTime) * 0.001;
            const delta = lastFrame ? Math.min(now - lastFrame, 50) : 16;
            lastFrame = now;

            if (textReady && introProgress < 1) {
                introProgress = Math.min(1, introProgress + delta / INTRO_MS);
            }
            const settle = 1 - introProgress;

            const engaged = pointer.activeTarget > 0;
            const idleX = 0.5 + Math.sin(elapsed * 0.33) * (0.08 + props.idleDrift * 0.2);
            const idleY = 0.5 + Math.cos(elapsed * 0.27) * (0.06 + props.idleDrift * 0.2);
            const follow = 1 - Math.exp(-delta / (engaged ? 130 : 470));

            pointer.x += ((engaged ? pointer.tx : idleX) - pointer.x) * follow;
            pointer.y += ((engaged ? pointer.ty : idleY) - pointer.y) * follow;
            pointer.active += ((engaged ? 1 : props.idleDrift) - pointer.active) * (1 - Math.exp(-delta / 270));

            clicks.forEach(click => {
                if (click[3] <= 0) return;
                click[2] += delta / 1000;
                if (click[2] > RIPPLE_LIFE) click[3] = 0;
            });

            program.uniforms.uPointer.value[0] = pointer.x;
            program.uniforms.uPointer.value[1] = pointer.y;
            program.uniforms.uPointerActive.value = pointer.active;
            program.uniforms.uTime.value = elapsed;
            program.uniforms.uIntro.value = settle * settle * settle;
            program.uniforms.uReveal.value = 1.0;

            renderer.render({ scene: mesh });
            requestAnimationFrame(loop);
        }

        resize();
        requestAnimationFrame(loop);

        setTimeout(resize, 600);
        setTimeout(resize, 1500);
    };

    startEngine();
})();