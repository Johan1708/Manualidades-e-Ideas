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

  // CONFIGURACIÓN DE COLORES Y PARÁMETROS PARA HALLOWEEN (PUMPKIN ORANGE NEON)
  const config = {
    color: "#cb5808", // NARANJA HALLOWEEN LÍQUIDO
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

  document.querySelectorAll("a, button, input, label, .card, .tag, .toggle").forEach((el) => {
    el.addEventListener("mouseenter", () => {
      if (cursorFollower) cursorFollower.classList.add("active");
    });
    el.addEventListener("mouseleave", () => {
      if (cursorFollower) cursorFollower.classList.remove("active");
    });
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

/* ARAÑAS ANIMADAS */
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
        setTimeout(() => { window.location.href = "galeria.html"; }, 900);
      }
    });
  }
}

/* MAPEADO E ILUMINACIÓN BIDIRECCIONAL DE CATEGORÍAS */
function setupCategoryMapping() {
  const tags = document.querySelectorAll(".tag[data-target-category]");
  const cards = document.querySelectorAll(".cat-card[data-category]");

  tags.forEach((tag) => {
    const targetCat = tag.getAttribute("data-target-category");

    tag.addEventListener("mouseenter", () => {
      cards.forEach((card) => {
        if (card.getAttribute("data-category") === targetCat) {
          card.classList.add("highlight");
        }
      });
    });

    tag.addEventListener("mouseleave", () => {
      cards.forEach((card) => card.classList.remove("highlight"));
    });

    tag.addEventListener("click", () => {
      cards.forEach((card) => card.classList.remove("active"));
      const activeCard = document.querySelector(`.cat-card[data-category="${targetCat}"]`);
      if (activeCard) activeCard.classList.add("active");
    });
  });

  cards.forEach((card) => {
    card.addEventListener("click", function () {
      cards.forEach((c) => c.classList.remove("active"));
      this.classList.add("active");
    });
  });
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
  setupCursor();
  setupCountdown();
  setupContent();
  setupEyes();
  setupSpiders();
  setupShutdownToggle();
  setupCategoryMapping();
  setupScrollToTop();
});