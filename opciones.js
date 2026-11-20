/* ==========================================================================
   SPOOKIFY HALLOWEEN LOGIC & NATIVE WEBGL2 LIQUID CHROME ENGINE
   ========================================================================== */

/* MOTOR WEBGL2 LIQUID CHROME DE HALLOWEEN CON INTERACCIÓN DE ONDAS Y FLUIDOS */
function setupLiquidChrome() {
  const canvas = document.getElementById("liquid-chrome-canvas");
  if (!canvas) return;

  const PIXEL_BUDGET = 2.4e6;
  const SIM_CELL = 4;
  const SIM_STEP = 1 / 120;

  const VERTEX = `#version 300 es
const vec2 corners[3] = vec2[3](vec2(-1.0, -1.0), vec2(3.0, -1.0), vec2(-1.0, 3.0));
void main() {
  gl_Position = vec4(corners[gl_VertexID], 0.0, 1.0);
}`;

  const SIM = `#version 300 es
precision highp float;
uniform sampler2D uState;
uniform vec2 uSize;
uniform vec4 uStroke;
uniform vec2 uImpulse;
out vec4 fragColor;
float segment(vec2 p, vec2 a, vec2 b) {
  vec2 ab = b - a;
  float t = clamp(dot(p - a, ab) / max(dot(ab, ab), 1e-4), 0.0, 1.0);
  return length(p - a - ab * t);
}
void main() {
  vec2 texel = 1.0 / uSize;
  vec2 uv = gl_FragCoord.xy * texel;
  vec2 state = texture(uState, uv).rg;
  vec2 around =
    texture(uState, uv - vec2(texel.x, 0.0)).rg +
    texture(uState, uv + vec2(texel.x, 0.0)).rg +
    texture(uState, uv - vec2(0.0, texel.y)).rg +
    texture(uState, uv + vec2(0.0, texel.y)).rg -
    4.0 * state;
  float next = state.r + (state.r - state.g) * 0.982 + 0.3 * around.r + 0.08 * (around.r - around.g);
  next *= 0.998;
  if (uImpulse.x != 0.0) {
    float d = segment(gl_FragCoord.xy, uStroke.xy, uStroke.zw) / uImpulse.y;
    next += uImpulse.x * exp(-d * d);
  }
  fragColor = vec4(next, state.r, 0.0, 1.0);
}`;

  const SLOPE = `#version 300 es
precision highp float;
uniform sampler2D uState;
uniform vec2 uSize;
out vec4 fragColor;
void main() {
  vec2 texel = 1.0 / uSize;
  vec2 uv = gl_FragCoord.xy * texel;
  float left = texture(uState, uv - vec2(texel.x, 0.0)).r;
  float right = texture(uState, uv + vec2(texel.x, 0.0)).r;
  float down = texture(uState, uv - vec2(0.0, texel.y)).r;
  float up = texture(uState, uv + vec2(0.0, texel.y)).r;
  fragColor = vec4((right - left) * 0.5, (up - down) * 0.5, 0.0, 1.0);
}`;

  const CHROME = `#version 300 es
precision highp float;
uniform vec2 uResolution;
uniform float uUnit;
uniform float uTime;
uniform float uAmplitude;
uniform vec2 uFrequency;
uniform float uDetail;
uniform float uSharpness;
uniform float uDepth;
uniform float uPresence;
uniform vec3 uTint;
uniform vec2 uShift;
uniform float uRoughness;
uniform float uExposure;
uniform float uLight;
uniform sampler2D uSlope;
uniform vec2 uSlopeSize;
uniform float uRipple;
out vec4 fragColor;

vec2 slopeAt(vec2 uv) {
  vec2 st = uv * uSlopeSize - 0.5;
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
  vec2 h0 = (i - 0.5 + w1 / g0) / uSlopeSize;
  vec2 h1 = (i + 1.5 + w3 / g1) / uSlopeSize;
  vec2 a = texture(uSlope, vec2(h0.x, h0.y)).rg;
  vec2 b = texture(uSlope, vec2(h1.x, h0.y)).rg;
  vec2 c = texture(uSlope, vec2(h0.x, h1.y)).rg;
  vec2 d = texture(uSlope, vec2(h1.x, h1.y)).rg;
  return g0.y * (g0.x * a + g1.x * b) + g1.y * (g0.x * c + g1.x * d);
}

float lamp(vec2 p, vec2 center, vec2 size, float soft) {
  vec2 grown = size + soft;
  vec2 q = (p - center) / grown;
  q *= q;
  float d = sqrt(sqrt(dot(q, q)));
  float edge = soft / min(grown.x, grown.y);
  float shape = (1.0 - smoothstep(1.0 - edge, 1.0 + edge, d)) * (1.0 - 0.45 * d * d);
  return shape * size.x * size.y / (grown.x * grown.y);
}

vec3 studio(vec3 r, float blur) {
  vec2 p = r.xy / max(r.z + 1.0, 0.05);
  p += uShift * smoothstep(0.3, 1.0, length(p));
  float radius = length(p);
  float soft = 0.008 + blur;
  vec2 dir = p / max(radius, 1e-3);
  float key = lamp(p, vec2(-0.25, 0.42), vec2(0.3, 0.12), soft);
  float side = lamp(p, vec2(0.48, 0.12), vec2(0.06, 0.3), soft);
  float ground = lamp(p, vec2(-0.1, -0.55), vec2(0.45, 0.06), soft);
  float rise = smoothstep(-1.0, 1.0, dir.y);
  if (uLight > 0.5) {
    float edge = 0.008 + blur * 0.8;
    float lobe = smoothstep(0.15, 0.85, 0.5 + 0.5 * sin(atan(dir.y, dir.x) * 2.0 + 0.9));
    float tone = mix(2.4, 0.95, smoothstep(0.5 - edge, 1.0 + edge, radius));
    tone = mix(tone, 0.02, smoothstep(0.98 - edge, 1.12 + edge, radius));
    tone = mix(tone, mix(0.03, 0.3, lobe) * (0.8 + 0.4 * rise), smoothstep(1.15 - edge, 1.3 + edge, radius));
    float width = 0.035 + edge;
    tone += 2.4 * exp(-pow((radius - 1.4) / width, 2.0)) * min(1.0, 0.06 / width) * (0.6 + 0.4 * rise);
    return vec3(tone) * (1.0 - 0.5 * side) * (1.0 - 0.3 * ground) + 0.8 * key;
  }
  float width = 0.015 + soft * 2.0;
  float rim = exp(-abs(radius - 1.0) / width) * 0.031 / width * (0.8 + smoothstep(-0.5, 0.8, p.y));
  float band = 1.0 - 0.95 * smoothstep(1.04 - soft, 1.12 + soft, radius);
  float wall = smoothstep(1.25, 1.55, radius) * (0.6 + 0.4 * rise);
  float streak = smoothstep(0.2, 0.8, 0.5 + 0.5 * sin(atan(dir.y, dir.x) * 3.0 + 0.6));
  vec3 color = vec3(0.004, 0.004, 0.005) + 0.02 * smoothstep(-0.4, 0.6, p.y);
  color += vec3(1.0, 0.97, 0.94) * key * 4.0 + vec3(0.9, 0.95, 1.0) * side * 3.0 + ground * 1.2;
  color += vec3(1.0, 0.98, 0.95) * rim;
  color *= band;
  return color + vec3(mix(0.45, 1.8, streak)) * wall;
}

vec3 shade(vec2 slope, vec3 v, float blur, vec3 f0) {
  float steep = length(slope);
  slope *= 3.0 * tanh(steep / 3.0) / max(steep, 1e-6);
  vec3 n = normalize(vec3(-slope, 1.0));
  vec3 r = reflect(v, n);
  float facing = clamp(dot(n, -v), 0.0, 1.0);
  return studio(r, blur) * (f0 + (1.0 - f0) * pow(1.0 - facing, 5.0));
}

vec3 aces(vec3 x) {
  return clamp((x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14), 0.0, 1.0);
}

void main() {
  vec2 frag = gl_FragCoord.xy;
  vec2 uv = (2.0 * frag - uResolution) / uUnit;
  vec2 p = uv;
  vec2 rowX = vec2(1.0, 0.0);
  vec2 rowY = vec2(0.0, 1.0);
  float amplitude = uAmplitude * uPresence;
  for (float i = 1.0; i < 9.0; i++) {
    if (i > uDetail) break;
    float a = amplitude / i;
    float soften = exp(0.3 - 0.3 * i);
    float argX = i * uFrequency.x * p.y + uTime;
    p.x += a * cos(argX);
    rowX -= a * sin(argX) * i * uFrequency.x * soften * rowY;
    float argY = i * uFrequency.y * p.x + uTime;
    p.y += a * cos(argY);
    rowY -= a * sin(argY) * i * uFrequency.y * soften * rowX;
  }
  float phase = uTime - p.x - p.y;
  vec2 field = -(rowX + rowY);
  float density = max(length(field), 1e-3);
  vec2 across = field / density;
  float k = uSharpness;
  float sn = sin(phase);
  float cs = cos(phase);
  float th = tanh(k * sn);
  float bevel = (1.0 - th * th) / tanh(k);
  float fade = smoothstep(3.0, 9.0, 3.14159 * uUnit / density);
  float weight = uDepth * uPresence * fade;
  vec2 slope = k * cs * bevel * weight * across + slopeAt(frag / uResolution) * uRipple;
  vec2 sweep = -k * bevel * (sn + 2.0 * k * cs * cs * th) * weight * density * 2.0 / uUnit * across;
  vec2 stepX = dFdx(slope);
  vec2 stepY = dFdy(slope);
  vec2 crease = dot(stepX, stepX) > dot(stepY, stepY) ? stepX : stepY;
  if (dot(crease, crease) > dot(sweep, sweep)) sweep = crease;
  float bend = length(sweep);
  float alpha = smoothstep(0.0, 0.1, length(slope));
  vec3 f0 = mix(vec3(1.0), uTint, smoothstep(0.05, 0.6, length(slope))) * 0.92;
  vec3 v = normalize(vec3(uv * 0.08, -1.0));
  float blur = uRoughness * 0.35;
  vec3 light;
  if (bend < 0.01) {
    light = shade(slope, v, blur + bend * 0.5, f0);
  } else {
    light = vec3(0.0);
    for (float t = -0.375; t < 0.4; t += 0.25) {
      light += shade(slope + sweep * t, v, blur + bend * 0.15, f0);
    }
    light *= 0.25;
  }
  vec3 color = pow(aces(light * uExposure), vec3(1.0 / 2.2));
  float grain = fract(52.9829189 * fract(dot(frag, vec2(0.06711056, 0.00583715))));
  color += (grain - 0.5) / 255.0;
  fragColor = vec4(clamp(color, 0.0, 1.0) * alpha, alpha);
}`;

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

  const parseColor = (hex) => {
    const full = hex.replace('#', '');
    return [0, 2, 4].map(i => parseInt(full.slice(i, i + 2), 16) / 255);
  };

  const config = {
    color: "#cb5808",
    speed: 0.2,
    amplitude: 0.44,
    frequencyX: 3,
    frequencyY: 3,
    detail: 5,
    thickness: 0.85,
    depth: 1,
    roughness: 0.3,
    exposure: 1.15,
    interactive: true,
    rippleStrength: 1,
    rippleSize: 1,
    tilt: 0.3,
    maxRatio: 2
  };

  const tint = parseColor(config.color).map(c => Math.pow(c, 2.2));

  const gl = canvas.getContext('webgl2', {
    alpha: true,
    premultipliedAlpha: true,
    antialias: false,
    depth: false,
    stencil: false,
    powerPreference: 'high-performance'
  });

  if (!gl) return;

  const compile = (type, source) => {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    return shader;
  };

  const linkProgram = (fragSrc) => {
    const vert = compile(gl.VERTEX_SHADER, VERTEX);
    const frag = compile(gl.FRAGMENT_SHADER, fragSrc);
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

  const chrome = linkProgram(CHROME);
  const fluid = Boolean(gl.getExtension('EXT_color_buffer_float'));
  const sim = fluid ? linkProgram(SIM) : null;
  const slope = fluid ? linkProgram(SLOPE) : null;

  const vao = gl.createVertexArray();
  const grid = { width: 1, height: 1 };
  const targets = [];
  let slopeTarget = null;
  let current = 0;
  let unit = 1;
  const pointer = { x: 0, y: 0, inside: false, ready: false, nx: 0, ny: 0 };
  const view = { yaw: 0, pitch: 0, vyaw: 0, vpitch: 0 };
  const strokes = [];
  let time = Math.random() * 40;
  let presence = 1;
  let energy = 0;
  let accumulator = 0;
  let last = performance.now();

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
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    return { texture, framebuffer };
  };

  const dropTarget = t => {
    if (!t) return;
    gl.deleteTexture(t.texture);
    gl.deleteFramebuffer(t.framebuffer);
  };

  const resize = () => {
    const cssWidth = window.innerWidth;
    const cssHeight = window.innerHeight;
    const ratio = Math.min(window.devicePixelRatio || 1, config.maxRatio, Math.sqrt(PIXEL_BUDGET / (cssWidth * cssHeight)));
    const w = Math.max(1, Math.round(cssWidth * ratio));
    const h = Math.max(1, Math.round(cssHeight * ratio));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    unit = Math.min(w, h);
    if (!fluid || !sim || !slope) return;
    const gw = clamp(Math.round(cssWidth / SIM_CELL), 16, 512);
    const gh = clamp(Math.round(cssHeight / SIM_CELL), 16, 512);
    if (gw === grid.width && gh === grid.height && targets.length) return;
    targets.forEach(dropTarget);
    targets.length = 0;
    dropTarget(slopeTarget);
    grid.width = gw; grid.height = gh;
    targets.push(makeTarget(gw, gh), makeTarget(gw, gh));
    slopeTarget = makeTarget(gw, gh);
  };

  const simulate = steps => {
    if (!sim || !slope || !slopeTarget) return;
    gl.useProgram(sim.program);
    gl.viewport(0, 0, grid.width, grid.height);
    gl.uniform2f(sim.uniforms.uSize, grid.width, grid.height);
    gl.activeTexture(gl.TEXTURE0);
    gl.uniform1i(sim.uniforms.uState, 0);

    for (let step = 0; step < steps; step++) {
      const stroke = step === 0 ? strokes.shift() : null;
      if (stroke) {
        gl.uniform4f(sim.uniforms.uStroke, stroke.ax, stroke.ay, stroke.bx, stroke.by);
        gl.uniform2f(sim.uniforms.uImpulse, stroke.strength, stroke.radius);
      } else {
        gl.uniform2f(sim.uniforms.uImpulse, 0, 1);
      }
      const source = targets[current];
      const destination = targets[1 - current];
      gl.bindTexture(gl.TEXTURE_2D, source.texture);
      gl.bindFramebuffer(gl.FRAMEBUFFER, destination.framebuffer);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      current = 1 - current;
    }

    gl.useProgram(slope.program);
    gl.uniform2f(slope.uniforms.uSize, grid.width, grid.height);
    gl.uniform1i(slope.uniforms.uState, 0);
    gl.bindTexture(gl.TEXTURE_2D, targets[current].texture);
    gl.bindFramebuffer(gl.FRAMEBUFFER, slopeTarget.framebuffer);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };

  const render = () => {
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, canvas.width, canvas.height);
    const u = chrome.uniforms;
    gl.useProgram(chrome.program);
    gl.uniform2f(u.uResolution, canvas.width, canvas.height);
    gl.uniform1f(u.uUnit, unit);
    gl.uniform1f(u.uTime, time);
    gl.uniform1f(u.uAmplitude, config.amplitude);
    gl.uniform2f(u.uFrequency, config.frequencyX, config.frequencyY);
    gl.uniform1f(u.uDepth, config.depth);
    gl.uniform1f(u.uDetail, config.detail);
    gl.uniform1f(u.uSharpness, 5 / (3 * config.thickness));
    gl.uniform1f(u.uPresence, presence);
    gl.uniform3fv(u.uTint, tint);
    gl.uniform2f(u.uShift, view.yaw, view.pitch);
    gl.uniform1f(u.uRoughness, config.roughness);
    gl.uniform1f(u.uExposure, config.exposure);
    gl.uniform1f(u.uLight, 0);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, slopeTarget ? slopeTarget.texture : null);
    gl.uniform1i(u.uSlope, 0);
    gl.uniform2f(u.uSlopeSize, grid.width, grid.height);
    gl.uniform1f(u.uRipple, slopeTarget ? config.rippleStrength * 2.2 : 0);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };

  const frame = now => {
    const dt = clamp((now - last) / 1000 || 0, 0, 0.05);
    last = now;
    time += dt * config.speed;

    const targetYaw = (pointer.inside ? pointer.nx * 0.35 : 0.22 * Math.sin(time * 1.3)) * config.tilt;
    const targetPitch = (pointer.inside ? -pointer.ny * 0.28 : 0.16 * Math.sin(time * 0.9 + 1.7)) * config.tilt;

    view.vyaw += ((targetYaw - view.yaw) * 36 - view.vyaw * 11.4) * dt;
    view.vpitch += ((targetPitch - view.pitch) * 36 - view.vpitch * 11.4) * dt;
    view.yaw += view.vyaw * dt;
    view.pitch += view.vpitch * dt;

    gl.bindVertexArray(vao);
    if (slopeTarget) {
      accumulator += dt;
      const steps = Math.min(4, Math.floor(accumulator / SIM_STEP));
      accumulator -= steps * SIM_STEP;
      if (steps > 0) {
        simulate(steps);
        energy = Math.max(0, energy * Math.pow(0.982, steps));
      }
    }
    render();
    requestAnimationFrame(frame);
  };

  const pushStroke = (stroke) => {
    if (!slopeTarget) return;
    strokes.push(stroke);
    if (strokes.length > 6) strokes.shift();
    energy = 1;
  };

  window.addEventListener('pointermove', e => {
    const gx = (e.clientX / window.innerWidth) * grid.width;
    const gy = (1 - e.clientY / window.innerHeight) * grid.height;
    pointer.nx = (e.clientX / window.innerWidth) * 2 - 1;
    pointer.ny = (e.clientY / window.innerHeight) * 2 - 1;
    pointer.inside = true;

    if (pointer.ready) {
      const travel = Math.hypot(gx - pointer.x, gy - pointer.y);
      if (travel > 0.25) {
        pushStroke({
          ax: pointer.x, ay: pointer.y,
          bx: gx, by: gy,
          strength: -Math.min(0.45, 0.04 + travel * 0.045) * config.rippleSize,
          radius: 4 * config.rippleSize
        });
      }
    }
    pointer.x = gx; pointer.y = gy; pointer.ready = true;
  }, { passive: true });

  window.addEventListener('pointerdown', e => {
    const gx = (e.clientX / window.innerWidth) * grid.width;
    const gy = (1 - e.clientY / window.innerHeight) * grid.height;
    pushStroke({ ax: gx, ay: gy, bx: gx, by: gy, strength: -1.6 * config.rippleSize, radius: 6 * config.rippleSize });
  }, { passive: true });

  window.addEventListener('resize', resize);
  resize();
  requestAnimationFrame(frame);
}

/* GENERADOR DE ATMÓSFERA DE TERROR: BRASAS FLOTANTES Y RELÁMPAGOS */
function setupHorrorAtmosphere() {
  const embersContainer = document.getElementById("horror-embers");
  const lightning = document.getElementById("horror-lightning");

  if (embersContainer) {
    for (let i = 0; i < 24; i++) {
      const ember = document.createElement("span");
      ember.className = "ember-particle";
      const size = Math.random() * 4 + 2;
      ember.style.width = `${size}px`;
      ember.style.height = `${size}px`;
      ember.style.left = `${Math.random() * 100}%`;
      ember.style.animationDuration = `${Math.random() * 7 + 6}s`;
      ember.style.animationDelay = `${Math.random() * 8}s`;
      ember.style.setProperty("--drift", `${(Math.random() - 0.5) * 140}px`);
      embersContainer.appendChild(ember);
    }
  }

  if (lightning) {
    setInterval(() => {
      if (Math.random() > 0.55) {
        lightning.classList.add("flash");
        setTimeout(() => lightning.classList.remove("flash"), 110);
        setTimeout(() => {
          lightning.classList.add("flash");
          setTimeout(() => lightning.classList.remove("flash"), 70);
        }, 180);
      }
    }, 6500);
  }
}

/* INYECTOR DE BICHOS, GUSANOS, ARAÑAS Y SANGRE GOTEANDO SOBRE LAS TARJETAS */
const SPIDER_SVG = `
<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
  <g stroke="#080408" stroke-width="3.2" stroke-linecap="round">
    <path d="M26 26 L12 12 L4 18"/>
    <path d="M25 31 L8 26 L2 34"/>
    <path d="M25 36 L9 42 L3 50"/>
    <path d="M27 40 L14 54 L9 61"/>
    <path d="M38 26 L52 12 L60 18"/>
    <path d="M39 31 L56 26 L62 34"/>
    <path d="M39 36 L55 42 L61 50"/>
    <path d="M37 40 L50 54 L55 61"/>
  </g>
  <ellipse cx="32" cy="40" rx="9" ry="11" fill="#12080d" stroke="#2d0810" stroke-width="1.5"/>
  <circle cx="32" cy="25" r="6" fill="#0d0508"/>
  <path d="M29 38 L32 34 L35 38 L32 42 Z" fill="#e60019"/>
  <circle cx="30" cy="21" r="1.3" fill="#ff2a00"/>
  <circle cx="34" cy="21" r="1.3" fill="#ff2a00"/>
</svg>`;

function infestCard(cardElement, index = 0) {
  if (!cardElement || cardElement.querySelector(".creepy-infestation-layer")) return;

  const layer = document.createElement("div");
  layer.className = "creepy-infestation-layer";

  const drip1Pos = 16 + ((index * 17) % 25);
  const drip2Pos = 55 + ((index * 13) % 28);
  const fallPos = 32 + ((index * 19) % 40);

  layer.innerHTML = `
    <div class="blood-edge-bar"></div>
    <span class="blood-drip" style="left:${drip1Pos}%; --drip-max:${22 + (index % 4) * 5}px; animation-duration:${3.4 + (index % 3)}s;"></span>
    <span class="blood-drip" style="left:${drip2Pos}%; --drip-max:${18 + (index % 3) * 6}px; animation-duration:${4.1 + (index % 2)}s; animation-delay:1.1s;"></span>
    <span class="blood-falling-drop" style="left:${fallPos}%; animation-duration:${3.6 + (index % 3) * 0.8}s; animation-delay:${(index % 4) * 0.7}s;"></span>

    <div class="edge-crawler-spider crawler-top" style="--crawl-speed:${8 + (index % 4) * 1.5}s; animation-delay:-${index * 1.4}s;">
      ${SPIDER_SVG}
    </div>

    <div class="edge-crawler-spider crawler-side" style="--crawl-speed:${10 + (index % 3) * 2}s; animation-delay:-${index * 2.1}s;">
      ${SPIDER_SVG}
    </div>

    <div class="creepy-worm worm-bottom-left" style="--worm-speed:${2.8 + (index % 3) * 0.6}s; animation-delay:-${index * 0.5}s;"></div>
    <div class="creepy-worm worm-top-right" style="--worm-speed:${3.3 + (index % 2) * 0.7}s; animation-delay:-${index * 0.9}s;"></div>
  `;

  cardElement.appendChild(layer);
}

function setupCardInfestation() {
  document.querySelectorAll(".cat-card.creepy-infested").forEach((card, idx) => {
    infestCard(card, idx);
  });
}

/* EFECTO SPOTLIGHT INTERACTIVO EN TARJETAS DE CATEGORÍA Y PROYECTOS */
function setupCardSpotlight() {
  document.addEventListener("mousemove", (e) => {
    const card = e.target.closest(".cat-card, .spooky-item-card");
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    card.style.setProperty("--mx", `${x}px`);
    card.style.setProperty("--my", `${y}px`);
  });
}

/* CURSOR DOBLE GPU 1:1 */
function setupCursor() {
  const cursorDot = document.querySelector(".cursor");
  const cursorFollower = document.querySelector(".cursor-follower");

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let followerX = mouseX;
  let followerY = mouseY;

  document.addEventListener("mouseleave", () => document.body.classList.add("cursor-out"));
  document.addEventListener("mouseenter", () => document.body.classList.remove("cursor-out"));

  document.addEventListener("mousemove", (e) => {
    document.body.classList.remove("cursor-out");
    mouseX = e.clientX; 
    mouseY = e.clientY;

    if (cursorDot) {
      cursorDot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;
    }
  });

  document.addEventListener("mouseover", (e) => {
    if (e.target.closest("a, button, input, label, .card, .tag, .toggle, .spooky-item-card")) {
      if (cursorFollower) cursorFollower.classList.add("active");
    } else {
      if (cursorFollower) cursorFollower.classList.remove("active");
    }
  });

  function animateFollower() {
    followerX += (mouseX - followerX) * 0.85;
    followerY += (mouseY - followerY) * 0.85;

    if (cursorFollower) {
      cursorFollower.style.transform = `translate3d(${followerX}px, ${followerY}px, 0) translate(-50%, -50%)`;
    }
    requestAnimationFrame(animateFollower);
  }
  animateFollower();
}

/* COUNTDOWN TIMER */
function setupCountdown() {
  const now = new Date();
  const target = new Date(now.getFullYear(), 9, 31, 0, 0, 0);

  const countdown = {
    days: document.getElementById("days"),
    hours: document.getElementById("hours"),
    minutes: document.getElementById("minutes"),
    seconds: document.getElementById("seconds")
  };

  if (now > target) target.setFullYear(now.getFullYear() + 1);

  const update = () => {
    const diff = target - new Date();
    const time = {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((diff / (1000 * 60)) % 60),
      seconds: Math.floor((diff / 1000) % 60)
    };

    for (const key in countdown) {
      if (countdown[key]) countdown[key].textContent = String(time[key]).padStart(2, "0");
    }
  };

  update();
  setInterval(update, 1000);
}

/* ANIMACIÓN DE TEXTO */
function setupContent() {
  try {
    const title = document.querySelector(".heading h1");
    const paragraph = document.querySelector(".heading p");

    if (title) {
      const rawText = title.innerText.trim();
      if (rawText) {
        const words = rawText.split(/\s+/);
        title.innerHTML = "";

        words.forEach((word, wIndex) => {
          const span = document.createElement("span");
          span.classList.add("word");

          [...word].forEach((item, i) => {
            const char = document.createElement("span");
            char.textContent = item;
            char.style.animationDelay = `${wIndex * 0.15 + i * 0.02}s`;
            span.appendChild(char);
          });

          title.appendChild(span);
          title.appendChild(document.createTextNode(" "));
        });
      }
    }

    if (paragraph) paragraph.classList.add("visible");
  } catch (err) {
    const paragraph = document.querySelector(".heading p");
    if (paragraph) paragraph.classList.add("visible");
  }
}

/* OJOS QUE SIGUEN AL CURSOR */
function setupEyes() {
  const eyes = [...document.querySelectorAll(".eye")];
  if (!eyes.length) return;

  let mouseX = 0; let mouseY = 0;
  const max = 10;
  const offsets = Array.from(eyes).map(() => ({ x: 0, y: 0 }));

  document.addEventListener("mousemove", (event) => {
    mouseX = event.clientX; mouseY = event.clientY;
  });

  const animate = () => {
    eyes.forEach((eye, i) => {
      const rect = eye.getBoundingClientRect();
      const eyeX = rect.left + rect.width / 2;
      const eyeY = rect.top + rect.height / 2;

      const deltaX = (mouseX - eyeX) / 10;
      const deltaY = (mouseY - eyeY) / 8;

      const targetX = Math.max(-max, Math.min(deltaX, max));
      const targetY = Math.max(-max, Math.min(deltaY, max));

      offsets[i].x += (targetX - offsets[i].x) * 0.08;
      offsets[i].y += (targetY - offsets[i].y) * 0.08;

      eye.style.transform = `translate(${offsets[i].x}px, ${offsets[i].y}px)`;
    });

    requestAnimationFrame(animate);
  };

  animate();
}

/* ARAÑAS ANIMADAS DEL TECHO */
function setupSpiders() {
  const spiders = [...document.querySelectorAll(".spider")];
  const positions = [10, 25, 45, 65, 85];
  const heights = [120, 80, 50, 100, 150];

  spiders.forEach((spider, i) => {
    spider.style.left = positions[i] + "%";
    spider.style.animationDelay = i * 0.3 + "s";
    spider.style.setProperty("--spider-line-height", heights[i] + "px");
  });
}

/* INTERRUPTOR DE APAGADO */
function setupShutdownToggle() {
  const btnShutdown = document.getElementById("btn");
  if (btnShutdown) {
    btnShutdown.addEventListener("change", function () {
      if (!this.checked) {
        document.querySelector(".page-opciones").classList.add("power-off");
        setTimeout(() => { window.location.href = "index.html"; }, 900);
      }
    });
  }
}

/* ==========================================================================
   BASE DE DATOS COMPLETA DE LAS 4 CATEGORÍAS (CON IMÁGENES LOCALES EN CARPETA imagenes/)
   ========================================================================== */
const FALLBACK_SPOOKY_IMG = "imagenes/paso-lapida.jpg";

const IMG_STEP = {
  carton: "imagenes/paso-carton.jpg",
  pintura: "imagenes/paso-pintura.jpg",
  velas: "imagenes/paso-velas.jpg",
  fantasma: "imagenes/paso-fantasma.jpg",
  murcielago: "imagenes/paso-murcielago.webp",
  frascos: "imagenes/paso-frascos.jpg",
  lapida: "imagenes/paso-lapida.jpg",
  calabaza: "imagenes/paso-calabaza.jpg",
  bebida: "imagenes/paso-bebida.jpg",
  postre: "imagenes/paso-postre.jpg",
  maquillaje: "imagenes/paso-maquillaje.jpg"
};

const HALLOWEEN_DATA = {
  decoracion: {
    titulo: "🎃 DECORACIÓN Y AMBIENTACIÓN DE TERROR",
    items: [
      {
        tipo: "diy",
        badge: "DIY • FÁCIL",
        tagExtra: "45 MIN",
        titulo: "Lápidas de Cementerio Realistas en Cartón",
        desc: "Crea lápidas envejecidas con textura de piedra usando cajas de cartón recicladas y pintura acrílica.",
        meta: "Costo aprox: $60 MXN",
        img: "imagenes/deco-lapidas.jpg",
        materiales: [
          "Cajas de cartón grueso (de electrodomésticos o mudanza)",
          "Silicón caliente y cúter",
          "Pintura acrílica gris, negra y blanca + esponja",
          "2 palitos de madera o varillas para clavar en el pasto"
        ],
        pasos: [
          {
            texto: "Dibuja la silueta de una lápida clásica (arco superior o cruz) sobre dos piezas iguales de cartón y recórtalas con cúter.",
            img: IMG_STEP.carton
          },
          {
            texto: "Pega tiras de cartón de 4 cm de ancho en todo el borde entre ambas caras para darle grosor real en 3D y recorta las letras 'R.I.P.'.",
            img: IMG_STEP.carton
          },
          {
            texto: "Pinta toda la lápida de gris oscuro; luego da toques secos con una esponja usando gris claro y blanco para simular textura de piedra.",
            img: IMG_STEP.pintura
          },
          {
            texto: "Sella con barniz transparente en aerosol si irá en jardín y pega los palitos por detrás para clavarla en el pasto.",
            img: IMG_STEP.lapida
          }
        ]
      },
      {
        tipo: "diy",
        badge: "DIY • VIRAL",
        tagExtra: "30 MIN",
        titulo: "Velas Flotantes Estilo Hogwarts",
        desc: "Tubos de cartón reciclados convertidos en velas suspendidas del techo con luz LED cálida.",
        meta: "Costo aprox: $85 MXN",
        img: "imagenes/deco-velas.jpg",
        materiales: [
          "10 a 15 tubos de papel higiénico o servitoallas",
          "Pistola de silicón caliente y pintura blanca",
          "Velas LED pequeñas de batería",
          "Hilo transparente (de pescar) y cinta adhesiva"
        ],
        pasos: [
          {
            texto: "Aplica gotas gruesas de silicón caliente alrededor del borde superior de cada tubo dejando que escurra como cera derretida.",
            img: IMG_STEP.carton
          },
          {
            texto: "Pinta todo el tubo (incluyendo el silicón seco) con dos capas de pintura acrílica blanca o marfil.",
            img: IMG_STEP.pintura
          },
          {
            texto: "Amarra un trozo de hilo de pescar cruzando la boca superior del tubo para crear un soporte interno.",
            img: IMG_STEP.velas
          },
          {
            texto: "Coloca la vela LED encendida apoyada sobre ese cruce de hilo y cuelga el otro extremo del hilo al techo.",
            img: IMG_STEP.velas
          }
        ]
      },
      {
        tipo: "diy",
        badge: "DIY • EXTERIOR",
        tagExtra: "1 HORA",
        titulo: "Fantasmas Iluminados de Gasa y Globo",
        desc: "Espectros translúcidos que brillan en la oscuridad para colgar en árboles, balcones o entradas.",
        meta: "Costo aprox: $90 MXN",
        img: "imagenes/deco-fantasmas.jpg",
        materiales: [
          "Tela de gasa blanca (manta de cielo)",
          "Pegamento blanco escolar mezclado con agua (50/50)",
          "1 globo inflado, 1 botella de plástico y alambre",
          "Fieltro negro y serie de luces LED"
        ],
        pasos: [
          {
            texto: "Coloca el globo inflado sobre la boca de la botella y forma dos brazos extendidos con alambre hacia los lados.",
            img: IMG_STEP.carton
          },
          {
            texto: "Sumerge la gasa en la mezcla de pegamento con agua, exprime el exceso y colócala sobre la estructura dejando secar toda la noche.",
            img: IMG_STEP.fantasma
          },
          {
            texto: "Revienta el globo por debajo, pega ojos de fieltro negro y mete una serie de luces LED en el interior.",
            img: IMG_STEP.fantasma
          }
        ]
      },
      {
        tipo: "diy",
        badge: "DIY • VENTANAS",
        tagExtra: "25 MIN",
        titulo: "Siluetas Gigantes de Brujas y Murciélagos",
        desc: "Sombras dramáticas retroiluminadas para ventanas y paredes usando cartulina negra.",
        meta: "Costo aprox: $45 MXN",
        img: "imagenes/deco-murcielagos.jpg",
        materiales: [
          "Pliegos de cartulina negra mate",
          "Plantillas impresas de murciélagos y gatos",
          "Tijeras y cinta doble cara removible"
        ],
        pasos: [
          {
            texto: "Dobla la cartulina a la mitad, dibuja medio murciélago en el doblez y recorta para obtener alas simétricas.",
            img: IMG_STEP.carton
          },
          {
            texto: "Dobla ligeramente las alas hacia afuera para dar efecto 3D de vuelo.",
            img: IMG_STEP.murcielago
          },
          {
            texto: "Pégalos en formación ascendente desde una esquina de la pared o ventana hasta el techo.",
            img: IMG_STEP.murcielago
          }
        ]
      },
      {
        tipo: "diy",
        badge: "DIY • MESA",
        tagExtra: "40 MIN",
        titulo: "Frascos de Boticario y Pociones Antiguas",
        desc: "Botellas de vidrio recicladas con etiquetas envejecidas con café y contenido misterioso.",
        meta: "Costo aprox: $50 MXN",
        img: "imagenes/deco-frascos.jpg",
        materiales: [
          "Frascos y botellas de vidrio vacías",
          "Hojas de papel envejecidas con café soluble",
          "Colorante vegetal, aceite de bebé y hierbas secas"
        ],
        pasos: [
          {
            texto: "Humedece hojas blancas con café cargado, déjalas secar y quema ligeramente las orillas con cuidado.",
            img: IMG_STEP.pintura
          },
          {
            texto: "Escribe nombres como 'Veneno de Araña' o 'Elixir Lunar' y pégalas en los frascos limpiados sin etiquetas.",
            img: IMG_STEP.frascos
          },
          {
            texto: "Llena los frascos con agua teñida de morado o verde y añade ramas secas o arañas de plástico.",
            img: IMG_STEP.frascos
          }
        ]
      },
      {
        tipo: "diy",
        badge: "DIY • ENTRADA",
        tagExtra: "50 MIN",
        titulo: "Corona de Puerta con Serpientes y Flores Negras",
        desc: "Aro decorativo gótico para recibir a tus invitados en la puerta principal.",
        meta: "Costo aprox: $140 MXN",
        img: "imagenes/deco-corona.jpg",
        materiales: [
          "Aro de unicel o ramas secas entrelazadas",
          "Serpientes de juguete de plástico",
          "Pintura en aerosol negro mate y rosas artificiales oscuras"
        ],
        pasos: [
          {
            texto: "Enreda las serpientes de plástico alrededor del aro asegurándolas con silicón caliente.",
            img: IMG_STEP.carton
          },
          {
            texto: "Rocía toda la estructura con pintura en aerosol negro mate para unificar la textura.",
            img: IMG_STEP.pintura
          },
          {
            texto: "Inserta rosas artificiales color vino o negro en un costado y cuelga con listón de terciopelo.",
            img: IMG_STEP.lapida
          }
        ]
      },
      {
        tipo: "productos",
        badge: "TOP VENTAS #1",
        tagExtra: "MÁS COMPRADO",
        titulo: "Telaraña Elástica Gigante + 60 Arañas",
        desc: "Algodón sintético ultra elástico que cubre hasta 30 m² de paredes, muebles y arbustos.",
        meta: "$130 – $240 MXN",
        img: "imagenes/prod-telarana.jpg",
        especificaciones: [
          "Peso: 200g a 300g de fibra blanca de alta elasticidad",
          "Incluye: 30 a 60 arañas negras de plástico realista",
          "Uso: Interior y exterior (se estira entre más la jalas)"
        ],
        amazonUrl: "https://www.amazon.com.mx/s?k=telarana+gigante+halloween+con+aranas",
        mlUrl: "https://listado.mercadolibre.com.mx/telarana-gigante-halloween-aranas"
      },
      {
        tipo: "productos",
        badge: "TOP VENTAS #2",
        tagExtra: "AMBIENTE",
        titulo: "Máquina de Humo 500W con Luces LED RGB",
        desc: "Genera niebla densa en segundos con control remoto inalámbrico para efecto de cementerio.",
        meta: "$690 – $1,250 MXN",
        img: "imagenes/prod-humo.jpg",
        especificaciones: [
          "Potencia: 500W con tanque de 300 ml (requiere líquido para humo)",
          "Iluminación: 3 LEDs RGB integrados en la boquilla",
          "Control: Mando inalámbrico a distancia incluido"
        ],
        amazonUrl: "https://www.amazon.com.mx/s?k=maquina+de+humo+500w+halloween+luces+led",
        mlUrl: "https://listado.mercadolibre.com.mx/maquina-de-humo-500w-led"
      },
      {
        tipo: "productos",
        badge: "TOP VENTAS #3",
        tagExtra: "ILUMINACIÓN",
        titulo: "Serie LED 3D Calabazas, Fantasmas y Murciélagos",
        desc: "Guirnalda de 3 a 6 metros con 20-40 figuras iluminadas, funciona con pilas o USB.",
        meta: "$140 – $280 MXN",
        img: "imagenes/prod-serie-led.jpg",
        especificaciones: [
          "Longitud: 3 metros con 20 luces LED cálidas",
          "Modos: Luz fija y parpadeo intermitente",
          "Alimentación: 3 pilas AA (portátil para cualquier rincón)"
        ],
        amazonUrl: "https://www.amazon.com.mx/s?k=serie+luces+led+halloween+calabazas+fantasmas",
        mlUrl: "https://listado.mercadolibre.com.mx/serie-luces-led-halloween-calabazas"
      },
      {
        tipo: "productos",
        badge: "TOP VENTAS #4",
        tagExtra: "EXTERIOR",
        titulo: "Calabaza Inflable Gigante 1.8m con Luz Interna",
        desc: "Inflable auto-hinchable con turbina silenciosa, estacas para suelo y LEDs internos.",
        meta: "$650 – $1,390 MXN",
        img: "imagenes/prod-inflable.jpg",
        especificaciones: [
          "Material: Poliéster impermeable resistente a intemperie",
          "Inflado: Automático en 60 segundos al conectarlo",
          "Accesorios: 4 estacas y cuerdas de sujeción"
        ],
        amazonUrl: "https://www.amazon.com.mx/s?k=inflable+halloween+gigante+calabaza+luz+led",
        mlUrl: "https://listado.mercadolibre.com.mx/inflable-halloween-gigante-calabaza"
      },
      {
        tipo: "productos",
        badge: "TOP VENTAS #5",
        tagExtra: "EFECTO 3D",
        titulo: "Set 60 Murciélagos 3D de PVC Adhesivos",
        desc: "Diferentes tamaños con alas plegables para decorar paredes, espejos y escaleras.",
        meta: "$95 – $180 MXN",
        img: "imagenes/prod-murcielagos3d.jpg",
        especificaciones: [
          "Material: PVC negro resistente al agua (reutilizables)",
          "Tamaños: 4 tamaños distintos (de 8 cm hasta 16 cm)",
          "Adhesivo: Cuadros de espuma doble cara que no dañan pintura"
        ],
        amazonUrl: "https://www.amazon.com.mx/s?k=murcielagos+3d+halloween+decoracion+pared",
        mlUrl: "https://listado.mercadolibre.com.mx/murcielagos-3d-halloween-pared"
      },
      {
        tipo: "productos",
        badge: "TOP VENTAS #6",
        tagExtra: "PARED",
        titulo: "Cortina Metálica Negra y Naranja + Banderines",
        desc: "Set completo de fondo para fotos con flecos brillantes y guirnalda de 'Happy Halloween'.",
        meta: "$150 – $290 MXN",
        img: "imagenes/prod-cortina.jpg",
        especificaciones: [
          "Medidas cortina: 1m x 2m cada panel",
          "Incluye: Banderín de cartulina, globos confeti y cinta",
          "Ideal para: Cabina de fotos o mesa de dulces"
        ],
        amazonUrl: "https://www.amazon.com.mx/s?k=set+decoracion+halloween+cortina+metalica+globos",
        mlUrl: "https://listado.mercadolibre.com.mx/kit-decoracion-halloween-cortina-globos"
      }
    ]
  },

  animatronicos: {
    titulo: "🤖 ANIMATRÓNICOS Y MECANISMOS DE SUSTO",
    items: [
      {
        tipo: "diy",
        badge: "DIY MECÁNICO",
        tagExtra: "1.5 HRS",
        titulo: "Cuadro Embrujado con Ojos que Te Siguen",
        desc: "Retrato antiguo con cuencas huecas donde unos ojos iluminados se mueven al pasar.",
        meta: "Costo aprox: $120 MXN",
        img: "imagenes/anim-cuadro.jpg",
        materiales: [
          "Marco viejo y fotografía impresa en blanco y negro",
          "2 pelotas de ping-pong pintadas como ojos",
          "Cartón, varilla de madera y luz LED roja pequeña"
        ],
        pasos: [
          {
            texto: "Recorta cuidadosamente los ojos de la fotografía impresa y pégala sobre un cartón rígido con los mismos huecos.",
            img: IMG_STEP.carton
          },
          {
            texto: "Pega las dos pelotas de ping-pong sobre una tira de cartón separadas a la distancia exacta de los ojos y píntales pupilas rojas.",
            img: IMG_STEP.pintura
          },
          {
            texto: "Sujeta la tira por detrás dejando holgura para que se deslice e ilumina los ojos por detrás con un LED tenue.",
            img: IMG_STEP.murcielago
          }
        ]
      },
      {
        tipo: "diy",
        badge: "DIY • JARDÍN",
        tagExtra: "1 HORA",
        titulo: "Esqueleto Saliendo de la Tierra con Luz Interna",
        desc: "Cráneo y brazos articulados emergiendo de una tumba recién excavada con brillo espectral.",
        meta: "Costo aprox: $180 MXN",
        img: "imagenes/anim-esqueleto-tierra.jpg",
        materiales: [
          "Cráneo y manos de esqueleto de plástico",
          "Tierra suelta o corteza de jardín",
          "Reflector LED verde o naranja pequeño"
        ],
        pasos: [
          {
            texto: "Entierra parcialmente la base del cráneo inclinado mirando hacia arriba y clava las muñecas a ambos lados.",
            img: IMG_STEP.lapida
          },
          {
            texto: "Apila tierra suelta y hojas secas alrededor de los huesos para simular que acaba de romper el suelo.",
            img: IMG_STEP.frascos
          },
          {
            texto: "Esconde el reflector LED verde o naranja frente al cráneo apuntando hacia su mandíbula.",
            img: IMG_STEP.velas
          }
        ]
      },
      {
        tipo: "diy",
        badge: "DIY • PUERTA",
        tagExtra: "45 MIN",
        titulo: "Aldaba de Puerta Parlante con Sensor",
        desc: "Usa una bocina Bluetooth oculta detrás de una aldaba de león o calavera para asustar al tocar.",
        meta: "Costo aprox: $70 MXN",
        img: "imagenes/anim-aldaba.jpg",
        materiales: [
          "Calavera de unicel pintada en bronce envejecido",
          "Argolla gruesa de plástico o cartón pintado",
          "Bocina mini Bluetooth y celular con efectos de sonido"
        ],
        pasos: [
          {
            texto: "Pinta la calavera de negro y cepilla en seco con pintura metálica bronce o plata para darle aspecto antiguo.",
            img: IMG_STEP.pintura
          },
          {
            texto: "Coloca la argolla en la mandíbula y fíjala en la puerta principal con cinta de montaje.",
            img: IMG_STEP.carton
          },
          {
            texto: "Oculta la mini bocina detrás de la puerta y reproduce risas macabras o gruñidos cuando alguien se acerque.",
            img: IMG_STEP.frascos
          }
        ]
      },
      {
        tipo: "diy",
        badge: "DIY • ESQUINA",
        tagExtra: "1.5 HRS",
        titulo: "Segador Gigante de 2 Metros con Escoba",
        desc: "Figura de tamaño real hecha con tubos de PVC, bola de unicel y tela negra desgarrada.",
        meta: "Costo aprox: $220 MXN",
        img: "imagenes/anim-segador.jpg",
        materiales: [
          "Tubos de PVC de 1/2 pulgada y conectores T",
          "Calavera de plástico y túnica o tela negra grande",
          "2 luces LED rojas de botón para los ojos"
        ],
        pasos: [
          {
            texto: "Arma una cruz de PVC de 1.90 m de alto con base firme en el suelo y brazos de 80 cm.",
            img: IMG_STEP.carton
          },
          {
            texto: "Inserta la calavera en la punta superior con dos LEDs rojos pegados dentro de las cuencas.",
            img: IMG_STEP.lapida
          },
          {
            texto: "Viste la estructura con tela negra desflecada en las puntas para que se mueva con el viento.",
            img: IMG_STEP.fantasma
          }
        ]
      },
      {
        tipo: "diy",
        badge: "DIY • VENTANA",
        tagExtra: "40 MIN",
        titulo: "Proyección Holográfica de Fantasmas en Cortina",
        desc: "Convierte una cortina traslúcida en un portal de apariciones usando un proyector o TV.",
        meta: "Costo aprox: $50 MXN",
        img: "imagenes/anim-holograma.jpg",
        materiales: [
          "Cortina de baño semi-translúcida o tela mosquitera gris",
          "Proyector portátil o monitor viejo",
          "Videos de fantasmas con fondo negro (gratis en YouTube)"
        ],
        pasos: [
          {
            texto: "Tensa la tela traslúcida cubriendo todo el marco interior de la ventana que da a la calle.",
            img: IMG_STEP.fantasma
          },
          {
            texto: "Coloca el proyector a 1.5 metros detrás de la ventana apuntando directo a la tela.",
            img: IMG_STEP.velas
          },
          {
            texto: "Reproduce en bucle un video de apariciones con fondo negro total; desde afuera parecerá un fantasma flotando.",
            img: IMG_STEP.murcielago
          }
        ]
      },
      {
        tipo: "diy",
        badge: "DIY • DULCES",
        tagExtra: "30 MIN",
        titulo: "Tazón de Dulces con Mano Trampa",
        desc: "Un guante relleno oculto en el fondo de un recipiente hondo que salta cuando meten la mano.",
        meta: "Costo aprox: $60 MXN",
        img: "imagenes/anim-tazon-mano.jpg",
        materiales: [
          "Caldero o tazón grande de plástico",
          "Guante de látex o esqueleto relleno de algodón",
          "Falso fondo de cartón recortado"
        ],
        pasos: [
          {
            texto: "Haz un agujero en la base del caldero lo suficientemente ancho para que pase tu brazo.",
            img: IMG_STEP.carton
          },
          {
            texto: "Coloca un disco de cartón negro dentro con abertura oculta y acomoda dulces alrededor del borde.",
            img: IMG_STEP.calabaza
          },
          {
            texto: "Mete la mano con el guante desde abajo y muévela justo cuando alguien tome un dulce.",
            img: IMG_STEP.lapida
          }
        ]
      },
      {
        tipo: "productos",
        badge: "TOP ANIMATRÓNICO #1",
        tagExtra: "SENSOR DE VOZ",
        titulo: "Bruja o Payaso Colgante 1.7m con Sensor de Sonido",
        desc: "Se activa con aplausos o pasos: enciende ojos LED rojos, mueve brazos y emite gritos.",
        meta: "$580 – $1,290 MXN",
        img: "imagenes/prod-bruja-colgante.jpg",
        especificaciones: [
          "Altura: 170 cm con cuerda superior para colgar",
          "Activación: Sensor acústico y táctil integrado",
          "Alimentación: 3 pilas AAA (incluye movimiento y audio)"
        ],
        amazonUrl: "https://www.amazon.com.mx/s?k=animatronico+halloween+colgante+sensor+sonido+luces",
        mlUrl: "https://listado.mercadolibre.com.mx/animatronico-halloween-sensor-sonido"
      },
      {
        tipo: "productos",
        badge: "TOP ANIMATRÓNICO #2",
        tagExtra: "VIRAL TIKTOK",
        titulo: "Mano Caminante 'Dedos' (Thing) Articulada con Sensor",
        desc: "Réplica de látex realista que camina sola sobre mesas y pisos al detectar movimiento.",
        meta: "$320 – $680 MXN",
        img: "imagenes/prod-mano-dedos.jpg",
        especificaciones: [
          "Material: Látex suave con detalles de costuras realistas",
          "Función: Desplazamiento motorizado al detectar sonido/tacto",
          "Ideal para: Centros de mesa y entradas"
        ],
        amazonUrl: "https://www.amazon.com.mx/s?k=mano+caminante+halloween+animatronica+dedos",
        mlUrl: "https://listado.mercadolibre.com.mx/mano-caminante-halloween-sensor"
      },
      {
        tipo: "productos",
        badge: "TOP ANIMATRÓNICO #3",
        tagExtra: "TAMAÑO REAL",
        titulo: "Esqueleto Posable Articulado 165 cm (5.4 Pies)",
        desc: "Esqueleto completo con mandíbula móvil y articulaciones bloqueables para sentar o colgar.",
        meta: "$790 – $1,450 MXN",
        img: "imagenes/prod-esqueleto-real.jpg",
        especificaciones: [
          "Altura: 165 cm (tamaño adulto real)",
          "Articulaciones: Hombros, codos, muñecas, rodillas y mandíbula",
          "Material: Plástico ABS resistente para interior y jardín"
        ],
        amazonUrl: "https://www.amazon.com.mx/s?k=esqueleto+halloween+tamano+real+articulado+165cm",
        mlUrl: "https://listado.mercadolibre.com.mx/esqueleto-halloween-tamano-real-articulado"
      }
    ]
  },

  fiesta: {
    titulo: "🦇 FIESTA HALLOWEEN, BEBIDAS Y BOTANAS",
    items: [
      {
        tipo: "diy",
        badge: "RECETA • VIRAL",
        tagExtra: "20 MIN",
        titulo: "Poción Sangrienta con Hielo Seco y Frutos Rojos",
        desc: "Ponche humeante sin alcohol (o con vodka) servido en caldero con efecto de niebla.",
        meta: "Rinde: 12 vasos",
        img: "imagenes/fiesta-pocion.jpg",
        materiales: [
          "1 L de jugo de arándano + 1 L de refresco de limón",
          "1 taza de fresas y zarzamoras congeladas",
          "Hielo seco grado alimenticio (manipular solo con pinzas)"
        ],
        pasos: [
          {
            texto: "Mezcla el jugo de arándano bien frío con el refresco de limón y las frutas congeladas en un tazón grande.",
            img: IMG_STEP.bebida
          },
          {
            texto: "Antes de servir, coloca un trozo pequeño de hielo seco en el fondo usando pinzas metálicas.",
            img: IMG_STEP.fantasma
          },
          {
            texto: "Sirve únicamente el líquido evitando que caigan trozos sólidos de hielo seco en los vasos.",
            img: IMG_STEP.bebida
          }
        ]
      },
      {
        tipo: "diy",
        badge: "RECETA • SALADA",
        tagExtra: "25 MIN",
        titulo: "Dedos de Bruja Crujientes con Almendras",
        desc: "Salchichas cocteleras o masa de hojaldre horneadas con uña de almendra y salsa roja.",
        meta: "Rinde: 24 piezas",
        img: "imagenes/fiesta-dedos.jpg",
        materiales: [
          "1 paquete de salchichas o masa hojaldre",
          "Almendras fileteadas o enteras peladas",
          "Salsa catsup o salsa BBQ para decorar"
        ],
        pasos: [
          {
            texto: "Haz tres cortes superficiales en el centro de cada salchicha para simular los nudillos de un dedo.",
            img: IMG_STEP.postre
          },
          {
            texto: "Haz un pequeño corte en la punta e inserta una almendra pelada como uña.",
            img: IMG_STEP.postre
          },
          {
            texto: "Hornea 12 minutos a 180°C y sirve bañando la base con salsa roja.",
            img: IMG_STEP.bebida
          }
        ]
      },
      {
        tipo: "diy",
        badge: "JUEGO • FIESTA",
        tagExtra: "30 MIN",
        titulo: "Caja Misteriosa del Tacto (Sensaciones)",
        desc: "Cajas cerradas donde los invitados meten la mano para adivinar 'ojos' y 'cerebros'.",
        meta: "Costo aprox: $80 MXN",
        img: "imagenes/fiesta-caja-tacto.jpg",
        materiales: [
          "3 cajas de zapatos forradas de negro",
          "Uvas peladas en aceite (ojos), espagueti cocido frío (gusanos)",
          "Gelatina sin cuajar completamente (cerebro)"
        ],
        pasos: [
          {
            texto: "Corta un círculo en un costado de cada caja y pega tiras de bolsa negra por dentro como cortina.",
            img: IMG_STEP.carton
          },
          {
            texto: "Coloca un tazón con cada ingrediente viscoso dentro de las cajas sin que nadie vea.",
            img: IMG_STEP.frascos
          },
          {
            texto: "Haz que tus invitados metan la mano con los ojos vendados y adivinen qué tocan.",
            img: IMG_STEP.lapida
          }
        ]
      },
      {
        tipo: "diy",
        badge: "RECETA • DULCE",
        tagExtra: "30 MIN",
        titulo: "Tumbas de Mousse de Chocolate y Galleta",
        desc: "Vasitos individuales de postre con tierra de galleta triturada y lápida de galleta rectangular.",
        meta: "Rinde: 8 vasitos",
        img: "imagenes/fiesta-tumbas-mousse.jpg",
        materiales: [
          "2 paquetes de galletas de chocolate oscuras",
          "Pudín o mousse de chocolate frío",
          "8 galletas rectangulares tipo María o lengua de gato + betún"
        ],
        pasos: [
          {
            texto: "Tritura las galletas oscuras hasta que parezcan tierra fina de cementerio.",
            img: IMG_STEP.postre
          },
          {
            texto: "Llena vasitos transparentes con mousse de chocolate y cubre la superficie con la tierra de galleta.",
            img: IMG_STEP.postre
          },
          {
            texto: "Escribe 'RIP' con betún en cada galleta rectangular y clávala verticalmente en cada vaso.",
            img: IMG_STEP.lapida
          }
        ]
      },
      {
        tipo: "diy",
        badge: "BEBIDA • SHOTS",
        tagExtra: "15 MIN",
        titulo: "Jeringas de Gelatina Roja Sangrienta",
        desc: "Jeringas grandes sin aguja rellenas de gelatina de fresa o cereza para repartir en la fiesta.",
        meta: "Rinde: 15 jeringas",
        img: "imagenes/fiesta-jeringas.jpg",
        materiales: [
          "15 jeringas de plástico nuevas de 20 ml (sin aguja)",
          "1 sobre de gelatina sabor cereza o fresa",
          "1 taza de agua caliente + 1 taza de agua fría"
        ],
        pasos: [
          {
            texto: "Disuelve la gelatina en el agua caliente, añade el agua fría y deja entibiar 10 minutos.",
            img: IMG_STEP.bebida
          },
          {
            texto: "Absorbe la gelatina líquida con cada jeringa, ponles su tapón y refrigera acostadas por 3 horas.",
            img: IMG_STEP.bebida
          }
        ]
      },
      {
        tipo: "diy",
        badge: "AMBIENTE • BAÑO",
        tagExtra: "10 MIN",
        titulo: "Espejo con Mensaje Sangriento Lavable",
        desc: "Escribe mensajes de advertencia en el espejo del baño que aparecen al empañarse.",
        meta: "Costo aprox: $35 MXN",
        img: "imagenes/fiesta-espejo.jpg",
        materiales: [
          "Jabón líquido transparente o pintura lavable roja",
          "Pincel fino o hisopo"
        ],
        pasos: [
          {
            texto: "Limpia perfectamente el espejo con alcohol y un paño seco.",
            img: IMG_STEP.pintura
          },
          {
            texto: "Escribe 'TE ESTOY VIENDO' con jabón líquido; cuando el baño se llene de vapor, aparecerá el mensaje.",
            img: IMG_STEP.murcielago
          }
        ]
      },
      {
        tipo: "productos",
        badge: "TOP FIESTA #1",
        tagExtra: "VIRAL BEBIDAS",
        titulo: "Pack 24 Bolsas de Sangre para Bebidas + Jeringas",
        desc: "Bolsas médicas grado alimenticio con popote, clip anti-derrame y etiquetas de tipo de sangre.",
        meta: "$190 – $340 MXN",
        img: "imagenes/prod-bolsas-sangre.jpg",
        especificaciones: [
          "Capacidad: 350 ml por bolsa (reutilizables y lavables)",
          "Incluye: 24 bolsas + embudo de llenado + etiquetas",
          "Material: PVC grado alimenticio libre de BPA"
        ],
        amazonUrl: "https://www.amazon.com.mx/s?k=bolsas+de+sangre+para+bebidas+halloween",
        mlUrl: "https://listado.mercadolibre.com.mx/bolsas-sangre-bebidas-halloween"
      },
      {
        tipo: "productos",
        badge: "TOP FIESTA #2",
        tagExtra: "CABINA FOTOS",
        titulo: "Kit 35 Accesorios Photo Booth Halloween (Props)",
        desc: "Lentes, sombreros de bruja, labios de vampiro y carteles en palitos de bambú para fotos.",
        meta: "$130 – $230 MXN",
        img: "imagenes/prod-photobooth.jpg",
        especificaciones: [
          "Cantidad: 35 piezas de cartulina gruesa impresa",
          "Incluye: Palitos de madera y puntos de pegamento",
          "Ideal para: Selfies grupales y recuerdos"
        ],
        amazonUrl: "https://www.amazon.com.mx/s?k=photo+booth+props+halloween+accesorios+fotos",
        mlUrl: "https://listado.mercadolibre.com.mx/photo-booth-halloween-accesorios"
      },
      {
        tipo: "productos",
        badge: "TOP FIESTA #3",
        tagExtra: "MESA",
        titulo: "Vajilla Desechable Halloween 80 Pzas (Platos y Vasos)",
        desc: "Set completo para 20 invitados con diseño de esqueletos, calabazas y servilletas temáticas.",
        meta: "$250 – $420 MXN",
        img: "imagenes/prod-vajilla.jpg",
        especificaciones: [
          "Incluye: 20 platos grandes, 20 platos pastel, 20 vasos y 20 servilletas",
          "Material: Cartón laminado resistente a alimentos calientes/fríos"
        ],
        amazonUrl: "https://www.amazon.com.mx/s?k=vajilla+desechable+halloween+platos+vasos+fiesta",
        mlUrl: "https://listado.mercadolibre.com.mx/vajilla-desechable-fiesta-halloween"
      },
      {
        tipo: "productos",
        badge: "TOP FIESTA #4",
        tagExtra: "REPOSTERÍA",
        titulo: "Moldes de Silicona 3D Cráneos, Calabazas y Murciélagos",
        desc: "Moldes antiadherentes aptos para horno y congelador (hielos gigantes, chocolates y gomitas).",
        meta: "$140 – $260 MXN",
        img: "imagenes/prod-moldes.jpg",
        especificaciones: [
          "Temperatura: Resiste de -40°C hasta 230°C",
          "Uso: Hielos 3D para cocteles, chocolates o gelatinas"
        ],
        amazonUrl: "https://www.amazon.com.mx/s?k=moldes+silicona+halloween+calaveras+hielo+chocolate",
        mlUrl: "https://listado.mercadolibre.com.mx/moldes-silicona-halloween-calaveras"
      },
      {
        tipo: "productos",
        badge: "TOP FIESTA #5",
        tagExtra: "JUEGO",
        titulo: "Piñata Temática Halloween (Calabaza o Fantasma)",
        desc: "Piñata tradicional plegable o de cartón reforzado para rellenar con dulces y premios.",
        meta: "$220 – $450 MXN",
        img: "imagenes/prod-pinata.jpg",
        especificaciones: [
          "Capacidad: Hasta 2.5 kg de dulces",
          "Incluye: Cinta resistente para colgar"
        ],
        amazonUrl: "https://www.amazon.com.mx/s?k=pinata+halloween+calabaza+fantasma",
        mlUrl: "https://listado.mercadolibre.com.mx/pinata-halloween"
      },
      {
        tipo: "productos",
        badge: "TOP FIESTA #6",
        tagExtra: "DULCES",
        titulo: "Bolsa Surtida 100 Dulces Temáticos (Ojos, Gusanos y Calaveras)",
        desc: "Gomitas rellenas en forma de ojos sangrientos, dentaduras de vampiro y huesos ácidos.",
        meta: "$180 – $320 MXN",
        img: "imagenes/prod-dulces.jpg",
        especificaciones: [
          "Presentación: Empaque individual higiénico ideal para repartir",
          "Contenido: 80 a 100 piezas surtidas"
        ],
        amazonUrl: "https://www.amazon.com.mx/s?k=dulces+halloween+gomitas+ojos+surtido",
        mlUrl: "https://listado.mercadolibre.com.mx/dulces-halloween-gomitas-ojos"
      }
    ]
  },

  disfraces: {
    titulo: "🎭 DISFRACES, MÁSCARAS Y MAQUILLAJE FX",
    items: [
      {
        tipo: "diy",
        badge: "DIY • CASERO",
        tagExtra: "30 MIN",
        titulo: "Fantasma Clásico Aesthetic con Lentes Oscuros",
        desc: "El disfraz más icónico y fotogénico usando una sábana blanca y gafas retro.",
        meta: "Costo aprox: $50 MXN",
        img: "imagenes/disfraz-fantasma.jpg",
        materiales: [
          "1 sábana blanca lisa (matrimonial o queen)",
          "Lentes de sol negros",
          "Tijeras y marcador lavable"
        ],
        pasos: [
          {
            texto: "Colócate la sábana encima y pide a alguien que marque con puntos suaves dónde quedan tus ojos.",
            img: IMG_STEP.carton
          },
          {
            texto: "Quítate la sábana, recorta dos círculos limpios y refuerza el borde por dentro con cinta adhesiva.",
            img: IMG_STEP.fantasma
          },
          {
            texto: "Ponte la sábana y coloca los lentes oscuros por encima de los agujeros para fijar la tela.",
            img: IMG_STEP.fantasma
          }
        ]
      },
      {
        tipo: "diy",
        badge: "MAQUILLAJE FX",
        tagExtra: "25 MIN",
        titulo: "Cicatrices y Heridas Realistas con Papel y Pegamento",
        desc: "Efecto especial de cine usando solo servilletas, látex líquido (o pegamento blanco) y sombra.",
        meta: "Costo aprox: $75 MXN",
        img: "imagenes/disfraz-cicatrices.png",
        materiales: [
          "Servilletas de papel separadas en capas finas",
          "Látex líquido cosmético o pegamento escolar no tóxico",
          "Base de maquillaje, sombra roja/morada y sangre falsa"
        ],
        pasos: [
          {
            texto: "Aplica una capa delgada de látex en la piel y pega encima una tira rasgada de servilleta.",
            img: IMG_STEP.maquillaje
          },
          {
            texto: "Cubre con otra capa de látex, deja secar 5 minutos y abre un corte justo por el centro con pinzas.",
            img: IMG_STEP.pintura
          },
          {
            texto: "Maquilla los bordes con tu base habitual y rellena el interior con sombra morada y sangre falsa.",
            img: IMG_STEP.maquillaje
          }
        ]
      },
      {
        tipo: "diy",
        badge: "DIY • PAREJA",
        tagExtra: "45 MIN",
        titulo: "Disfraz de Espantapájaros con Ropa de Mezclilla",
        desc: "Camisa de cuadros, overol, sombrero de paja y maquillaje de costuras en las mejillas.",
        meta: "Costo aprox: $90 MXN",
        img: "imagenes/disfraz-espantapajaros.jpg",
        materiales: [
          "Camisa de franela a cuadros y pantalón u overol de mezclilla",
          "Rafia natural o tiras de papel kraft para simular paja",
          "Delineador negro y rubor naranja intenso"
        ],
        pasos: [
          {
            texto: "Mete manojos de rafia dentro de los puños de la camisa, los bolsillos y los tobillos del pantalón.",
            img: IMG_STEP.carton
          },
          {
            texto: "Dibuja un triángulo naranja en la punta de la nariz con borde negro y líneas de costura en la boca.",
            img: IMG_STEP.maquillaje
          }
        ]
      },
      {
        tipo: "diy",
        badge: "DIY • RÁPIDO",
        tagExtra: "20 MIN",
        titulo: "Momia Vendada con Efecto Envejecido",
        desc: "Prenda base blanca envuelta con tiras de tela teñidas en té negro para aspecto antiguo.",
        meta: "Costo aprox: $110 MXN",
        img: "imagenes/disfraz-momia.jpg",
        materiales: [
          "Playera y leggings blancos",
          "6 rollos de venda elástica o tiras de sábana vieja",
          "4 bolsitas de té negro en agua caliente"
        ],
        pasos: [
          {
            texto: "Sumerge las vendas en infusión concentrada de té negro durante 15 minutos y déjalas secar.",
            img: IMG_STEP.pintura
          },
          {
            texto: "Envuelve las vendas alrededor de la ropa sujetándolas con puntadas rápidas o seguros ocultos.",
            img: IMG_STEP.fantasma
          }
        ]
      },
      {
        tipo: "diy",
        badge: "MAQUILLAJE",
        tagExtra: "30 MIN",
        titulo: "Catrina / Calavera Glam con Pedrería",
        desc: "Maquillaje clásico mexicano con cuencas oscuras, pétalos alrededor de los ojos y brillos.",
        meta: "Costo aprox: $120 MXN",
        img: "imagenes/disfraz-catrina.jpg",
        materiales: [
          "Delineador negro en gel, sombra negra y roja",
          "Piedritas autoadhesivas (gemas faciales)",
          "Diadema de flores grandes"
        ],
        pasos: [
          {
            texto: "Traza dos círculos grandes alrededor de los ojos, rellena con sombra negra y rodea con pétalos rojos.",
            img: IMG_STEP.maquillaje
          },
          {
            texto: "Pega las gemas siguiendo el contorno de los pétalos y traza líneas finas cruzando los labios.",
            img: IMG_STEP.maquillaje
          }
        ]
      },
      {
        tipo: "diy",
        badge: "DIY • CINE",
        tagExtra: "35 MIN",
        titulo: "Merlina Addams (Wednesday) con Trenzas",
        desc: "Vestido negro con cuello blanco desmontable de cartulina o camisa, trenzas y labial oscuro.",
        meta: "Costo aprox: $60 MXN",
        img: "imagenes/disfraz-merlina.jpg",
        materiales: [
          "Vestido o suéter negro + camisa blanca debajo",
          "Labial morado oscuro / ciruela y sombra gris",
          "Ligas para dos trenzas largas"
        ],
        pasos: [
          {
            texto: "Coloca una camisa blanca de cuello picudo debajo de un suéter o vestido negro.",
            img: IMG_STEP.carton
          },
          {
            texto: "Haz dos trenzas simétricas con raya en medio y aplica sombra oscura difuminada en párpados.",
            img: IMG_STEP.maquillaje
          }
        ]
      },
      {
        tipo: "productos",
        badge: "TOP DISFRAZ #1",
        tagExtra: "MÁS VENDIDO",
        titulo: "Disfraz Inflable de Dinosaurio T-Rex Adulto",
        desc: "Traje inflable completo con ventilador portátil a pilas y ventana transparente para ver.",
        meta: "$590 – $1,150 MXN",
        img: "imagenes/prod-trex.jpg",
        especificaciones: [
          "Talla: Unitalla adulto (1.50 m a 1.90 m)",
          "Incluye: Traje poliéster + turbina ventiladora (usa 4 pilas AA)",
          "Inflado: En menos de 1 minuto"
        ],
        amazonUrl: "https://www.amazon.com.mx/s?k=disfraz+inflable+dinosaurio+t+rex+adulto",
        mlUrl: "https://listado.mercadolibre.com.mx/disfraz-inflable-dinosaurio-adulto"
      },
      {
        tipo: "productos",
        badge: "TOP DISFRAZ #2",
        tagExtra: "CLÁSICO TERROR",
        titulo: "Máscara Scream Ghostface Oficial + Túnica Negra",
        desc: "Máscara clásica con capucha integrada de tela negra y túnica con mangas de murciélago.",
        meta: "$260 – $580 MXN",
        img: "imagenes/prod-ghostface.jpg",
        especificaciones: [
          "Material máscara: Vinilo ligero con malla negra en ojos",
          "Incluye: Máscara con capucha (opción con túnica y cuchillo)"
        ],
        amazonUrl: "https://www.amazon.com.mx/s?k=mascara+scream+ghostface+disfraz+tunica",
        mlUrl: "https://listado.mercadolibre.com.mx/mascara-scream-ghostface-disfraz"
      },
      {
        tipo: "productos",
        badge: "TOP DISFRAZ #3",
        tagExtra: "LUZ NEÓN",
        titulo: "Máscara LED La Purga (3 Modos de Luz)",
        desc: "Máscara con cable electroluminiscente neón, control de parpadeo y espuma interior cómoda.",
        meta: "$160 – $320 MXN",
        img: "imagenes/prod-mascara-led.jpg",
        especificaciones: [
          "Modos de luz: Luz fija, parpadeo lento y parpadeo rápido",
          "Alimentación: Control de bolsillo con 2 pilas AA",
          "Colores: Naranja, rojo, azul, morado o verde neón"
        ],
        amazonUrl: "https://www.amazon.com.mx/s?k=mascara+led+la+purga+halloween+neon",
        mlUrl: "https://listado.mercadolibre.com.mx/mascara-led-la-purga-halloween"
      },
      {
        tipo: "productos",
        badge: "TOP DISFRAZ #4",
        tagExtra: "MAQUILLAJE FX",
        titulo: "Kit Profesional Maquillaje FX (Sangre, Látex y Cera)",
        desc: "Set completo para crear heridas, quemaduras, cicatrices y efecto zombie realista.",
        meta: "$220 – $440 MXN",
        img: "imagenes/prod-kit-fx.jpg",
        especificaciones: [
          "Incluye: Sangre artificial coagulada, cera moldeable, espátula y paleta de 6 colores",
          "Fórmula: Hipoalergénica y lavable con agua tibia y jabón"
        ],
        amazonUrl: "https://www.amazon.com.mx/s?k=kit+maquillaje+fx+halloween+sangre+falsa+heridas",
        mlUrl: "https://listado.mercadolibre.com.mx/kit-maquillaje-fx-halloween-sangre"
      },
      {
        tipo: "productos",
        badge: "TOP DISFRAZ #5",
        tagExtra: "CAPA",
        titulo: "Capa Reversible de Vampiro / Bruja con Cuello Alto",
        desc: "Capa larga de 150 cm en satín negro por fuera y rojo sangre por dentro con cuello rígido.",
        meta: "$190 – $360 MXN",
        img: "imagenes/prod-capa.jpg",
        especificaciones: [
          "Largo: 140 cm a 150 cm (unisex adulto)",
          "Diseño: Reversible (2 estilos en 1 sola prenda)"
        ],
        amazonUrl: "https://www.amazon.com.mx/s?k=capa+vampiro+reversible+negra+roja+cuello+alto",
        mlUrl: "https://listado.mercadolibre.com.mx/capa-vampiro-reversible-negra-roja"
      },
      {
        tipo: "productos",
        badge: "TOP DISFRAZ #6",
        tagExtra: "VAMPIRO",
        titulo: "Colmillos de Vampiro Retráctiles + Adhesivo Dental",
        desc: "Set de 4 tamaños de colmillos de resina natural con perlas termoplásticas para ajuste fijo.",
        meta: "$99 – $190 MXN",
        img: "imagenes/prod-colmillos.jpg",
        especificaciones: [
          "Incluye: 4 pares (13mm, 15mm, 17mm, 19mm) + adhesivo reutilizable",
          "Material: Resina médica no tóxica"
        ],
        amazonUrl: "https://www.amazon.com.mx/s?k=colmillos+de+vampiro+realistas+con+adhesivo+halloween",
        mlUrl: "https://listado.mercadolibre.com.mx/colmillos-vampiro-realistas-adhesivo"
      }
    ]
  }
};

/* RENDERIZADO DINÁMICO DE OPCIONES Y MODAL CON IMAGEN EN CADA PASO */
function setupCategoryMapping() {
  const cards = document.querySelectorAll(".cat-card[data-category]");
  const tabs = document.querySelectorAll(".spooky-tab[data-tab]");
  const grid = document.getElementById("showcase-grid");
  const titleEl = document.getElementById("showcase-title");
  const kickerEl = document.getElementById("showcase-kicker");

  const modal = document.getElementById("spooky-modal");
  const closeModalBtn = document.getElementById("close-spooky-modal");
  const modalBadge = document.getElementById("modal-badge");
  const modalTitle = document.getElementById("modal-title");
  const modalBody = document.getElementById("modal-body");

  let currentCategory = "decoracion";
  let currentTab = "all";

  function openModal(item) {
    if (!modal) return;
    modalTitle.textContent = item.titulo;
    modalBody.innerHTML = "";

    if (item.tipo === "diy") {
      modalBadge.textContent = "🛠️ MANUALIDAD / RECETA PASO A PASO";
      const matHTML = `
        <div class="modal-materials-box">
          <h4>📦 Materiales Necesarios (${item.meta})</h4>
          <ul>${item.materiales.map(m => `<li>${m}</li>`).join("")}</ul>
        </div>
      `;
      const stepsHTML = item.pasos.map((pasoObj, idx) => {
        const texto = typeof pasoObj === "string" ? pasoObj : pasoObj.texto;
        const stepImg = (typeof pasoObj === "object" && pasoObj.img) ? pasoObj.img : item.img;
        return `
          <div class="modal-step-item">
            <div class="modal-step-header">
              <div class="step-num">${idx + 1}</div>
              <p class="step-text">${texto}</p>
            </div>
            <div class="modal-step-img-wrap">
              <img src="${stepImg}" alt="Paso ${idx + 1} - ${item.titulo}" loading="lazy" onerror="this.onerror=null;this.src='${FALLBACK_SPOOKY_IMG}';">
              <span class="modal-step-caption">PASO ${idx + 1} DE ${item.pasos.length}</span>
            </div>
          </div>
        `;
      }).join("");
      modalBody.innerHTML = matHTML + stepsHTML;
    } else {
      modalBadge.textContent = "🛒 ESPECIFICACIONES DEL PRODUCTO";
      const specHTML = `
        <div class="modal-materials-box">
          <h4>📋 Ficha Técnica y Precio Estimado: ${item.meta}</h4>
          <ul>${item.especificaciones.map(s => `<li>${s}</li>`).join("")}</ul>
        </div>
        <div style="display:flex; gap:12px; flex-wrap:wrap; margin-top:8px;">
          <a href="${item.amazonUrl}" target="_blank" class="btn-spooky-primary" style="flex:1;">Buscar en Amazon México 🔎</a>
          <a href="${item.mlUrl}" target="_blank" class="btn-spooky-secondary" style="flex:1;">Buscar en Mercado Libre 🔎</a>
        </div>
      `;
      modalBody.innerHTML = specHTML;
    }

    modal.classList.add("open");
  }

  function renderCategory() {
    if (!grid || !HALLOWEEN_DATA[currentCategory]) return;
    const catData = HALLOWEEN_DATA[currentCategory];
    if (titleEl) titleEl.textContent = catData.titulo;

    const filtered = catData.items.filter(item => currentTab === "all" || item.tipo === currentTab);
    if (kickerEl) kickerEl.textContent = `MOSTRANDO ${filtered.length} OPCIONES DISPONIBLES`;

    grid.innerHTML = "";
    filtered.forEach((item, index) => {
      const card = document.createElement("article");
      const favId = `halloween-${currentCategory}-${item.tipo}-${index}`;
      card.id = favId;
      card.className = "spooky-item-card creepy-infested";

      const favUrl = item.tipo === "diy" ? `opciones.html#${favId}` : item.amazonUrl;
      const safeTitle = String(item.titulo || "").replace(/'/g, "\\'").replace(/"/g, """);
      const safeCat = `Halloween • ${item.tipo === "diy" ? "Idea DIY" : "Producto"}`;
      const safeUrl = String(favUrl || "").replace(/'/g, "\\'").replace(/"/g, """);

      const favBtnHTML = `<button type="button" class="orbit-fav-btn" data-fav-item="${favId}" onclick="guardarEnFavoritosYRedirigir('${favId}', '${safeTitle}', '${safeCat}', '${safeUrl}')">☆ Guardar en Favoritos</button>`;

      const buttonsHTML = item.tipo === "diy"
        ? `<button class="btn-spooky-primary btn-open-detail">Ver Paso a Paso 🛠️</button>
           ${favBtnHTML}`
        : `
          <a href="${item.amazonUrl}" target="_blank" class="btn-spooky-primary">Ver en Amazon 🔎</a>
          <a href="${item.mlUrl}" target="_blank" class="btn-spooky-secondary">Ver en Mercado Libre 🔎</a>
          <button class="btn-spooky-secondary btn-open-detail" style="border-style:dashed;">Ficha Técnica 📋</button>
          ${favBtnHTML}
        `;

      card.innerHTML = `
        <div class="spooky-card-media">
          <img src="${item.img}" alt="${item.titulo}" loading="lazy" onerror="this.onerror=null;this.src='${FALLBACK_SPOOKY_IMG}';">
          <span class="spooky-badge-type">${item.badge}</span>
          <span class="spooky-badge-top">${item.tagExtra}</span>
        </div>
        <div class="spooky-card-body">
          <h3 class="spooky-card-title">${item.titulo}</h3>
          <p class="spooky-card-desc">${item.desc}</p>
          <div class="spooky-meta-row">
            <span>${item.tipo === "diy" ? "Inversión:" : "Precio Web:"}</span>
            <strong>${item.meta}</strong>
          </div>
          <div class="spooky-actions">
            ${buttonsHTML}
          </div>
        </div>
      `;

      infestCard(card, index + 4);

      const detailBtn = card.querySelector(".btn-open-detail");
      if (detailBtn) {
        detailBtn.addEventListener("click", () => openModal(item));
      }

      grid.appendChild(card);
    });

    if (typeof window.syncIndividualButtonsState === "function") {
      window.syncIndividualButtonsState();
    }
  }

  cards.forEach((card) => {
    card.addEventListener("click", function () {
      cards.forEach((c) => c.classList.remove("active"));
      this.classList.add("active");
      currentCategory = this.getAttribute("data-category");
      renderCategory();
      const showcase = document.getElementById("category-showcase");
      if (showcase) showcase.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
  });

  tabs.forEach((tab) => {
    tab.addEventListener("click", function () {
      tabs.forEach((t) => t.classList.remove("active"));
      this.classList.add("active");
      currentTab = this.getAttribute("data-tab");
      renderCategory();
    });
  });

  if (closeModalBtn) {
    closeModalBtn.addEventListener("click", () => modal.classList.remove("open"));
  }
  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) modal.classList.remove("open");
    });
  }

  renderCategory();
}

/* BOTÓN DE RETORNO ARRIBA */
function setupScrollToTop() {
  const btnScroll = document.getElementById("scrollToTopBtn");
  if (!btnScroll) return;

  window.addEventListener("scroll", () => {
    if (window.scrollY > 250) btnScroll.classList.add("showBtn");
    else btnScroll.classList.remove("showBtn");
  });

  btnScroll.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  setupLiquidChrome();
  setupHorrorAtmosphere();
  setupCardInfestation();
  setupCardSpotlight();
  setupCursor();
  setupCountdown();
  setupContent();
  setupEyes();
  setupSpiders();
  setupShutdownToggle();
  setupCategoryMapping();
  setupScrollToTop();
});