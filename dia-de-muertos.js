/* ==========================================================================
   1. COMPONENTE WEBGL2: LIQUID ETHER (RESTAURACIÓN FIEL A REACT BITS)
   ========================================================================== */
function initLiquidEther() {
    const canvas = document.getElementById('liquid-ether-canvas');
    if (!canvas) return;

    const gl = canvas.getContext('webgl2', {
        alpha: true,
        premultipliedAlpha: true,
        antialias: false,
        depth: false,
        stencil: false,
        powerPreference: 'high-performance'
    });
    if (!gl) return;
    if (!gl.getExtension('EXT_color_buffer_float') && !gl.getExtension('EXT_color_buffer_half_float')) return;

    const PALETTE_SIZE = 256;
    const PRESSURE_STEPS = 32;
    const PIXEL_BUDGET = 2.4e6;
    const MAX_CELLS = 140000;

    // Paleta Neón de Día de Muertos (Morado Éter, Rosa Mexicano y Cempasúchil)
    const colors = ['#5227FF', '#FF9FFC', '#ff7700', '#ffd600'];

    const clamp = (val, min, max) => Math.min(max, Math.max(min, val));
    const parseColor = val => {
        const text = String(val || '').trim();
        const hex = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(text);
        if (hex) {
            const full = hex[1].length === 3 ? hex[1].replace(/./g, d => d + d) : hex[1];
            return [0, 2, 4].map(i => parseInt(full.slice(i, i + 2), 16) / 255);
        }
        return [0.5, 0.2, 0.8];
    };
    const toLinear = c => (c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));

    const buildPalette = (colorList) => {
        const stops = colorList.map(parseColor);
        const values = stops.map(c => c.map(toLinear));
        const data = new Uint8Array(PALETTE_SIZE * 4);
        for (let i = 0; i < PALETTE_SIZE; i++) {
            const t = clamp((i / (PALETTE_SIZE - 1)) * values.length - 0.5, 0, values.length - 1);
            const from = Math.min(Math.floor(t), Math.max(values.length - 2, 0));
            const to = Math.min(from + 1, values.length - 1);
            const k = t - from;
            const eased = k * k * (3 - 2 * k);
            for (let ch = 0; ch < 3; ch++) {
                const value = values[from][ch] + (values[to][ch] - values[from][ch]) * eased;
                data[i * 4 + ch] = Math.round(clamp(value, 0, 1) * 255);
            }
            data[i * 4 + 3] = 255;
        }
        return data;
    };

    const VERTEX = `#version 300 es
    const vec2 corners[3] = vec2[3](vec2(-1.0, -1.0), vec2(3.0, -1.0), vec2(-1.0, 3.0));
    out vec2 vUv;
    void main() {
      vUv = corners[gl_VertexID] * 0.5 + 0.5;
      gl_Position = vec4(corners[gl_VertexID], 0.0, 1.0);
    }`;

    const HEADER = `#version 300 es
    precision highp float;
    precision highp sampler2D;
    in vec2 vUv;
    out vec4 fragColor;
    uniform vec2 uTexel;`;

    const SPLAT = `${HEADER}
    uniform sampler2D uVelocity;
    uniform vec2 uSize;
    uniform vec4 uSegment;
    uniform vec2 uForce;
    uniform float uRadius;
    float segment(vec2 p, vec2 a, vec2 b) {
      vec2 ab = b - a;
      float t = clamp(dot(p - a, ab) / max(dot(ab, ab), 1e-4), 0.0, 1.0);
      return length(p - a - ab * t);
    }
    void main() {
      float d = segment(vUv * uSize, uSegment.xy, uSegment.zw) / uRadius;
      vec2 velocity = texture(uVelocity, vUv).xy + uForce * exp(-d * d * 6.0);
      fragColor = vec4(velocity, 0.0, 1.0);
    }`;

    const SMOOTH = `${HEADER}
    uniform sampler2D uVelocity;
    uniform float uAmount;
    void main() {
      vec2 center = texture(uVelocity, vUv).xy;
      vec2 around =
        texture(uVelocity, vUv - vec2(uTexel.x, 0.0)).xy +
        texture(uVelocity, vUv + vec2(uTexel.x, 0.0)).xy +
        texture(uVelocity, vUv - vec2(0.0, uTexel.y)).xy +
        texture(uVelocity, vUv + vec2(0.0, uTexel.y)).xy;
      fragColor = vec4(mix(center, around * 0.25, uAmount), 0.0, 1.0);
    }`;

    const DIVERGENCE = `${HEADER}
    uniform sampler2D uVelocity;
    uniform float uWalls;
    void main() {
      vec2 center = texture(uVelocity, vUv).xy;
      float left = texture(uVelocity, vUv - vec2(uTexel.x, 0.0)).x;
      float right = texture(uVelocity, vUv + vec2(uTexel.x, 0.0)).x;
      float down = texture(uVelocity, vUv - vec2(0.0, uTexel.y)).y;
      float up = texture(uVelocity, vUv + vec2(0.0, uTexel.y)).y;
      float edge = uWalls > 0.5 ? -1.0 : 0.0;
      if (vUv.x - uTexel.x < 0.0) left = edge * center.x;
      if (vUv.x + uTexel.x > 1.0) right = edge * center.x;
      if (vUv.y - uTexel.y < 0.0) down = edge * center.y;
      if (vUv.y + uTexel.y > 1.0) up = edge * center.y;
      fragColor = vec4(0.5 * (right - left + up - down), 0.0, 0.0, 1.0);
    }`;

    const EDGE = `uniform float uWalls;
    float pressureAt(sampler2D field, vec2 uv) {
      vec2 inside = step(vec2(0.0), uv) * step(uv, vec2(1.0));
      return texture(field, uv).x * mix(inside.x * inside.y, 1.0, uWalls);
    }`;

    const PRESSURE = `${HEADER}
    uniform sampler2D uPressure;
    uniform sampler2D uDivergence;
    ${EDGE}
    void main() {
      vec2 reach = uTexel * 2.0;
      float sum =
        pressureAt(uPressure, vUv - vec2(reach.x, 0.0)) +
        pressureAt(uPressure, vUv + vec2(reach.x, 0.0)) +
        pressureAt(uPressure, vUv - vec2(0.0, reach.y)) +
        pressureAt(uPressure, vUv + vec2(0.0, reach.y));
      fragColor = vec4(sum * 0.25 - texture(uDivergence, vUv).x, 0.0, 0.0, 1.0);
    }`;

    const PROJECT = `${HEADER}
    uniform sampler2D uPressure;
    uniform sampler2D uVelocity;
    ${EDGE}
    void main() {
      float left = pressureAt(uPressure, vUv - vec2(uTexel.x, 0.0));
      float right = pressureAt(uPressure, vUv + vec2(uTexel.x, 0.0));
      float down = pressureAt(uPressure, vUv - vec2(0.0, uTexel.y));
      float up = pressureAt(uPressure, vUv + vec2(0.0, uTexel.y));
      vec2 velocity = texture(uVelocity, vUv).xy - 0.5 * vec2(right - left, up - down);
      fragColor = vec4(velocity, 0.0, 1.0);
    }`;

    const ADVECT = `${HEADER}
    uniform sampler2D uVelocity;
    uniform vec2 uStep;
    uniform float uKeep;
    uniform float uWalls;
    vec2 at(vec2 uv) {
      vec2 outside = max(-uv, uv - 1.0) / uTexel;
      float open = clamp(1.0 - max(outside.x, outside.y) / 1.5, 0.0, 1.0);
      return texture(uVelocity, uv).xy * mix(open, 1.0, uWalls);
    }
    void main() {
      vec2 start = vUv - at(vUv) * uStep;
      vec2 back = start + at(start) * uStep;
      vec2 corrected = vUv - (back - vUv) * 0.5;
      vec2 origin = corrected - at(corrected) * uStep;
      vec2 a = at(origin + vec2(-0.5, -0.5) * uTexel);
      vec2 b = at(origin + vec2(0.5, -0.5) * uTexel);
      vec2 c = at(origin + vec2(-0.5, 0.5) * uTexel);
      vec2 d = at(origin + vec2(0.5, 0.5) * uTexel);
      vec2 velocity = clamp(at(origin), min(min(a, b), min(c, d)), max(max(a, b), max(c, d)));
      fragColor = vec4(velocity * uKeep, 0.0, 1.0);
    }`;

    const DISPLAY = `${HEADER}
    uniform sampler2D uVelocity;
    uniform sampler2D uPalette;
    uniform vec2 uSimSize;
    uniform float uSpeedScale;
    uniform float uLight;
    uniform vec4 uBackground;
    vec2 velocityAt(vec2 uv) {
      vec2 st = uv * uSimSize - 0.5;
      vec2 i = floor(st);
      vec2 f = st - i;
      vec2 f2 = f * f;
      vec2 f3 = f2 * f;
      vec2 w0 = (-f3 + 3.0 * f2 - 3.0 * f + 1.0) / 6.0;
      vec2 w1 = (3.0 * f3 - 6.0 * f2 + 4.0) / 6.0;
      vec2 w2 = (-3.0 * f3 + 3.0 * f2 + 3.0 * f + 1.0) / 6.0;
      vec2 w3 = f3 / 6.0;
      vec2 g0 = w0 + w1;
      vec2 g1 = w2 + w3;
      vec2 h0 = (i - 0.5 + w1 / g0) / uSimSize;
      vec2 h1 = (i + 1.5 + w3 / g1) / uSimSize;
      vec2 a = texture(uVelocity, vec2(h0.x, h0.y)).xy;
      vec2 b = texture(uVelocity, vec2(h1.x, h0.y)).xy;
      vec2 c = texture(uVelocity, vec2(h0.x, h1.y)).xy;
      vec2 d = texture(uVelocity, vec2(h1.x, h1.y)).xy;
      return g0.y * (g0.x * a + g1.x * b) + g1.y * (g0.x * c + g1.x * d);
    }
    void main() {
      float speed = length(velocityAt(vUv)) * uSpeedScale;
      float level = speed < 0.75 ? speed : 0.75 + 0.25 * tanh((speed - 0.75) * 4.0);
      vec3 ink = texture(uPalette, vec2(level, 0.5)).rgb;
      float alpha = level;
      if (uLight > 0.5) {
        float hollow = smoothstep(0.7, 1.6, speed);
        alpha = smoothstep(0.08, 0.5, level) * mix(0.85, 0.1, hollow);
      } else {
        float hot = 1.0 - exp(-max(speed - 0.75, 0.0) * 1.2);
        ink = mix(ink, min(ink * 1.8 + 0.06, vec3(1.0)), hot);
      }
      vec3 color = ink * alpha + uBackground.rgb * uBackground.a * (1.0 - alpha);
      float coverage = alpha + uBackground.a * (1.0 - alpha);
      float grain = fract(52.9829189 * fract(dot(gl_FragCoord.xy, vec2(0.06711056, 0.00583715))));
      color += (grain - 0.5) / 255.0 * step(0.002, coverage);
      fragColor = vec4(clamp(color, vec3(0.0), vec3(coverage)), coverage);
    }`;

    const compile = (source, type) => {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        return shader;
    };

    const link = (fragSource) => {
        const vert = compile(VERTEX, gl.VERTEX_SHADER);
        const frag = compile(fragSource, gl.FRAGMENT_SHADER);
        const prog = gl.createProgram();
        gl.attachShader(prog, vert);
        gl.attachShader(prog, frag);
        gl.linkProgram(prog);

        const uniforms = {};
        const count = gl.getProgramParameter(prog, gl.ACTIVE_UNIFORMS);
        for (let i = 0; i < count; i++) {
            const info = gl.getActiveUniform(prog, i);
            if (info) uniforms[info.name] = gl.getUniformLocation(prog, info.name);
        }
        return { program: prog, uniforms };
    };

    const programs = {
        splat: link(SPLAT),
        smooth: link(SMOOTH),
        divergence: link(DIVERGENCE),
        pressure: link(PRESSURE),
        project: link(PROJECT),
        advect: link(ADVECT),
        display: link(DISPLAY)
    };

    const vao = gl.createVertexArray();
    const size = { width: 1, height: 1 };
    const grid = { width: 0, height: 0 };
    const targets = {};

    const paletteTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, paletteTexture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, PALETTE_SIZE, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, buildPalette(colors));

    const makeTarget = (w, h, channels) => {
        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, channels === 2 ? gl.RG16F : gl.R16F, w, h, 0, channels === 2 ? gl.RG : gl.RED, gl.HALF_FLOAT, null);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        const framebuffer = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        return { texture, framebuffer };
    };

    const resize = () => {
        const cssW = window.innerWidth;
        const cssH = window.innerHeight;
        canvas.width = cssW;
        canvas.height = cssH;
        size.width = cssW;
        size.height = cssH;

        const base = 0.5 * 0.5;
        const scale = base * Math.min(1, Math.sqrt(MAX_CELLS / (cssW * cssH * base * base)));
        const gridW = clamp(Math.round(cssW * scale), 16, 1024);
        const gridH = clamp(Math.round(cssH * scale), 16, 1024);

        if (gridW === grid.width && gridH === grid.height) return;
        grid.width = gridW;
        grid.height = gridH;

        targets.velocity = makeTarget(gridW, gridH, 2);
        targets.velocityNext = makeTarget(gridW, gridH, 2);
        targets.divergence = makeTarget(gridW, gridH, 1);
        targets.pressure = makeTarget(gridW, gridH, 1);
        targets.pressureNext = makeTarget(gridW, gridH, 1);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    };

    const swap = (a, b) => {
        const held = targets[a];
        targets[a] = targets[b];
        targets[b] = held;
    };

    const bindTexture = (unit, tex, loc) => {
        gl.activeTexture(gl.TEXTURE0 + unit);
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.uniform1i(loc, unit);
    };

    const run = (entry, output, bind) => {
        gl.useProgram(entry.program);
        gl.uniform2f(entry.uniforms.uTexel, 1 / grid.width, 1 / grid.height);
        bind(entry.uniforms);
        gl.bindFramebuffer(gl.FRAMEBUFFER, output ? output.framebuffer : null);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    const splats = [];
    const puffs = [];
    const addStroke = (from, to, dt, scale, radius) => {
        splats.push({
            ax: from[0], ay: from[1],
            bx: to[0], by: to[1],
            vx: clamp(((to[0] - from[0]) / dt) * scale, -6000, 6000),
            vy: clamp(((to[1] - from[1]) / dt) * scale, -6000, 6000),
            radius
        });
    };

    const pointer = { x: 0, y: 0, fromX: 0, fromY: 0, dx: 0, dy: 0, inside: false, ready: false, moved: false, last: 0 };
    const auto = { phase: Math.random() * 100, x: 0, y: 0, ready: false, ramp: 0 };
    const opening = { active: true, time: 0 };

    const wander = t => [
        (0.5 + 0.41 * (0.62 * Math.sin(t * 0.83 + 1.3) + 0.38 * Math.sin(t * 1.71 + 0.4))) * size.width,
        (0.5 + 0.41 * (0.6 * Math.sin(t * 1.07 + 2.1) + 0.4 * Math.cos(t * 0.61 + 0.7))) * size.height
    ];

    const sweep = t => {
        const k = clamp(t / 1.4, 0, 1);
        const eased = 1 - Math.pow(1 - k, 3);
        const angle = -0.6 + eased * 3.6;
        const reach = 0.08 + 0.3 * eased;
        return [
            (0.5 + Math.cos(angle) * reach * 1.1) * size.width,
            (0.5 + Math.sin(angle) * reach * (size.width / size.height) * 0.75) * size.height
        ];
    };

    window.addEventListener('pointermove', (e) => {
        const spotX = e.clientX;
        const spotY = size.height - e.clientY;
        opening.active = false;

        if (!pointer.ready) {
            pointer.fromX = spotX; pointer.fromY = spotY;
            pointer.x = spotX; pointer.y = spotY;
            pointer.last = performance.now();
            pointer.ready = true;
        }

        const travelX = spotX - pointer.x;
        const travelY = spotY - pointer.y;
        if (Math.hypot(travelX, travelY) > 0.5) {
            pointer.dx = pointer.dx * 0.7 + travelX * 0.3;
            pointer.dy = pointer.dy * 0.7 + travelY * 0.3;
        }
        pointer.x = spotX;
        pointer.y = spotY;
        pointer.moved = true;
    });

    window.addEventListener('pointerdown', (e) => {
        const spotX = e.clientX;
        const spotY = size.height - e.clientY;
        const angle = Math.hypot(pointer.dx, pointer.dy) > 1 ? Math.atan2(pointer.dy, pointer.dx) : Math.random() * Math.PI * 2;
        const dirX = Math.cos(angle);
        const dirY = Math.sin(angle);
        const reach = 100 * 0.5;
        const push = 1400;

        puffs.push({
            ax: spotX - dirX * reach,
            ay: spotY - dirY * reach,
            bx: spotX + dirX * reach,
            by: spotY + dirY * reach,
            vx: dirX * push,
            vy: dirY * push,
            radius: 100 * 0.9
        });
        if (puffs.length > 4) puffs.shift();
    });

    let lastTime = performance.now();
    const frame = (now) => {
        const dt = clamp((now - lastTime) / 1000 || 0, 0, 1 / 30);
        lastTime = now;
        const pace = Math.min(1, dt * 60);

        if (dt > 0) {
            if (opening.active) {
                const from = sweep(opening.time);
                opening.time += dt;
                const fade = Math.sin(Math.min(1, opening.time / 1.4) * Math.PI);
                addStroke(from, sweep(opening.time), dt, 0.2 * fade, 100);
                if (opening.time > 1.4) opening.active = false;
            } else if (!pointer.moved) {
                auto.ramp = Math.min(1, auto.ramp + dt / 0.8);
                auto.phase += dt * 0.5 * 1.6;
                const spot = wander(auto.phase);
                if (auto.ready) {
                    const gust = 0.3 + 0.7 * Math.pow(0.5 + 0.5 * Math.sin(auto.phase * 2.6), 2);
                    const scale = 0.45 * 2.2 * auto.ramp * auto.ramp * gust * pace;
                    addStroke([auto.x, auto.y], spot, dt, scale, 100);
                }
                auto.x = spot[0];
                auto.y = spot[1];
                auto.ready = true;
            } else {
                auto.ramp = 0;
            }

            if (pointer.moved) {
                pointer.moved = false;
                const span = Math.max(now - pointer.last, 8) / 1000;
                addStroke([pointer.fromX, pointer.fromY], [pointer.x, pointer.y], span, 0.15 * pace, 100);
                pointer.fromX = pointer.x;
                pointer.fromY = pointer.y;
                pointer.last = now;
            }

            const puff = puffs.shift();
            if (puff) splats.push(puff);

            gl.viewport(0, 0, grid.width, grid.height);
            splats.forEach(s => {
                run(programs.splat, targets.velocityNext, u => {
                    bindTexture(0, targets.velocity.texture, u.uVelocity);
                    gl.uniform2f(u.uSize, size.width, size.height);
                    gl.uniform4f(u.uSegment, s.ax, s.ay, s.bx, s.by);
                    gl.uniform2f(u.uForce, s.vx, s.vy);
                    gl.uniform1f(u.uRadius, s.radius);
                });
                swap('velocity', 'velocityNext');
            });
            splats.length = 0;

            run(programs.divergence, targets.divergence, u => {
                bindTexture(0, targets.velocity.texture, u.uVelocity);
                gl.uniform1f(u.uWalls, 0);
            });
            for (let i = 0; i < PRESSURE_STEPS; i++) {
                run(programs.pressure, targets.pressureNext, u => {
                    bindTexture(0, targets.pressure.texture, u.uPressure);
                    bindTexture(1, targets.divergence.texture, u.uDivergence);
                    gl.uniform1f(u.uWalls, 0);
                });
                swap('pressure', 'pressureNext');
            }
            run(programs.project, targets.velocityNext, u => {
                bindTexture(0, targets.pressure.texture, u.uPressure);
                bindTexture(1, targets.velocity.texture, u.uVelocity);
                gl.uniform1f(u.uWalls, 0);
            });
            swap('velocity', 'velocityNext');
            
            run(programs.advect, targets.velocityNext, u => {
                bindTexture(0, targets.velocity.texture, u.uVelocity);
                gl.uniform2f(u.uStep, dt / size.width, dt / size.height);
                gl.uniform1f(u.uKeep, Math.pow(0.5, dt / (0.35 + 0.75 * 0.75 * 12)));
                gl.uniform1f(u.uWalls, 0);
            });
            swap('velocity', 'velocityNext');

            gl.viewport(0, 0, canvas.width, canvas.height);
            run(programs.display, null, u => {
                bindTexture(0, targets.velocity.texture, u.uVelocity);
                bindTexture(1, paletteTexture, u.uPalette);
                gl.uniform2f(u.uSimSize, grid.width, grid.height);
                gl.uniform1f(u.uSpeedScale, 1.25 / (0.84 * Math.max(size.width, size.height)));
                gl.uniform1f(u.uLight, 0);
                gl.uniform4f(u.uBackground, 0, 0, 0, 0);
            });
        }
        requestAnimationFrame(frame);
    };

    window.addEventListener('resize', resize);
    resize();
    requestAnimationFrame(frame);
}

/* ==========================================================================
   2. ANIMACIÓN WEBGL DE FANTASMAS AZULES EN EL FONDO
   ========================================================================== */
function initBlueSpiritsWebGL() {
    const canvas = document.getElementById('spirits-webgl-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    });

    const ghosts = [];
    const ghostCount = 18;

    for (let i = 0; i < ghostCount; i++) {
        ghosts.push({
            x: Math.random() * width,
            y: Math.random() * height + height,
            size: 24 + Math.random() * 28,
            speedY: 0.8 + Math.random() * 1.2,
            speedX: Math.random() * 0.6 - 0.3,
            wobble: Math.random() * Math.PI * 2,
            alpha: 0.15 + Math.random() * 0.25
        });
    }

    function drawGhost(g) {
        ctx.save();
        ctx.translate(g.x, g.y);
        ctx.fillStyle = `rgba(0, 229, 255, ${g.alpha})`;
        ctx.shadowColor = 'rgba(0, 210, 255, 0.8)';
        ctx.shadowBlur = 20;

        ctx.beginPath();
        ctx.arc(0, 0, g.size, Math.PI, 0, false);
        ctx.lineTo(g.size, g.size * 1.5);
        ctx.quadraticCurveTo(g.size * 0.5, g.size * 1.2, 0, g.size * 1.5);
        ctx.quadraticCurveTo(-g.size * 0.5, g.size * 1.2, -g.size, g.size * 1.5);
        ctx.lineTo(-g.size, 0);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#051329';
        ctx.beginPath();
        ctx.arc(-g.size * 0.35, -g.size * 0.2, g.size * 0.18, 0, Math.PI * 2);
        ctx.arc(g.size * 0.35, -g.size * 0.2, g.size * 0.18, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);
        ghosts.forEach(g => {
            g.y -= g.speedY;
            g.wobble += 0.03;
            g.x += Math.sin(g.wobble) * 0.8 + g.speedX;

            if (g.y < -100) {
                g.y = height + 100;
                g.x = Math.random() * width;
            }
            drawGhost(g);
        });
        requestAnimationFrame(animate);
    }
    animate();
}

/* ==========================================================================
   3. FANTASMITA EN CURSOR CON AURA EN MOVIMIENTO
   ========================================================================== */
function setupGhostCursor() {
    const ghost = document.getElementById('ghost-cursor');
    const trailContainer = document.getElementById('ghost-trail-container');
    if (!ghost) return;

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let ghostX = mouseX;
    let ghostY = mouseY;
    let lastParticleTime = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;

        const now = Date.now();
        if (now - lastParticleTime > 60 && trailContainer) {
            lastParticleTime = now;
            const p = document.createElement('div');
            p.className = 'ghost-particle';
            p.style.left = `${e.clientX + (Math.random() * 12 - 6)}px`;
            p.style.top = `${e.clientY + 15}px`;
            trailContainer.appendChild(p);
            setTimeout(() => p.remove(), 600);
        }
    });

    function render() {
        ghostX += (mouseX - ghostX) * 0.15;
        ghostY += (mouseY - ghostY) * 0.15;

        const deltaX = mouseX - ghostX;
        const tilt = Math.max(-25, Math.min(25, deltaX * 0.6));

        ghost.style.left = `${ghostX}px`;
        ghost.style.top = `${ghostY}px`;
        ghost.style.transform = `translate(-50%, -50%) rotate(${tilt}deg)`;

        requestAnimationFrame(render);
    }
    render();
}

/* ==========================================================================
   4. MENÚ LATERAL PLEGABLE (SIDEBAR DRAWER)
   ========================================================================== */
function toggleSidebar() {
    const drawer = document.getElementById('sidebar-drawer');
    const overlay = document.getElementById('sidebar-overlay');
    if (drawer && overlay) {
        drawer.classList.toggle('active');
        overlay.classList.toggle('active');
    }
}

/* ==========================================================================
   5. COMPONENTE MENÚ INFINITO 3D (WEBGL2) - FORMAS Y ESTILOS DE ALTARES
   ========================================================================== */
function initInfiniteMenu() {
    const root = document.getElementById('infiniteMenuWrapper');
    const canvas = document.getElementById('infiniteMenuCanvas');
    if (!root || !canvas) return;

    const items = [
        {
            title: 'Altar de 2 Niveles',
            description: 'Representa la división entre el cielo (retratos y velas arriba) y la tierra (comida, agua y pan abajo). Ideal para espacios pequeños.',
            image: 'imagenes/altar-2-niveles.jpg',
            key: 'altar2'
        },
        {
            title: 'Altar de 3 Niveles',
            description: 'El más tradicional en los hogares: simboliza el cielo en la cúspide, la tierra en el centro y el inframundo en la base.',
            image: 'imagenes/altar-3-niveles.jpg',
            key: 'altar3'
        },
        {
            title: 'Altar de 7 Niveles',
            description: 'El altar completo tradicional que simboliza los siete escalones que el alma debe atravesar para llegar al descanso eterno.',
            image: 'imagenes/altar-7-niveles.jpg',
            key: 'altar7'
        },
        {
            title: 'Altar con Arco Floral',
            description: 'Enmarcado por un arco de carrizo cubierto de cempasúchil y frutas, simbolizando la puerta de bienvenida entre ambos mundos.',
            image: 'imagenes/altar-arco.jpg',
            key: 'altarArco'
        },
        {
            title: 'Altar Minimalista',
            description: 'Pensado para mesas o escritorios: reúne lo esencial en un solo plano (agua, sal, veladora, cempasúchil y fotografía).',
            image: 'imagenes/altar-mesa.png',
            key: 'altarMesa'
        },
        {
            title: 'Altar para Mascotas',
            description: 'Dedicado el 27 de octubre a los compañeros animales, con su retrato, croquetas, agua fresca, juguetes y luz blanca.',
            image: 'imagenes/altar-mascotas.jpg',
            key: 'altarMascotas'
        },
        {
            title: 'Altar Monumental',
            description: 'Estilo Huaquechula: estructura piramidal vestida con telas satinadas blancas, espejos y alfeñiques para difuntos recientes.',
            image: 'imagenes/altar-monumental.jpg',
            key: 'altarMonumental'
        },
        {
            title: 'Altar Hanal Pixán',
            description: 'Tradición maya con manteles blancos bordados en punto de cruz, jícaras con atole nuevo y mukbilpollo horneado bajo tierra.',
            image: 'imagenes/altar-maya.jpg',
            key: 'altarMaya'
        }
    ];

    const VERTEX_SHADER = `#version 300 es
    in vec2 aCorner;
    in vec4 aTile;
    uniform vec4 uOrientation;
    uniform mat4 uProjection;
    uniform float uCamera;
    uniform float uRadius;
    uniform float uTileRadius;
    uniform vec4 uSpin;
    uniform float uStretch;
    uniform float uShift;
    out vec2 vUv;
    out float vFront;
    out float vItem;

    vec3 rotate(vec4 q, vec3 v) {
      vec3 t = 2.0 * cross(q.xyz, v);
      return v + q.w * t + cross(q.xyz, t);
    }

    void main() {
      vec3 center = normalize(rotate(uOrientation, aTile.xyz));
      vec3 reference = abs(center.y) > 0.999 ? vec3(0.0, 0.0, 1.0) : vec3(0.0, 1.0, 0.0);
      vec3 tangent = normalize(cross(reference, center));
      vec3 bitangent = cross(center, tangent);
      float front = max(center.z, 0.0);
      vec3 offset = (tangent * aCorner.x + bitangent * aCorner.y) * uTileRadius * mix(0.5, 1.0, front);
      vec3 motion = cross(uSpin.xyz, center);
      float sweep = length(motion);
      if (sweep > 0.0001) {
        vec3 direction = motion / sweep;
        float amount = min(0.9, uSpin.w * uStretch * 0.12) * sweep;
        offset += direction * dot(offset, direction) * amount;
      }
      vec3 world = normalize(center * uRadius + offset) * uRadius * (1.0 + 0.003 * center.z);
      gl_Position = uProjection * vec4(world.xy, world.z - uCamera, 1.0);
      gl_Position.y += uShift * gl_Position.w;
      vUv = aCorner;
      vFront = center.z;
      vItem = aTile.w;
    }`;

    const FRAGMENT_SHADER = `#version 300 es
    precision highp float;
    uniform sampler2D uAtlas;
    uniform float uCells;
    uniform float uInset;
    uniform float uRoundness;
    uniform float uGrayscale;
    uniform float uDim;
    uniform float uReveal;
    uniform vec3 uPlaceholder;
    uniform vec3 uTone;
    in vec2 vUv;
    in float vFront;
    in float vItem;
    out vec4 outColor;

    void main() {
      float corner = clamp(uRoundness, 0.0, 1.0);
      vec2 q = abs(vUv) - (1.0 - corner);
      float d = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - corner;
      float aa = max(fwidth(d), 0.0001);
      float mask = 1.0 - smoothstep(-aa, aa, d);
      float alpha = mask * smoothstep(0.02, 0.4, vFront) * uReveal;
      if (alpha < 0.002) discard;
      vec2 cell = vec2(mod(vItem, uCells), floor(vItem / uCells));
      vec2 local = vec2(vUv.x, -vUv.y) * 0.5 + 0.5;
      vec4 sampled = texture(uAtlas, (cell + uInset + local * (1.0 - 2.0 * uInset)) / uCells);
      vec3 color = mix(uPlaceholder, sampled.rgb, sampled.a);
      float focus = smoothstep(0.93, 0.997, vFront);
      float gray = dot(color, vec3(0.2126, 0.7152, 0.0722));
      color = mix(color, vec3(gray), uGrayscale * (1.0 - focus));
      color = mix(color, uTone, uDim * (1.0 - focus));
      outColor = vec4(color * alpha, alpha);
    }`;

    const GRID = 12;
    const RADIUS = 2;
    const FOV = (30 * Math.PI) / 180;
    const FRONT = [0, 0, 1];

    const clamp = (val, min, max) => Math.min(max, Math.max(min, val));
    const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
    const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
    const normalize = v => {
      const len = Math.hypot(v[0], v[1], v[2]) || 1;
      return [v[0] / len, v[1] / len, v[2] / len];
    };
    const quatMultiply = (a, b) => [
      a[3] * b[0] + a[0] * b[3] + a[1] * b[2] - a[2] * b[1],
      a[3] * b[1] - a[0] * b[2] + a[1] * b[3] + a[2] * b[0],
      a[3] * b[2] + a[0] * b[1] - a[1] * b[0] + a[2] * b[3],
      a[3] * b[3] - a[0] * b[0] - a[1] * b[1] - a[2] * b[2]
    ];
    const quatAxisAngle = (axis, angle) => {
      const s = Math.sin(angle / 2);
      return [axis[0] * s, axis[1] * s, axis[2] * s, Math.cos(angle / 2)];
    };
    const quatNormalize = q => {
      const len = Math.hypot(q[0], q[1], q[2], q[3]) || 1;
      return [q[0] / len, q[1] / len, q[2] / len, q[3] / len];
    };
    const rotate = (q, v) => {
      const t = cross(q, v).map(val => val * 2);
      const u = cross(q, t);
      return [v[0] + q[3] * t[0] + u[0], v[1] + q[3] * t[1] + u[1], v[2] + q[3] * t[2] + u[2]];
    };

    const sphere = count => {
      const golden = Math.PI * (3 - Math.sqrt(5));
      return Array.from({ length: count }, (_, i) => {
        const y = 1 - (2 * (i + 0.5)) / count;
        const ring = Math.sqrt(1 - y * y);
        return [Math.cos(golden * i) * ring, y, Math.sin(golden * i) * ring];
      });
    };

    const compileShader = (gl, type, source) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) return shader;
      gl.deleteShader(shader);
      return null;
    };

    const gl = canvas.getContext('webgl2', { alpha: true, premultipliedAlpha: true, antialias: true });
    if (!gl) return;

    const vertex = compileShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
    const fragment = compileShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
    const program = gl.createProgram();
    if (!vertex || !fragment || !program) return;
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
    gl.useProgram(program);

    const uniforms = {};
    for (const name of [
      'uOrientation', 'uProjection', 'uCamera', 'uRadius', 'uTileRadius',
      'uSpin', 'uStretch', 'uShift', 'uAtlas', 'uCells', 'uInset',
      'uRoundness', 'uGrayscale', 'uDim', 'uReveal', 'uPlaceholder', 'uTone'
    ]) {
      uniforms[name] = gl.getUniformLocation(program, name);
    }

    const corners = [];
    const indices = [];
    for (let y = 0; y <= GRID; y++) {
      for (let x = 0; x <= GRID; x++) corners.push((x / GRID) * 2 - 1, (y / GRID) * 2 - 1);
    }
    for (let y = 0; y < GRID; y++) {
      for (let x = 0; x < GRID; x++) {
        const i = y * (GRID + 1) + x;
        indices.push(i, i + 1, i + GRID + 1, i + 1, i + GRID + 2, i + GRID + 1);
      }
    }

    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    const cornerBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cornerBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(corners), gl.STATIC_DRAW);
    const cornerLocation = gl.getAttribLocation(program, 'aCorner');
    gl.enableVertexAttribArray(cornerLocation);
    gl.vertexAttribPointer(cornerLocation, 2, gl.FLOAT, false, 0, 0);

    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

    const tileBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, tileBuffer);
    const tileLocation = gl.getAttribLocation(program, 'aTile');
    gl.enableVertexAttribArray(tileLocation);
    gl.vertexAttribPointer(tileLocation, 4, gl.FLOAT, false, 0, 0);
    gl.vertexAttribDivisor(tileLocation, 1);
    gl.bindVertexArray(null);

    const atlasTexture = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, atlasTexture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    const settings = {
      count: 160, tileSize: 0.63, roundness: 0.2, zoom: 1.65,
      pullBack: 1, stretch: 0.6, inertia: 0.6, autoplay: 3,
      grayscale: true, dim: 0.5, intro: true
    };

    const atlas = { canvas: document.createElement('canvas'), cells: 1, cell: 512, request: 0, dirty: false };
    const drag = { active: false, id: -1, x: 0, y: 0, dx: 0, dy: 0, moved: 0, start: 0 };
    const state = {
      width: 1, height: 1, tiles: [], assign: [], count: 0,
      orientation: quatNormalize([0.08, -0.3, 0, 1]), axis: [0, 1, 0],
      speed: settings.intro ? 3.2 : 0, camera: 0, target: -1, front: 0,
      shown: -1, moving: true, reveal: 0, hovered: false, focused: false,
      idle: 0, settle: 0, tilePx: 0, layout: 'side', shift: 0, started: false
    };

    let raf = 0, timer = 0, last = 0, visible = true;

    const layout = () => {
      if (settings.count === state.count) return;
      state.count = settings.count;
      state.tiles = sphere(settings.count);
      const totalItems = Math.max(1, items.length);
      const usage = new Array(totalItems).fill(0);
      state.assign = state.tiles.map(() => -1);
      state.tiles.forEach((tile, i) => {
        const near = state.tiles
          .map((other, j) => [j === i ? -2 : dot(tile, other), j])
          .sort((a, b) => b[0] - a[0])
          .slice(0, 6)
          .map(([, j]) => state.assign[j]);
        let pick = -1;
        for (let k = 0; k < totalItems; k++) {
          const candidate = (i + k) % totalItems;
          if (near.includes(candidate)) continue;
          if (pick < 0 || usage[candidate] < usage[pick]) pick = candidate;
        }
        if (pick < 0) pick = i % totalItems;
        state.assign[i] = pick;
        usage[pick] += 1;
      });

      const data = new Float32Array(settings.count * 4);
      state.tiles.forEach((tile, i) => data.set([tile[0], tile[1], tile[2], state.assign[i]], i * 4));
      gl.bindBuffer(gl.ARRAY_BUFFER, tileBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

      let first = -1, firstZ = -2;
      state.tiles.forEach((tile, i) => {
        const z = rotate(state.orientation, tile)[2];
        if (state.assign[i] === 0 && z > firstZ) {
          firstZ = z;
          first = i;
        }
      });
      state.target = first;
    };

    const uploadAtlas = () => {
      atlas.dirty = false;
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, atlasTexture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, atlas.canvas);
      gl.generateMipmap(gl.TEXTURE_2D);
    };

    const loadItems = () => {
      atlas.cells = Math.ceil(Math.sqrt(items.length));
      atlas.cell = clamp(Math.floor(4096 / atlas.cells), 64, 512);
      atlas.canvas.width = atlas.cells * atlas.cell;
      atlas.canvas.height = atlas.cells * atlas.cell;
      const ctx = atlas.canvas.getContext('2d');
      ctx.clearRect(0, 0, atlas.canvas.width, atlas.canvas.height);
      uploadAtlas();
      layout();

      let pending = items.length;
      items.forEach((item, index) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          const size = atlas.cell;
          const scale = Math.max(size / img.naturalWidth, size / img.naturalHeight);
          const w = img.naturalWidth * scale;
          const h = img.naturalHeight * scale;
          const x = (index % atlas.cells) * size;
          const y = Math.floor(index / atlas.cells) * size;

          ctx.save();
          ctx.beginPath();
          ctx.rect(x, y, size, size);
          ctx.clip();
          ctx.drawImage(img, x + (size - w) / 2, y + (size - h) / 2, w, h);
          ctx.restore();

          atlas.dirty = true;
          pending--;
          if (pending <= 0) state.started = true;
          wake();
        };
        img.onerror = () => {
          pending--;
          if (pending <= 0) state.started = true;
        };
        img.src = item.image;
      });
    };

    const tileRadius = () => 0.5 * RADIUS * Math.sqrt((4 * Math.PI) / Math.max(1, state.count)) * settings.tileSize;
    const restDistance = () => RADIUS + tileRadius() / (0.46 * settings.zoom * Math.tan(FOV / 2) * Math.min(1, state.width / state.height));

    const nearest = () => {
      let best = 0, bestZ = -2;
      for (let i = 0; i < state.tiles.length; i++) {
        const z = rotate(state.orientation, state.tiles[i])[2];
        if (z > bestZ) { bestZ = z; best = i; }
      }
      return best;
    };

    const neighbor = (from, dir) => {
      const origin = rotate(state.orientation, state.tiles[from]);
      let best = -1, bestScore = Infinity;
      for (let i = 0; i < state.tiles.length; i++) {
        if (i === from) continue;
        const c = rotate(state.orientation, state.tiles[i]);
        if (c[2] < 0) continue;
        const dx = c[0] - origin[0], dy = c[1] - origin[1];
        const len = Math.hypot(dx, dy);
        if (len < 0.0001) continue;
        const align = (dx * dir[0] + dy * dir[1]) / len;
        if (align < 0.55) continue;
        const score = len * (2.2 - align);
        if (score < bestScore) { bestScore = score; best = i; }
      }
      return best;
    };

    const goTo = idx => {
      if (idx < 0) return;
      state.target = idx;
      state.speed = 0;
      state.idle = 0;
      wake();
    };

    const updateActiveUI = (idx) => {
      const item = items[idx % items.length];
      const titleEl = document.getElementById('menuActiveTitle');
      const descEl = document.getElementById('menuActiveDesc');
      const btnEl = document.getElementById('menuActiveBtn');
      const overlayEl = document.getElementById('infiniteMenuOverlay');

      if (titleEl) titleEl.innerText = item.title;
      if (descEl) descEl.innerText = item.description;

      // Actualiza los atributos de Favoritos para auth-ai.js según la idea de altar activa
      if (overlayEl) {
        overlayEl.setAttribute('data-fav-id', `muertos-idea-${item.key}`);
        overlayEl.setAttribute('data-fav-title', item.title);
        overlayEl.setAttribute('data-fav-cat', 'Día de Muertos');
        if (typeof window.syncFavButtons === 'function') window.syncFavButtons();
      }

      if (btnEl) {
        btnEl.onclick = () => {
          showLetterModal(item.key);
        };
      }
    };

    const report = () => {
      const index = items.length ? (state.assign[state.front] ?? 0) % items.length : 0;
      if (!state.moving && index !== state.shown) {
        state.shown = index;
        updateActiveUI(index);
      }
    };

    const frame = now => {
      raf = 0;
      if (!visible) return;
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60;
      last = now;

      layout();
      if (atlas.dirty) uploadAtlas();
      if (state.started) state.reveal = Math.min(1, state.reveal + dt / 0.7);

      const minSide = Math.min(state.width, state.height);
      if (drag.active) {
        if (drag.dx || drag.dy) {
          const len = Math.hypot(drag.dx, drag.dy);
          const angle = (len / minSide) * 2.6;
          const axis = normalize([drag.dy, drag.dx, 0]);
          state.orientation = quatNormalize(quatMultiply(quatAxisAngle(axis, angle), state.orientation));
          const blend = 1 - Math.exp(-dt * 30);
          state.axis = normalize(state.axis.map((val, i) => val + (axis[i] - val) * blend));
          state.speed += (angle / dt - state.speed) * blend;
          drag.dx = 0; drag.dy = 0;
        } else { state.speed *= Math.exp(-dt * 14); }
      } else {
        if (state.speed > 0.0005) {
          state.orientation = quatNormalize(quatMultiply(quatAxisAngle(state.axis, state.speed * dt), state.orientation));
          state.speed *= Math.exp(-dt * (6 - 5 * settings.inertia));
        } else { state.speed = 0; }

        const goal = state.target >= 0 ? state.target : nearest();
        const current = rotate(state.orientation, state.tiles[goal]);
        const angle = Math.acos(clamp(dot(current, FRONT), -1, 1));
        const pull = clamp(1 - state.speed / 1.4, 0, 1);

        if (angle > 0.0002 && pull > 0) {
          const axis = cross(current, FRONT);
          const step = angle * (1 - Math.exp(-dt * (state.target >= 0 ? 6 : 8))) * pull;
          if (Math.hypot(axis[0], axis[1], axis[2]) > 1e-6) {
            state.orientation = quatNormalize(quatMultiply(quatAxisAngle(normalize(axis), step), state.orientation));
          }
        } else if (state.target >= 0 && state.speed === 0) { state.target = -1; }
        state.front = goal;
      }

      const settledAngle = Math.acos(clamp(rotate(state.orientation, state.tiles[state.front])[2], -1, 1));
      const moving = drag.active || state.speed > 0.08 || settledAngle > 0.01;
      state.moving = moving;
      state.settle += ((moving ? 0 : 1) - state.settle) * (1 - Math.exp(-dt * (moving ? 10 : 3)));
      if (!moving) report();

      const rest = restDistance();
      const pullAmount = clamp(drag.active ? 1 : state.speed / 2.2, 0, 1);
      const targetCamera = rest + settings.pullBack * pullAmount * RADIUS * 1.25 + (1 - state.reveal) * RADIUS * 1.5;
      if (!state.camera) state.camera = targetCamera + RADIUS;
      state.camera += (targetCamera - state.camera) * (1 - Math.exp(-dt * 4.5));

      if (settings.autoplay > 0 && !moving && !state.hovered) {
        state.idle += dt;
        if (state.idle >= settings.autoplay) {
          state.idle = 0;
          goTo(neighbor(state.front, [1, 0]));
        }
      } else { state.idle = 0; }

      render();

      const busy = moving || Math.abs(targetCamera - state.camera) > 0.001 || state.reveal < 1 || atlas.dirty;
      if (busy) raf = requestAnimationFrame(frame);
      else {
        last = 0;
        if (settings.autoplay > 0 && !state.hovered) {
          clearTimeout(timer);
          timer = setTimeout(wake, Math.max(16, (settings.autoplay - state.idle) * 1000));
        }
      }
    };

    const render = () => {
      const aspect = state.width / state.height;
      const f = 1 / Math.tan(FOV / 2);
      const near = 0.05, far = 50;
      const projection = new Float32Array([
        f / aspect, 0, 0, 0,
        0, f, 0, 0,
        0, 0, (far + near) / (near - far), -1,
        0, 0, (2 * far * near) / (near - far), 0
      ]);

      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.enable(gl.DEPTH_TEST);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
      gl.useProgram(program);

      const [qx, qy, qz, qw] = state.orientation;
      gl.uniform4f(uniforms.uOrientation, qx, qy, qz, qw);
      gl.uniformMatrix4fv(uniforms.uProjection, false, projection);
      gl.uniform1f(uniforms.uCamera, state.camera);
      gl.uniform1f(uniforms.uRadius, RADIUS);
      gl.uniform1f(uniforms.uTileRadius, tileRadius());
      gl.uniform4f(uniforms.uSpin, state.axis[0], state.axis[1], state.axis[2], state.speed);
      gl.uniform1f(uniforms.uStretch, settings.stretch);
      gl.uniform1f(uniforms.uShift, state.shift);
      gl.uniform1f(uniforms.uCells, atlas.cells);
      gl.uniform1f(uniforms.uInset, 2 / atlas.cell);
      gl.uniform1f(uniforms.uRoundness, settings.roundness);
      gl.uniform1f(uniforms.uGrayscale, settings.grayscale ? 1 : 0);
      gl.uniform1f(uniforms.uDim, settings.dim * (0.45 + 0.55 * state.settle));
      gl.uniform1f(uniforms.uReveal, state.reveal);
      gl.uniform3f(uniforms.uPlaceholder, 0.13, 0.12, 0.15);
      gl.uniform3f(uniforms.uTone, 0.04, 0.035, 0.05);

      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, atlasTexture);
      gl.bindVertexArray(vao);
      gl.drawElementsInstanced(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0, state.tiles.length);
      gl.bindVertexArray(null);
    };

    const wake = () => {
      clearTimeout(timer);
      if (raf || !visible) return;
      raf = requestAnimationFrame(frame);
    };

    canvas.addEventListener('pointerdown', e => {
      canvas.setPointerCapture?.(e.pointerId);
      drag.active = true;
      drag.id = e.pointerId;
      drag.x = e.clientX;
      drag.y = e.clientY;
      drag.dx = 0; drag.dy = 0;
      drag.moved = 0;
      drag.start = performance.now();
      state.target = -1;
      wake();
    });

    canvas.addEventListener('pointermove', e => {
      if (!drag.active || e.pointerId !== drag.id) return;
      const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
      drag.x = e.clientX; drag.y = e.clientY;
      drag.dx += dx; drag.dy += dy;
      drag.moved += Math.hypot(dx, dy);
      wake();
    });

    canvas.addEventListener('pointerup', e => {
      if (!drag.active || e.pointerId !== drag.id) return;
      drag.active = false;
      canvas.releasePointerCapture?.(e.pointerId);
      wake();
    });

    root.addEventListener('pointerenter', () => { state.hovered = true; });
    root.addEventListener('pointerleave', () => { state.hovered = false; wake(); });

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      state.width = Math.max(1, root.clientWidth);
      state.height = Math.max(1, root.clientHeight);
      canvas.width = Math.round(state.width * dpr);
      canvas.height = Math.round(state.height * dpr);
      wake();
    };

    window.addEventListener('resize', resize);
    resize();
    loadItems();
    updateActiveUI(0);
}

/* ==========================================================================
   6. BASE DE DATOS DE ESTADOS Y TRADICIONES
   ========================================================================== */
const regionalData = {
    michoacan: {
        id: "michoacan", name: "MICHOACÁN", title: "Ofrenda de la Noche de Muertos",
        tag: "ORIGEN PRINCIPAL: PÁTZCUARO Y JANITZIO", icon: "🚣",
        desc: "En Janitzio y Pátzcuaro, las veladoras iluminan las canoas con redes mariposa sobre el lago. Se construyen arcos monumentales de flor de cempasúchil y se ofrecen platillos tradicionales de pescado blanco y tamales.",
        sharedStates: ["Michoacán", "Jalisco", "Guanajuato", "Aguascalientes"],
        stateKeys: ["michoacan", "jalisco", "guanajuato", "aguascalientes"],
        images: [
            "https://images.unsplash.com/photo-1512389142860-9c449e58a543?q=80&w=500&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1508361001413-7a9dca21d08a?q=80&w=500&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=80&w=500&auto=format&fit=crop"
        ],
        elements: ["✨ Arcos de Cempasúchil", "🕯️ Redes de Pesca con Velas", "🐟 Pescado Blanco", "🍞 Pan de Muerto Artesanal"],
        lat: 19.5133, lng: -101.6094, mapsUrl: "https://www.google.com/maps/search/?api=1&query=Patzcuaro+Michoacan+Dia+de+Muertos"
    },
    jalisco: {
        id: "jalisco", name: "JALISCO", title: "Ofrenda de la Noche de Muertos",
        tag: "ORIGEN PRINCIPAL: PÁTZCUARO Y JANITZIO", icon: "🚣",
        desc: "Jalisco, Michoacán y Guanajuato comparten la tradición de altares monumentales con serenatas de mariachi, desfiles de catrinas y veladoras dedicadas a las ánimas.",
        sharedStates: ["Jalisco", "Michoacán", "Guanajuato", "Aguascalientes"],
        stateKeys: ["jalisco", "michoacan", "guanajuato", "aguascalientes"],
        images: [
            "https://images.unsplash.com/photo-1512389142860-9c449e58a543?q=80&w=500&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1508361001413-7a9dca21d08a?q=80&w=500&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=80&w=500&auto=format&fit=crop"
        ],
        elements: ["✨ Arcos de Cempasúchil", "🎺 Mariachi Tradicional", "🍞 Pan de Muerto Artesanal"],
        lat: 20.6597, lng: -103.3496, mapsUrl: "https://www.google.com/maps/search/?api=1&query=Guadalajara+Dia+de+Muertos"
    },
    cdmx: {
        id: "cdmx", name: "CIUDAD DE MÉXICO", title: "Ofrenda y Alumbrada del Altiplano",
        tag: "ORIGEN PRINCIPAL: SAN ANDRÉS MIXQUIC, CDMX", icon: "💀",
        desc: "En Mixquic (Tláhuac) y la zona conurbada del Estado de México y Morelos, los panteones apagan sus luces en 'La Alumbrada' para ser iluminados por miles de velas. Abundan las calaveritas de azúcar neón.",
        sharedStates: ["Ciudad de México", "Estado de México", "Morelos", "Tlaxcala"],
        stateKeys: ["cdmx", "edomex", "morelos", "tlaxcala"],
        images: [
            "https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=80&w=500&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1603988363607-e1e4a66962c6?q=80&w=500&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1512389142860-9c449e58a543?q=80&w=500&auto=format&fit=crop"
        ],
        elements: ["💀 Calaveras de Azúcar Neón", "🕯️ La Alumbrada en Panteón", "🌺 Flor de Cresta de Gallo", "🌽 Tamales de Mole"],
        lat: 19.2253, lng: -98.9619, mapsUrl: "https://www.google.com/maps/search/?api=1&query=San+Andres+Mixquic+Dia+de+Muertos"
    },
    sanluispotosi: {
        id: "sanluispotosi", name: "SAN LUIS POTOSÍ", title: "Xantolo: La Fiesta de las Ánimas",
        tag: "ORIGEN PRINCIPAL: HUASTECA POTOSINA", icon: "🎭",
        desc: "En San Luis Potosí, Hidalgo y Veracruz se vive el Xantolo: las comparsas de huehues con máscaras de madera bailan en las calles para guiar a las almas con tamales de zacahuil.",
        sharedStates: ["San Luis Potosí", "Hidalgo", "Veracruz", "Tamaulipas"],
        stateKeys: ["sanluispotosi", "hidalgo", "veracruz", "tamaulipas"],
        images: [
            "https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=80&w=500&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1508361001413-7a9dca21d08a?q=80&w=500&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1512389142860-9c449e58a543?q=80&w=500&auto=format&fit=crop"
        ],
        elements: ["🎭 Máscaras de Huehues", "🫔 Zacahuil Gigante", "🕯️ Arcos Huastecos"],
        lat: 21.9833, lng: -98.9833, mapsUrl: "https://www.google.com/maps/search/?api=1&query=Huasteca+Potosina+Xantolo"
    },
    oaxaca: {
        id: "oaxaca", name: "OAXACA", title: "Altar Tradicional Zapoteca",
        tag: "ORIGEN PRINCIPAL: VALLES CENTRALES DE OAXACA", icon: "🌼",
        desc: "Ofrendas adornadas con mole negro de siete chiles, mezcal de pechuga, chocolate de agua, pan de yema con caritas de pasta y arcos revestidos con cempasúchil silvestre.",
        sharedStates: ["Oaxaca", "Chiapas", "Guerrero"],
        stateKeys: ["oaxaca", "chiapas", "guerrero"],
        images: [
            "https://images.unsplash.com/photo-1508361001413-7a9dca21d08a?q=80&w=500&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1512389142860-9c449e58a543?q=80&w=500&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1603988363607-e1e4a66962c6?q=80&w=500&auto=format&fit=crop"
        ],
        elements: ["🍲 Mole Negro y Mezcal", "🥖 Pan de Yema con Caritas", "🌾 Copal y Sahumerio", "🍫 Chocolate de Agua"],
        lat: 17.0654, lng: -96.7236, mapsUrl: "https://www.google.com/maps/search/?api=1&query=Oaxaca+Centro+Dia+de+Muertos"
    },
    yucatan: {
        id: "yucatan", name: "YUCATÁN", title: "Altar Maya Hanal Pixán",
        tag: "ORIGEN PRINCIPAL: MÉRIDA Y YUCATÁN", icon: "🍲",
        desc: "La 'Comida de las Ánimas' maya. Toda la península viste sus altares de blanco con manteles bordados en punto de cruz, Mukbilpollo (tamal pib horneado bajo tierra) y jícaras con atole nuevo.",
        sharedStates: ["Yucatán", "Quintana Roo", "Campeche", "Tabasco"],
        stateKeys: ["yucatan", "quintanaroo", "campeche", "tabasco"],
        images: [
            "https://images.unsplash.com/photo-1603988363607-e1e4a66962c6?q=80&w=500&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=80&w=500&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1508361001413-7a9dca21d08a?q=80&w=500&auto=format&fit=crop"
        ],
        elements: ["🫔 Mukbilpollo (Pib)", "🥣 Atole Sak-Ha en Jícaras", "🪡 Manteletes Bordados Maya", "🕯️ Velas de Cera Virgen"],
        lat: 20.9676, lng: -89.6237, mapsUrl: "https://www.google.com/maps/search/?api=1&query=Merida+Yucatan+Hanal+Pixan"
    },
    puebla: {
        id: "puebla", name: "PUEBLA", title: "Altares Monumentales Piramidales",
        tag: "ORIGEN PRINCIPAL: HUAQUECHULA, PUEBLA", icon: "🏛️",
        desc: "Altares piramidales de 3 a 5 niveles vestidos en telas de satín blanco. Incluyen espejos para reflejar la eternidad, alfeñiques dorados y la luz de cirios monumentales.",
        sharedStates: ["Puebla", "Tlaxcala", "Querétaro"],
        stateKeys: ["puebla", "tlaxcala", "queretaro"],
        images: [
            "https://images.unsplash.com/photo-1512389142860-9c449e58a543?q=80&w=500&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1508361001413-7a9dca21d08a?q=80&w=500&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=80&w=500&auto=format&fit=crop"
        ],
        elements: ["🏛️ Pirámide de Satín Blanco", "🪞 Espejos de la Eternidad", "🍯 Alfeñiques Dorados", "🕯️ Cirios Monumentales"],
        lat: 18.7725, lng: -98.5502, mapsUrl: "https://www.google.com/maps/search/?api=1&query=Huaquechula+Puebla+Altares+Monumentales"
    }
};

const stateAliases = {
    edomex: "cdmx", morelos: "cdmx", tlaxcala: "cdmx",
    guanajuato: "michoacan", aguascalientes: "michoacan", colima: "michoacan",
    hidalgo: "sanluispotosi", veracruz: "sanluispotosi", tamaulipas: "sanluispotosi",
    quintanaroo: "yucatan", campeche: "yucatan", tabasco: "yucatan",
    chiapas: "oaxaca", guerrero: "oaxaca",
    queretaro: "puebla",
    bc: "jalisco", bcs: "jalisco", sonora: "jalisco", chihuahua: "jalisco",
    coahuila: "jalisco", nuevoleon: "jalisco", durango: "jalisco", sinaloa: "jalisco", zacatecas: "jalisco", nayarit: "jalisco"
};

const all32States = [
    { key: 'aguascalientes', name: 'Aguascalientes' }, { key: 'bc', name: 'Baja California' },
    { key: 'bcs', name: 'Baja California Sur' }, { key: 'campeche', name: 'Campeche' },
    { key: 'coahuila', name: 'Coahuila' }, { key: 'colima', name: 'Colima' },
    { key: 'chiapas', name: 'Chiapas' }, { key: 'chihuahua', name: 'Chihuahua' },
    { key: 'cdmx', name: 'Ciudad de México' }, { key: 'durango', name: 'Durango' },
    { key: 'guanajuato', name: 'Guanajuato' }, { key: 'guerrero', name: 'Guerrero' },
    { key: 'hidalgo', name: 'Hidalgo' }, { key: 'jalisco', name: 'Jalisco' },
    { key: 'edomex', name: 'Estado de México' }, { key: 'michoacan', name: 'Michoacán' },
    { key: 'morelos', name: 'Morelos' }, { key: 'nayarit', name: 'Nayarit' },
    { key: 'nuevoleon', name: 'Nuevo León' }, { key: 'oaxaca', name: 'Oaxaca' },
    { key: 'puebla', name: 'Puebla' }, { key: 'queretaro', name: 'Querétaro' },
    { key: 'quintanaroo', name: 'Quintana Roo' }, { key: 'sanluispotosi', name: 'San Luis Potosí' },
    { key: 'sinaloa', name: 'Sinaloa' }, { key: 'sonora', name: 'Sonora' },
    { key: 'tabasco', name: 'Tabasco' }, { key: 'tamaulipas', name: 'Tamaulipas' },
    { key: 'tlaxcala', name: 'Tlaxcala' }, { key: 'veracruz', name: 'Veracruz' },
    { key: 'yucatan', name: 'Yucatán' }, { key: 'zacatecas', name: 'Zacatecas' }
];

let activeRegion = regionalData.michoacan;

function renderStatesList() {
    const container = document.getElementById('statesContainer');
    if(!container) return;
    container.innerHTML = '';
    all32States.forEach(st => {
        const btn = document.createElement('button');
        btn.className = 'state-btn';
        btn.id = `btn-${st.key}`;
        btn.innerHTML = `<span>${st.name}</span> <span style="opacity:0.5;">→</span>`;
        btn.onclick = () => {
            openRegionModal(st.key);
            toggleSidebar();
        };
        container.appendChild(btn);
    });
}

function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchResults = document.getElementById('searchResults');
    if(!searchInput || !searchResults) return;

    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        if(!query) { searchResults.style.display = 'none'; return; }

        const matches = all32States.filter(st => {
            let lookup = st.key;
            if(!regionalData[lookup] && stateAliases[lookup]) lookup = stateAliases[lookup];
            const data = regionalData[lookup] || {};
            return st.name.toLowerCase().includes(query) ||
                   (data.title && data.title.toLowerCase().includes(query));
        });

        if(matches.length > 0) {
            searchResults.innerHTML = matches.map(m => `
                <div class="search-item" onclick="openRegionModal('${m.key}'); document.getElementById('searchResults').style.display='none';">
                    <strong>${m.name}</strong>
                    <span style="opacity:0.6;">Tradición</span>
                </div>
            `).join('');
            searchResults.style.display = 'block';
        } else { searchResults.style.display = 'none'; }
    });
}

/* ==========================================================================
   7. PROGRESS BAR INTERACTIVA DE GUÍA DE ALTAR (GUARDADO POR USUARIO)
   ========================================================================== */
function getAltarChecklistStorageKey() {
    const possibleKeys = ['auth_current_user', 'tradicion_current_user', 'currentUser', 'usuarioActivo', 'user'];
    for (const k of possibleKeys) {
        try {
            const raw = localStorage.getItem(k);
            if (!raw) continue;
            const parsed = JSON.parse(raw);
            const id = parsed?.email || parsed?.username || parsed?.id || parsed?.nombre;
            if (id) return `altar_checklist_${String(id).toLowerCase().trim()}`;
        } catch (e) {
            if (localStorage.getItem(k)) {
                return `altar_checklist_${localStorage.getItem(k).toLowerCase().trim()}`;
            }
        }
    }
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.includes('user') || key.includes('session') || key.includes('auth')) && !key.startsWith('altar_checklist_')) {
            try {
                const val = JSON.parse(localStorage.getItem(key));
                const id = val?.email || val?.username || val?.uid || val?.id;
                if (id) return `altar_checklist_${String(id).toLowerCase().trim()}`;
            } catch (_) {}
        }
    }
    return 'altar_checklist_invitado';
}

function saveAltarChecklistState() {
    const checkboxes = document.querySelectorAll('#altarChecklist input[type="checkbox"]');
    const state = {};
    checkboxes.forEach((cb, index) => {
        const id = cb.getAttribute('data-check-id') || `item_${index}`;
        state[id] = cb.checked;
    });
    localStorage.setItem(getAltarChecklistStorageKey(), JSON.stringify(state));
}

function loadAltarChecklistState() {
    const checkboxes = document.querySelectorAll('#altarChecklist input[type="checkbox"]');
    if (!checkboxes.length) return;

    const storageKey = getAltarChecklistStorageKey();
    let saved = {};
    try {
        saved = JSON.parse(localStorage.getItem(storageKey)) || {};
    } catch (e) {
        saved = {};
    }

    checkboxes.forEach((cb, index) => {
        const id = cb.getAttribute('data-check-id') || `item_${index}`;
        cb.checked = Boolean(saved[id]);
    });

    updateAltarProgress(false);
}

function updateAltarProgress(shouldSave = true) {
    const checkboxes = document.querySelectorAll('#altarChecklist input[type="checkbox"]');
    const total = checkboxes.length;
    let checkedCount = 0;

    checkboxes.forEach(cb => { if (cb.checked) checkedCount++; });

    const percentage = total > 0 ? Math.round((checkedCount / total) * 100) : 0;
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');

    if (progressFill) progressFill.style.width = `${percentage}%`;
    if (progressText) progressText.innerText = `Altar preparado: ${percentage}% (${checkedCount} de ${total} elementos)`;

    if (shouldSave) {
        saveAltarChecklistState();
    }
}

/* ==========================================================================
   8. OFRENDA 3D Y ESTILOS DE ALTAR: CARTAS SAGRADAS AL TOCAR ELEMENTOS
   ========================================================================== */
const ofrendaElementsInfo = {
    // --- FORMAS Y ESTILOS DE ALTAR (ESFERA 3D) ---
    altar2: {
        title: "Altar de 2 Niveles (Cielo y Tierra)",
        desc: "Es una forma sencilla y muy significativa de montar la ofrenda en casa. El nivel superior representa el cielo y la bóveda celeste (donde van las fotografías, santos y veladoras), mientras que el nivel inferior representa la tierra con sus frutos, pan de muerto, agua y platillos típicos."
    },
    altar3: {
        title: "Altar de 3 Niveles (Cielo, Tierra e Inframundo)",
        desc: "El formato clásico de los hogares mexicanos. El escalón más alto representa el cielo; el escalón intermedio simboliza la tierra donde habitamos los vivos; y el nivel inferior representa el inframundo o purgatorio, acompañado de un camino de pétalos de cempasúchil y velas en el piso."
    },
    altar7: {
        title: "Altar Tradicional de 7 Niveles",
        desc: "Representa los 7 destinos o niveles que el alma debe recorrer para alcanzar el descanso eterno. En la cúspide se coloca la imagen religiosa; en el segundo nivel las ánimas del purgatorio; en el tercero la sal; en el cuarto el pan de muerto; en el quinto la comida; en el sexto las fotografías; y en el séptimo la cruz de ceniza o flores."
    },
    altarArco: {
        title: "Altar con Arco de Cempasúchil",
        desc: "Muy característico de Michoacán, Oaxaca y la Huasteca. Se construye un arco con varas de carrizo o caña forradas con flor de cempasúchil, mano de león y frutas colgantes (como mandarinas, cañas y plátanos), simbolizando el portal sagrado por donde cruzan las almas."
    },
    altarMesa: {
        title: "Altar Minimalista de Mesa o Repisa",
        desc: "Ideal para departamentos, habitaciones o espacios reducidos sin perder el sentido espiritual. Se coloca un mantel blanco o morado sobre una mesa y se disponen los cuatro elementos de la naturaleza: agua (vaso cristalino), tierra (frutas y pan), viento (papel picado) y fuego (una veladora), junto al retrato del ser querido."
    },
    altarMascotas: {
        title: "Altar Dedicado a las Mascotas",
        desc: "Se enciende la noche del 27 de octubre para recibir a perros, gatos y compañeros animales que partieron. Incluye su fotografía, su plato con alimento o premios favoritos, agua limpia, su juguete preferido, flores de cempasúchil y una veladora blanca."
    },
    altarMonumental: {
        title: "Altar Piramidal de Telas Blancas",
        desc: "Inspirado en los altares monumentales de Huaquechula, Puebla. Se arma una estructura escalonada de gran altura cubierta con telas satinadas blancas plisadas, cirios altos, figuras de alfeñique y un espejo al fondo que permite ver el reflejo del alma del difunto."
    },
    altarMaya: {
        title: "Altar Maya Hanal Pixán",
        desc: "Originario de la Península de Yucatán. Se caracteriza por el uso de manteles blancos bordados a mano (hipiles o servilletas en punto de cruz), velas de cera virgen negra o de colores (según si es para adultos o niños), jícaras con chocolate o atole y el tradicional mukbilpollo."
    },

    // --- ELEMENTOS DE LA OFRENDA 3D INFERIOR ---
    cruz: {
        title: "Cruz y Camino de Pétalos de Cempasúchil",
        desc: "Formada con pétalos dorados en el piso. Señala los cuatro puntos cardinales y sirve como sendero aromático y luminoso para que las almas no pierdan el rumbo al descender desde el Mictlán hasta el hogar."
    },
    pan: {
        title: "Pan de Muerto Artesanal",
        desc: "Ofrenda de nutrición espiritual. Representa el cuerpo de los seres queridos y el ciclo vida-muerte. La esfera superior representa el cráneo, mientras que las cuatro canillas cruzadas simbolizan los huesos y lágrimas en los puntos cardinales."
    },
    copal: {
        title: "Sahumerio de Copal e Incienso Sagrado",
        desc: "Limpia y santifica la atmósfera del altar. Su humo perfumado ahuyenta a los malos espíritus, purifica el lugar de reunión y eleva las oraciones de la familia hacia el plano celestial."
    },
    comida: {
        title: "Banquete y Platillos Favoritos",
        desc: "Mole negro, tamales de hoja de plátano, corundas y platillos típicos. Se colocan caliente en la mesa para deleitar el alma del difunto con los aromas del banquete que disfrutaba en vida."
    },
    papel: {
        title: "Papel Picado y Crepé de Colores",
        desc: "Simboliza el elemento Viento y la fragilidad festiva de la vida. Sus troquelados con esqueletos abren portales por donde el viento mece el ambiente para anunciar la llegada alegre de los espíritus."
    },
    vela: {
        title: "Velas, Cirios y Veladoras de Cera Virgen",
        desc: "Representan el Fuego y la Luz divina. Su flama encendida es el faro sagrado que ilumina la oscuridad de la noche, asegurando que cada difunto reconozca su altar y encuentre consuelo."
    },
    foto: {
        title: "Fotografía y Retrato del Ser Querido",
        desc: "Se ubica en el nivel superior del altar. Honra la memoria del difunto a quien se dedica el banquete, garantizando que su recuerdo continúe vivo en el corazón de las generaciones presentes."
    },
    agua: {
        title: "Vaso de Agua Purificada y Sal",
        desc: "El agua mitiga la sed del ánima tras su agotador viaje espiritual. La sal purifica el cuerpo y la esencia del difunto para que no se corrompa en su trayecto de ida y vuelta."
    },
    bebida: {
        title: "Mezcal, Tequila y Jarros de Atole",
        desc: "Alegra la estancia del ánima recordando los momentos de festejo y brindis en vida. Se sirve en caballitos o jícaras para ofrecer bienvenida cordial al viajero."
    },
    dulces: {
        title: "Calaveritas de Azúcar, Amaranto y Alfeñique",
        desc: "Representan la presencia sonriente de la muerte como un paso natural y dulce. Llevan el nombre del difunto en la frente como recordatorio amoroso de su nombre en la eternidad."
    }
};

function showLetterModal(key) {
    const modal = document.getElementById('ofrenda-letter-modal');
    const title = document.getElementById('letterTitle');
    const body = document.getElementById('letterBody');
    const letterCard = modal ? modal.querySelector('.letter-card') : null;
    if (!modal || !title || !body) return;

    const data = ofrendaElementsInfo[key] || ofrendaElementsInfo.cruz;
    title.innerText = data.title;
    body.innerText = data.desc;

    // Permite guardar esta carta / idea de altar en Favoritos desde el modal
    if (letterCard) {
        letterCard.setAttribute('data-fav-id', `muertos-carta-${key}`);
        letterCard.setAttribute('data-fav-title', data.title);
        letterCard.setAttribute('data-fav-cat', 'Día de Muertos');
        if (typeof window.syncFavButtons === 'function') window.syncFavButtons();
    }

    modal.style.display = 'flex';
}

function closeLetterModal() {
    const modal = document.getElementById('ofrenda-letter-modal');
    if (modal) modal.style.display = 'none';
}

/* ==========================================================================
   9. ESCENA THREE.JS (OFRENDA 3D CENTRADA)
   ========================================================================== */
let loadedModel = null;
function setup3DOfrendaScene() {
    const canvas = document.querySelector('.webgl');
    if (!canvas) return;

    const scene = new THREE.Scene();
    const textureLoader = new THREE.TextureLoader();
    let composer;

    const sizes = { width: canvas.clientWidth || 1050, height: canvas.clientHeight || 620 };

    const camera = new THREE.PerspectiveCamera(12, sizes.width / sizes.height, 0.1, 100);
    camera.position.set(0, 4.2, 16);
    scene.add(camera);

    const controls = new THREE.OrbitControls(camera, canvas);
    controls.enableDamping = true;
    controls.minDistance = 8;
    controls.maxDistance = 32;
    controls.target.set(0, 1.2, 0);

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputEncoding = THREE.sRGBEncoding;

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

    const firefliesGeometry = new THREE.BufferGeometry();
    const firefliesCount = 38;
    const positionArray = new Float32Array(firefliesCount * 3);
    const scaleArray = new Float32Array(firefliesCount);

    for (let i = 0; i < firefliesCount; i++) {
        new THREE.Vector3((Math.random() - 0.5) * 3.5, (Math.random() * 2.5) * 1, (Math.random() - 0.5) * 4).toArray(positionArray, i * 3);
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

    const bakedTexture = textureLoader.load('https://rawcdn.githack.com/ricardoolivaalonso/ThreeJS-Room08/7937528ab05555575b588691c884195b73459f89/dist/baked.jpg');
    bakedTexture.flipY = false;
    bakedTexture.encoding = THREE.sRGBEncoding;

    const bakedMaterial = new THREE.MeshBasicMaterial({ map: bakedTexture, side: THREE.DoubleSide });

    const candle = ['Sphere001', 'Sphere002', 'Sphere003'];
    const bubbles = ['Vela_Flama', 'Vela_Flama002', 'Vela_Flama003', 'Vela_Flama004', 'Vela_Flama005', 'Vela_Flama006', 'Vela_Flama007', 'Vela_Flama008', 'Vela_Flama009', 'Vela_Flama010', 'Vela_Flama018', 'Vela_Flama019', 'Vela_Flama020', 'Vela_Flama021', 'Vela_Flama022', 'Vela_Flama023', 'Vela_Flama024'];

    const loader = new THREE.GLTFLoader();
    loader.load('https://rawcdn.githack.com/ricardoolivaalonso/ThreeJS-Room08/d54201d862fc2225142bdfec341a93a726a11a74/dist/model.glb',
        (gltf) => {
            loadedModel = gltf.scene;
            loadedModel.position.set(0, 0, 0);
            loadedModel.traverse(child => {
                child.material = bakedMaterial;
                if (candle.includes(child.name)) child.material = candleMaterial;
                if (bubbles.includes(child.name)) child.material = bubbleMaterial;
                if (child.name === 'Foto') child.material = doorMaterial;
            });
            scene.add(loadedModel);
        }
    );

    const renderScene = new THREE.RenderPass(scene, camera);
    const bloomPass = new THREE.UnrealBloomPass(new THREE.Vector2(sizes.width, sizes.height), 1, 1, 1);
    bloomPass.threshold = 0.1;
    bloomPass.strength = 0.4;
    bloomPass.radius = 1;

    composer = new THREE.EffectComposer(renderer);
    composer.addPass(renderScene);
    composer.addPass(bloomPass);

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    canvas.addEventListener('click', (event) => {
        const rect = canvas.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / canvas.clientWidth) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / canvas.clientHeight) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        if(loadedModel) {
            const intersects = raycaster.intersectObjects(loadedModel.children, true);
            if(intersects.length > 0) {
                const name = intersects[0].object.name;
                const lowerName = name.toLowerCase();

                if(lowerName.includes('vela') || lowerName.includes('flama') || candle.includes(name)) {
                    showLetterModal('vela');
                } else if(lowerName.includes('foto') || name === 'Foto') {
                    showLetterModal('foto');
                } else if(lowerName.includes('pan')) {
                    showLetterModal('pan');
                } else if(lowerName.includes('comida') || lowerName.includes('platillo') || lowerName.includes('alimento')) {
                    showLetterModal('comida');
                } else if(lowerName.includes('cruz') || lowerName.includes('flor') || lowerName.includes('cempasuchil') || lowerName.includes('piso')) {
                    showLetterModal('cruz');
                } else if(lowerName.includes('papel') || lowerName.includes('crepe') || lowerName.includes('banderin')) {
                    showLetterModal('papel');
                } else if(lowerName.includes('copal') || lowerName.includes('incienso') || lowerName.includes('humo')) {
                    showLetterModal('copal');
                } else if(lowerName.includes('bebida') || lowerName.includes('mezcal') || lowerName.includes('tequila')) {
                    showLetterModal('bebida');
                } else if(lowerName.includes('dulce') || lowerName.includes('calavera')) {
                    showLetterModal('dulces');
                } else {
                    showLetterModal('agua');
                }
            }
        }
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
   10. INTERACCIÓN DE TARJETAS Y ANIMACIÓN DE SALIDA
   ========================================================================== */
function highlightSharedStates(stateKeysArray) {
    document.querySelectorAll(".state-path").forEach(path => path.classList.remove("state-active"));
    document.querySelectorAll(".map-pin-bg").forEach(pin => pin.classList.remove("pin-active"));
    document.querySelectorAll(".state-btn").forEach(btn => btn.classList.remove("active"));

    if (!stateKeysArray) return;

    stateKeysArray.forEach(key => {
        document.querySelectorAll(`.state-path[data-state="${key}"]`).forEach(path => path.classList.add("state-active"));
        document.querySelectorAll(`.map-pin-bg[data-state="${key}"]`).forEach(pin => pin.classList.add("pin-active"));
        const btn = document.getElementById(`btn-${key}`);
        if(btn) btn.classList.add("active");
    });
}

function openRegionModal(stateKey) {
    let lookupKey = stateKey;
    if (!regionalData[lookupKey] && stateAliases[lookupKey]) {
        lookupKey = stateAliases[lookupKey];
    }

    const data = regionalData[lookupKey] || regionalData.michoacan;
    activeRegion = data;
    highlightSharedStates(data.stateKeys);

    const modalWrapper = document.getElementById("card-modal-wrapper");
    const flipper = document.getElementById("ghoulCardFlipper");
    const cardFront = modalWrapper ? modalWrapper.querySelector(".card-front") : null;
    const titleEl = document.getElementById("modal-title");
    const stateNameEl = document.getElementById("modal-state-name");
    const tagEl = document.getElementById("modal-tag");
    const descEl = document.getElementById("modal-description");
    const galleryEl = document.getElementById("modal-gallery");
    const chipsEl = document.getElementById("modal-chips-list");
    const sharedList = document.getElementById("shared-states-list");
    const mapsLink = document.getElementById("modal-maps-link");
    const resultBox = document.getElementById("location-result");

    if (cardFront) {
        cardFront.setAttribute("data-fav-id", `muertos-estado-${data.id}`);
        cardFront.setAttribute("data-fav-title", `${data.name} - ${data.title}`);
        cardFront.setAttribute("data-fav-cat", "Día de Muertos");
        if (typeof window.syncFavButtons === "function") window.syncFavButtons();
    }

    if (titleEl) titleEl.textContent = data.title;
    if (stateNameEl) stateNameEl.textContent = data.name;
    if (tagEl) tagEl.textContent = data.tag;
    if (descEl) descEl.textContent = data.desc;

    if (sharedList && data.sharedStates) {
        sharedList.innerHTML = data.sharedStates.map(st => `<span class="shared-state-chip">${st}</span>`).join('');
    }

    if (galleryEl && data.images) {
        galleryEl.innerHTML = data.images.map(url => `<img src="${url}" alt="Tradición ${data.title}">`).join('');
    }

    if (chipsEl && data.elements) {
        chipsEl.innerHTML = data.elements.map(item => `<span class="modal-chip-item">${item}</span>`).join('');
    }

    if (mapsLink) {
        mapsLink.href = data.mapsUrl;
        mapsLink.onclick = (e) => {
            e.preventDefault();
            window.open(data.mapsUrl, '_blank');
        };
    }

    if (resultBox) resultBox.classList.add("location-hidden");

    if (modalWrapper && flipper) {
        const flipperContainer = document.querySelector('.card-flipper-container');
        if (flipperContainer) flipperContainer.classList.remove('closing-to-ball');
        modalWrapper.classList.remove('closing-bg');

        flipper.classList.remove("flipped");
        modalWrapper.classList.remove("modal-hidden");
        setTimeout(() => {
            flipper.classList.add("flipped");
        }, 50);
    }
}

function cerrarCartaAnimada() {
    const modalWrapper = document.getElementById('card-modal-wrapper');
    const flipperContainer = document.querySelector('.card-flipper-container');
    const flipper = document.getElementById("ghoulCardFlipper");

    if (!modalWrapper || !flipperContainer) return;

    flipperContainer.classList.add('closing-to-ball');
    modalWrapper.classList.add('closing-bg');

    setTimeout(() => {
        modalWrapper.classList.add('modal-hidden');
        flipperContainer.classList.remove('closing-to-ball');
        modalWrapper.classList.remove('closing-bg');
        if (flipper) flipper.classList.remove('flipped');
    }, 500);
}

function closeCardModal() {
    cerrarCartaAnimada();
}

function moveSlider(direction) {
    const gallery = document.getElementById("modal-gallery");
    if (gallery) {
        gallery.scrollBy({ left: direction * 220, behavior: 'smooth' });
    }
}

function setupMapInteractions() {
    document.querySelectorAll(".map-pin-bg").forEach(pin => {
        pin.addEventListener("click", function (e) {
            e.stopPropagation();
            openRegionModal(this.getAttribute("data-state"));
        });
    });

    document.querySelectorAll(".state-path").forEach(path => {
        path.addEventListener("click", function (e) {
            e.stopPropagation();
            openRegionModal(this.getAttribute("data-state"));
        });
    });
}

function setupGeolocationCalculator() {
    const gpsBtn = document.getElementById("btn-calc-location");
    const resultBox = document.getElementById("location-result");

    if (!gpsBtn) return;

    gpsBtn.addEventListener("click", () => {
        if (!navigator.geolocation) {
            alert("Geolocalización no disponible en tu navegador.");
            return;
        }

        if (resultBox) {
            resultBox.classList.remove("location-hidden");
            resultBox.innerHTML = "Calculando distancia GPS a la tradición...";
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const userLat = position.coords.latitude;
                const userLng = position.coords.longitude;
                const R = 6371;
                const dLat = (activeRegion.lat - userLat) * Math.PI / 180;
                const dLon = (activeRegion.lng - userLng) * Math.PI / 180;
                const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(userLat * Math.PI / 180) * Math.cos(activeRegion.lat * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2);
                const distanceKm = Math.round(R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))));
                const hours = Math.floor(distanceKm / 80);
                const minutes = Math.round(((distanceKm / 80) % 1) * 60);

                if (resultBox) {
                    resultBox.innerHTML = `Distancia desde tu ubicación: <strong>${distanceKm} km</strong> · Tiempo estimado en vehículo: <strong>~${hours}h ${minutes}min</strong>`;
                }

                const directMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${userLat},${userLng}&destination=${activeRegion.lat},${activeRegion.lng}`;
                const mapsLink = document.getElementById("modal-maps-link");
                if (mapsLink) {
                    mapsLink.href = directMapsUrl;
                    mapsLink.onclick = (e) => {
                        e.preventDefault();
                        window.open(directMapsUrl, '_blank');
                    };
                }
            },
            () => {
                if (resultBox) {
                    resultBox.innerHTML = "No se pudo obtener el GPS actual. Presiona el botón de Google Maps para abrir la ruta directa.";
                }
            }
        );
    });
}

/* ==========================================================================
   11. BOTONES WEBGL ANIMADOS CON SHADERS
   ========================================================================== */
const buttonVertexShader = `
  attribute vec2 position;
  varying vec2 vUv;
  void main() {
    vUv = position * 0.5 + 0.5;
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;

const buttonFragmentShader = `
  precision mediump float;
  uniform vec2 u_resolution;
  uniform float u_time;
  varying vec2 vUv;

  float random(vec2 pos) {
    return fract(sin(dot(pos, vec2(12.9898, 78.233))) * 43758.5453);
  }

  void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    
    float t = u_time * 0.8;
    vec3 color1 = vec3(0.91, 0.11, 0.38);
    vec3 color2 = vec3(0.61, 0.15, 0.69);
    vec3 color3 = vec3(1.0, 0.46, 0.0);
    vec3 color4 = vec3(1.0, 0.75, 0.03);

    float noise = random(st * 10.0 + t) * 0.04;
    float wave = sin(st.x * 3.0 + st.y * 2.0 + t) * 0.5 + 0.5;
    vec3 mixedColor = mix(mix(color1, color2, wave), mix(color3, color4, sin(t + st.x)), st.y);
    
    float borderDist = min(min(st.x, 1.0 - st.x), min(st.y, 1.0 - st.y));
    float edgeGlow = smoothstep(0.0, 0.35, borderDist);
    
    mixedColor += vec3(noise);
    gl_FragColor = vec4(mixedColor * (0.6 + 0.4 * edgeGlow), 0.9);
  }
`;

function initWebGLButtons() {
    const buttons = document.querySelectorAll('.webgl-btn');

    buttons.forEach((btn) => {
        const canvas = btn.querySelector('canvas.btn-canvas');
        if (!canvas) return;

        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        if (!gl) return;

        function resizeCanvas() {
            const rect = btn.getBoundingClientRect();
            if (canvas.width !== rect.width || canvas.height !== rect.height) {
                canvas.width = rect.width * window.devicePixelRatio;
                canvas.height = rect.height * window.devicePixelRatio;
                gl.viewport(0, 0, canvas.width, canvas.height);
            }
        }
        resizeCanvas();

        function createShader(gl, type, source) {
            const shader = gl.createShader(type);
            gl.shaderSource(shader, source);
            gl.compileShader(shader);
            return shader;
        }

        const vertShader = createShader(gl, gl.VERTEX_SHADER, buttonVertexShader);
        const fragShader = createShader(gl, gl.FRAGMENT_SHADER, buttonFragmentShader);

        const program = gl.createProgram();
        gl.attachShader(program, vertShader);
        gl.attachShader(program, fragShader);
        gl.linkProgram(program);
        gl.useProgram(program);

        const positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
            -1, -1,  1, -1, -1,  1,
            -1,  1,  1, -1,  1,  1
        ]), gl.STATIC_DRAW);

        const positionLocation = gl.getAttribLocation(program, 'position');
        gl.enableVertexAttribArray(positionLocation);
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

        const uResolution = gl.getUniformLocation(program, 'u_resolution');
        const uTime = gl.getUniformLocation(program, 'u_time');

        let startTime = performance.now();

        function render() {
            resizeCanvas();
            const currentTime = (performance.now() - startTime) / 1000.0;
            gl.uniform2f(uResolution, canvas.width, canvas.height);
            gl.uniform1f(uTime, currentTime);

            gl.drawArrays(gl.TRIANGLES, 0, 6);
            requestAnimationFrame(render);
        }

        render();
    });
}

document.addEventListener("DOMContentLoaded", () => {
    initLiquidEther();
    initBlueSpiritsWebGL();
    setupGhostCursor();
    initInfiniteMenu();
    renderStatesList();
    setupSearch();
    loadAltarChecklistState();
    window.addEventListener('storage', loadAltarChecklistState);
    setup3DOfrendaScene();
    setupMapInteractions();
    setupGeolocationCalculator();
    initWebGLButtons();
});