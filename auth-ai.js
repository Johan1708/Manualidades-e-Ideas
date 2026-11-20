/* ==========================================================================
   SISTEMA GLOBAL ORBIT PLATA: FAVORITOS INDIVIDUALES + IA (GUARDADO GARANTIZADO)
   ========================================================================== */

const SUPABASE_URL = "https://fwbcltconkufmjkonwnd.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_QDnoZtA8QdX3pSLL9hqPGw_S9TjBTvd";

const PALABRAS_PROHIBIDAS = [
  "puto", "puta", "pendejo", "pendeja", "verga", "chinga", "cabron",
  "estupido", "idiota", "mierda", "culero", "zorra", "malparido", "gonorrea"
];

function contieneLenguajeOfensivo(texto) {
  const normalizado = texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  return PALABRAS_PROHIBIDAS.some((palabra) =>
    new RegExp(`\\b${palabra}\\b`, "i").test(normalizado)
  );
}

function loadSupabaseSDK() {
  return new Promise((resolve) => {
    if (window.supabase) return resolve(window.supabase);
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";
    script.onload = () => resolve(window.supabase);
    document.head.appendChild(script);
  });
}

function injectOrbitAIStyles() {
  if (document.getElementById("chispa-orbit-theme")) return;
  const style = document.createElement("style");
  style.id = "chispa-orbit-theme";
  style.textContent = `
    :root {
      --silver-rgb: 215 222 232;
      --chrome-rgb: 165 175 190;
    }

    .orbit-user-bar {
      position: fixed !important;
      bottom: 22px !important;
      right: 22px !important;
      z-index: 99998 !important;
      display: flex !important;
      align-items: center;
      gap: 10px;
      pointer-events: none;
    }
    .orbit-user-bar > * { pointer-events: auto; }
    .orbit-user-bar.pos-top { top: 18px !important; bottom: auto !important; }

    @keyframes starfield-drift {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }

    .orbit-star-icon-btn {
      position: relative;
      height: 44px;
      min-width: 44px;
      padding: 0 13px;
      border-radius: 999px;
      border: 1.5px solid rgba(225, 232, 240, 0.72) !important;
      background-color: rgba(12, 13, 16, 0.92) !important;
      background-image:
        radial-gradient(1.5px 1.5px at 20% 30%, #ffffff 70%, transparent 100%),
        radial-gradient(1px 1px at 70% 65%, #e2e8f0 70%, transparent 100%),
        radial-gradient(2px 2px at 45% 20%, #ffffff 60%, transparent 100%),
        radial-gradient(1.5px 1.5px at 85% 35%, #cbd5e1 70%, transparent 100%),
        radial-gradient(1px 1px at 30% 75%, #ffffff 70%, transparent 100%) !important;
      background-size: 160% 160%;
      color: #f8fafc !important;
      font-family: 'Orbitron', 'Source Code Pro', sans-serif;
      font-size: 0.78rem;
      font-weight: 700;
      letter-spacing: 0.08rem;
      text-transform: uppercase;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0px;
      cursor: pointer !important;
      overflow: hidden;
      box-shadow: 0 4px 18px rgba(0, 0, 0, 0.75), inset 0 0 10px rgba(255, 255, 255, 0.08) !important;
      transition: all 0.32s cubic-bezier(0.22, 1, 0.36, 1);
    }
    .orbit-star-icon-btn .btn-ico { font-size: 1.05rem; line-height: 1; filter: grayscale(100%) brightness(1.35); transition: transform 0.25s ease; }
    .orbit-star-icon-btn .btn-label { max-width: 0; opacity: 0; overflow: hidden; white-space: nowrap; transition: max-width 0.34s ease, opacity 0.25s ease, margin-left 0.28s ease; }
    .orbit-star-icon-btn:hover { padding: 0 18px; border-color: #ffffff !important; box-shadow: 0 0 22px rgba(255, 255, 255, 0.38), inset 0 0 16px rgba(255, 255, 255, 0.18) !important; animation: starfield-drift 4s ease infinite; }
    .orbit-star-icon-btn:hover .btn-ico { transform: scale(1.1); }
    .orbit-star-icon-btn:hover .btn-label { max-width: 190px; opacity: 1; margin-left: 9px; }
    .orbit-star-icon-btn.danger:hover { border-color: #fca5a5 !important; color: #fecaca !important; }

    .global-modal-overlay {
      position: fixed !important;
      inset: 0 !important;
      z-index: 100000 !important;
      display: none;
      align-items: center;
      justify-content: center;
      padding: 16px;
      background: rgba(6, 7, 10, 0.45) !important;
      backdrop-filter: blur(4px);
    }
    .global-modal-overlay.open { display: flex !important; }

    @keyframes pan-overlay { from { background-position: 0% 0%; } to { background-position: 0% -100%; } }
    @keyframes pan-image {
      0% { background-position: 36% 42%; background-size: 200%; }
      50% { background-position: 84% 33%; background-size: 300%; }
      100% { background-position: 72% 14%; background-size: 300%; }
    }

    .orbit-holo-screen {
      width: min(440px, 94vw);
      max-height: 92vh;
      display: flex;
      border: 2.5px solid rgba(226, 232, 240, 0.82);
      border-radius: 1.1rem;
      background-color: rgba(14, 16, 20, 0.82);
      backdrop-filter: blur(14px);
      overflow: hidden;
      position: relative;
      z-index: 10;
      box-shadow: 0 0 42px rgba(255, 255, 255, 0.2), inset 0 0 24px rgba(255, 255, 255, 0.08);
    }
    .orbit-holo-screen.login-size { min-height: 540px; }
    .orbit-holo-screen > .screen-image {
      background-image: url("https://images.unsplash.com/photo-1515266591878-f93e32bc5937?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80");
      height: 100%; width: 100%; position: absolute; z-index: 1; left: 0; top: 0;
      background-size: 300%; filter: grayscale(100%) contrast(115%) brightness(0.65); opacity: 0.36;
      animation: pan-image 15s linear infinite; pointer-events: none;
    }
    .orbit-holo-screen > .screen-overlay {
      background: linear-gradient(rgba(220, 226, 235, 0.12), rgba(220, 226, 235, 0.12) 3px, transparent 3px, transparent 9px);
      background-size: 100% 9px; height: 100%; width: 100%; animation: pan-overlay 22s infinite linear;
      position: absolute; z-index: 2; left: 0; top: 0; pointer-events: none;
    }
    .orbit-holo-screen > .screen-content {
      display: flex; flex-direction: column; justify-content: space-between; flex-grow: 1;
      position: relative; z-index: 4; margin: 0.9rem; padding: 1.3rem 1.3rem 1.45rem;
      border: 1px solid rgba(215, 222, 232, 0.45); border-radius: 0.75rem;
      overflow-y: auto; color: #f8fafc; font-family: 'Segoe UI', system-ui, sans-serif;
    }
    .screen-top-close { position: absolute; top: 10px; right: 10px; z-index: 8; }
    .screen-header-brand { display: flex; flex-direction: column; align-items: center; text-align: center; margin: 0.2rem 0 1rem; padding-top: 0.85rem; }
    .screen-scramble-title { font-family: "Source Code Pro", monospace; font-size: 1.95rem; font-weight: 700; color: #ffffff; letter-spacing: 0.14rem; text-transform: uppercase; margin: 0; }
    .screen-subtitle { font-family: "Source Code Pro", monospace; opacity: 0.85; font-size: 0.75rem; color: #cbd5e1; letter-spacing: 0.2rem; text-transform: uppercase; margin-top: 4px; }

    .auth-tabs { display: flex; gap: 8px; margin-bottom: 12px; }
    .auth-tab-btn { flex: 1; padding: 8px; border-radius: 8px; border: 1px solid rgba(203, 213, 225, 0.35); background: rgba(15, 17, 22, 0.75); color: #94a3b8; font-family: "Source Code Pro", monospace; font-size: 0.8rem; font-weight: 700; text-transform: uppercase; cursor: pointer; }
    .auth-tab-btn.active { background: rgba(226, 232, 240, 0.22); border-color: #f8fafc; color: #ffffff; }

    .form-field { display: flex; flex-direction: column; gap: 4px; margin-bottom: 10px; }
    .form-field label { font-size: 0.77rem; font-family: "Source Code Pro", monospace; color: #e2e8f0; display: flex; justify-content: space-between; }
    .form-field input, .form-field select, .form-field textarea { padding: 9px 12px; border-radius: 8px; border: 1px solid rgba(203, 213, 225, 0.42); background: rgba(10, 11, 15, 0.85); color: #ffffff; font-size: 0.86rem; outline: none; }
    .form-field textarea { min-height: 68px; resize: vertical; }

    .btn-silver-primary {
      padding: 11px 16px; border-radius: 8px; border: 1px solid #ffffff;
      background: linear-gradient(135deg, #94a3b8, #e2e8f0, #cbd5e1) !important;
      color: #090a0f !important; font-family: "Source Code Pro", monospace; font-weight: 800;
      font-size: 0.88rem; letter-spacing: 0.08rem; text-transform: uppercase; cursor: pointer;
    }

    .status-banner { display: none; padding: 8px 11px; border-radius: 8px; font-size: 0.81rem; margin-bottom: 10px; }
    .status-banner.error { display: block; background: rgba(239, 68, 68, 0.2); border: 1px solid rgba(248, 113, 113, 0.7); color: #fecaca; }
    .status-banner.success { display: block; background: rgba(226, 232, 240, 0.18); border: 1px solid #ffffff; color: #ffffff; }

    /* ESTILO DEL BOTÓN INDIVIDUAL DE ESTRELLITA */
    .orbit-fav-btn {
      display: inline-flex !important;
      align-items: center;
      justify-content: center;
      gap: 6px;
      width: 100%;
      margin-top: 8px;
      padding: 8px 14px;
      border-radius: 999px;
      border: 1px solid rgba(226, 232, 240, 0.65) !important;
      background: rgba(12, 14, 19, 0.94) !important;
      color: #f8fafc !important;
      font-family: 'Segoe UI', system-ui, sans-serif;
      font-size: 0.8rem;
      font-weight: 700;
      cursor: pointer !important;
      pointer-events: auto !important;
      position: relative;
      z-index: 40 !important;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.55);
      transition: transform 0.18s ease, box-shadow 0.2s ease, border-color 0.2s ease, background 0.2s ease;
    }
    .orbit-fav-btn:hover {
      transform: translateY(-1px);
      border-color: #ffffff !important;
      box-shadow: 0 0 14px rgba(255, 255, 255, 0.45);
    }
    .orbit-fav-btn.saved {
      background: linear-gradient(135deg, rgba(250, 204, 21, 0.28), rgba(255, 255, 255, 0.22)) !important;
      border-color: #fde047 !important;
      color: #fef9c3 !important;
      box-shadow: 0 0 16px rgba(250, 204, 21, 0.45);
    }

    .fav-item-row { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 10px 12px; border-radius: 10px; border: 1px solid rgba(226, 232, 240, 0.32); background: rgba(10, 11, 15, 0.85); margin-bottom: 8px; }

    /* BOTÓN Y PANEL FLOTANTE Nova IA */
    .ai-fab-btn {
      position: fixed !important; bottom: 22px !important; left: 22px !important; z-index: 99999 !important;
      display: inline-flex !important; align-items: center; gap: 8px; padding: 11px 20px; border-radius: 999px;
      border: 1.5px solid rgba(226, 232, 240, 0.78) !important; background-color: rgba(12, 13, 16, 0.92) !important;
      color: #f8fafc !important; font-family: 'Orbitron', 'Segoe UI', sans-serif; font-weight: 700; font-size: 0.9rem; cursor: pointer !important;
    }
    .ai-fab-btn.pos-top { top: 18px !important; bottom: auto !important; }
    .ai-drawer {
      position: fixed !important; bottom: 78px !important; left: 22px !important;
      width: min(370px, calc(100vw - 36px)) !important; max-height: min(530px, calc(100vh - 110px)) !important;
      z-index: 99999 !important; display: none; flex-direction: column; border-radius: 18px !important; overflow: hidden;
      border: 1.5px solid rgba(226, 232, 240, 0.65) !important; background: rgba(12, 13, 17, 0.94) !important; color: #f8fafc !important;
    }
    .ai-drawer.pos-top { top: 74px !important; bottom: auto !important; }
    .ai-drawer.open { display: flex !important; }
    .ai-drawer-header { padding: 13px 16px !important; background: rgba(226, 232, 240, 0.18) !important; border-bottom: 1px solid rgba(226, 232, 240, 0.3) !important; display: flex; align-items: center; justify-content: space-between; }
    .ai-drawer-header h4 { margin: 0 !important; font-size: 0.98rem !important; color: #ffffff !important; }
    .ai-drawer-header small { display: block; font-size: 0.74rem !important; color: #cbd5e1 !important; }
    .ai-close-btn { width: 30px; height: 30px; border-radius: 50%; border: 1px solid rgba(226, 232, 240, 0.5) !important; background: rgba(255, 255, 255, 0.1) !important; color: #ffffff !important; cursor: pointer !important; }
    .ai-messages { flex: 1; padding: 14px; overflow-y: auto; display: flex; flex-direction: column; gap: 10px; }
    .ai-msg { max-width: 86%; padding: 10px 13px; border-radius: 14px; font-size: 0.88rem; line-height: 1.42; }
    .ai-msg.bot { align-self: flex-start; background: rgba(26, 29, 36, 0.9) !important; border: 1px solid rgba(226, 232, 240, 0.28) !important; color: #f1f5f9 !important; }
    .ai-msg.user { align-self: flex-end; background: linear-gradient(135deg, #cbd5e1, #ffffff) !important; color: #090a0f !important; font-weight: 700; }
    .ai-quick-prompts { padding: 8px 12px; display: flex; gap: 7px; overflow-x: auto; border-top: 1px solid rgba(226, 232, 240, 0.16); }
    .ai-chip { white-space: nowrap; padding: 6px 11px; border-radius: 999px; border: 1px solid rgba(226, 232, 240, 0.42) !important; background: rgba(255, 255, 255, 0.08) !important; color: #e2e8f0 !important; font-size: 0.77rem; cursor: pointer !important; }
    .ai-input-row { display: flex; gap: 8px; padding: 10px 12px; border-top: 1px solid rgba(226, 232, 240, 0.25); }
    .ai-input-row input { flex: 1; padding: 9px 12px; border-radius: 10px; border: 1px solid rgba(226, 232, 240, 0.35) !important; background: rgba(22, 24, 30, 0.92) !important; color: #ffffff !important; font-size: 0.86rem; outline: none; }
    .ai-input-row button { padding: 9px 15px; border-radius: 10px; border: none; background: linear-gradient(135deg, #cbd5e1, #ffffff) !important; color: #090a0f !important; font-weight: 800; cursor: pointer !important; }
  `;
  document.head.appendChild(style);
}

document.addEventListener("DOMContentLoaded", async () => {
  injectOrbitAIStyles();

  const supabaseLib = await loadSupabaseSDK();
  const sb = supabaseLib.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  let currentUser = null;
  let userFavoritosIds = new Set();
  let authMode = "login";
  const pageTitle = document.title || window.location.pathname;

  const uiContainer = document.createElement("div");
  uiContainer.innerHTML = `
    <div class="orbit-user-bar" id="orbit-user-bar">
      <button type="button" class="orbit-star-icon-btn" id="global-login-btn" aria-label="Iniciar Sesión">
        <span class="btn-ico">👤</span>
        <span class="btn-label">Iniciar Sesión</span>
      </button>
      <button type="button" class="orbit-star-icon-btn" id="global-favs-btn" style="display:none;" aria-label="Favoritos">
        <span class="btn-ico">⭐</span>
        <span class="btn-label" id="favs-btn-label">Favoritos (0)</span>
      </button>
      <button type="button" class="orbit-star-icon-btn" id="global-upload-btn" style="display:none;" aria-label="Subir Idea">
        <span class="btn-ico">➕</span>
        <span class="btn-label">Subir Idea</span>
      </button>
      <button type="button" class="orbit-star-icon-btn danger" id="global-logout-btn" style="display:none;" aria-label="Cerrar Sesión">
        <span class="btn-ico">🚪</span>
        <span class="btn-label" id="logout-btn-label">Salir</span>
      </button>
    </div>

    <button class="ai-fab-btn" id="open-ai-assistant" type="button"><span> Nova </span></button>

    <aside class="ai-drawer" id="ai-drawer">
      <div class="ai-drawer-header">
        <div>
          <h4>✨ Nova • Guía Creativa</h4>
          <small>Activo en: ${pageTitle.slice(0, 34)}</small>
        </div>
        <button class="ai-close-btn" id="close-ai-drawer" type="button">✕</button>
      </div>
      <div class="ai-messages" id="ai-messages">
        <div class="ai-msg bot">¡Hola! Soy <strong>Nova</strong>. Te ayudo a explorar <strong>Halloween, Día de Muertos, Navidad, Día de las Madres y Día del Padre</strong>, o a crear cualquier manualidad paso a paso. ¿Qué te gustaría hacer?</div>
      </div>
      <div class="ai-quick-prompts">
        <button type="button" class="ai-chip" data-prompt="Quiero ir a la sección de Navidad, ¿qué tiene y cómo entro?">🎄 Sección Navidad</button>
        <button type="button" class="ai-chip" data-prompt="Dame 3 ideas fáciles con cartón y papel para esta sección">📦 Ideas con cartón</button>
        <button type="button" class="ai-chip" data-prompt="¿Qué secciones tiene este sitio web y cómo entro?">🧭 Explorar sitio</button>
      </div>
      <form class="ai-input-row" id="ai-chat-form">
        <input type="text" id="ai-chat-input" placeholder="Pregúntale algo a la IA..." maxlength="300" required />
        <button type="submit" id="ai-chat-submit">Enviar</button>
      </form>
    </aside>

    <div class="global-modal-overlay" id="auth-modal">
      <div class="orbit-holo-screen login-size" id="orbit-login-screen">
        <div class="screen-image"></div>
        <div class="screen-overlay"></div>
        <div class="screen-content">
          <button class="ai-close-btn screen-top-close" id="close-auth-modal" type="button">✕</button>
          <div class="screen-header-brand">
            <span class="screen-scramble-title" id="auth-scramble-title" data-value="ACCESO">ACCESO</span>
            <span class="screen-subtitle">@MANUALIDADES_ORBIT</span>
          </div>
          <div>
            <div class="auth-tabs">
              <button type="button" class="auth-tab-btn active" data-auth-tab="login">Entrar</button>
              <button type="button" class="auth-tab-btn" data-auth-tab="register">Crear Cuenta</button>
            </div>
            <div class="status-banner" id="auth-status"></div>
            <form id="auth-form">
              <div class="form-field" id="register-name-field" style="display:none;">
                <label>Apodo Creativo <span>(3-25)</span></label>
                <input type="text" id="auth-name" minlength="3" maxlength="25" placeholder="Ej. LunaCreativa" />
              </div>
              <div class="form-field">
                <label>Correo Electrónico</label>
                <input type="email" id="auth-email" required placeholder="tu@correo.com" />
              </div>
              <div class="form-field">
                <label>Contraseña <span>(mín 6)</span></label>
                <input type="password" id="auth-password" minlength="6" required placeholder="••••••" />
              </div>
              <button type="submit" class="btn-silver-primary" style="width:100%; margin-top:8px;" id="auth-submit-btn">Iniciar Sesión</button>
            </form>
          </div>
        </div>
      </div>
    </div>

    <div class="global-modal-overlay" id="submit-idea-modal">
      <div class="orbit-holo-screen" id="orbit-idea-screen">
        <div class="screen-image"></div>
        <div class="screen-overlay"></div>
        <div class="screen-content">
          <button class="ai-close-btn screen-top-close" id="close-idea-modal" type="button">✕</button>
          <div class="screen-header-brand" style="margin-bottom:0.7rem;">
            <span class="screen-scramble-title" id="idea-scramble-title" data-value="PUBLICAR">PUBLICAR</span>
            <span class="screen-subtitle">@NUEVA_IDEA_IA</span>
          </div>
          <div class="status-banner" id="idea-status"></div>
          <form id="submit-idea-form">
            <div class="form-field">
              <label>Título de la manualidad <span id="cnt-titulo">0/80</span></label>
              <input type="text" id="idea-titulo" minlength="5" maxlength="80" required placeholder="Ej. Esfera navideña reciclada" />
            </div>
            <div class="form-field">
              <label>Categoría / Sección</label>
              <select id="idea-categoria" required>
                <option value="Halloween">🎃 Halloween</option>
                <option value="Día de Muertos">💀 Día de Muertos</option>
                <option value="Navidad">🎄 Navidad</option>
                <option value="Día de las Madres">💐 Día de las Madres</option>
                <option value="Día del Padre">👔 Día del Padre</option>
              </select>
            </div>
            <div class="form-field">
              <label>Costo aproximado <span>(máx 30)</span></label>
              <input type="text" id="idea-costo" maxlength="30" required placeholder="Ej. $50 MXN o Reciclado" />
            </div>
            <div class="form-field">
              <label>Materiales necesarios <span id="cnt-mat">0/600</span></label>
              <textarea id="idea-materiales" minlength="10" maxlength="600" required></textarea>
            </div>
            <div class="form-field">
              <label>Instrucciones Paso a Paso <span id="cnt-pasos">0/2000</span></label>
              <textarea id="idea-pasos" minlength="20" maxlength="2000" required></textarea>
            </div>
            <button type="submit" class="btn-silver-primary" style="width:100%; margin-top:4px;" id="publish-idea-btn">Verificar con IA y Publicar 🚀</button>
          </form>
        </div>
      </div>
    </div>

    <div class="global-modal-overlay" id="favs-modal">
      <div class="orbit-holo-screen login-size" id="orbit-favs-screen">
        <div class="screen-image"></div>
        <div class="screen-overlay"></div>
        <div class="screen-content" style="justify-content: flex-start;">
          <button class="ai-close-btn screen-top-close" id="close-favs-modal" type="button">✕</button>
          <div class="screen-header-brand" style="margin-bottom:0.75rem;">
            <span class="screen-scramble-title" id="favs-scramble-title" data-value="FAVORITOS">FAVORITOS</span>
            <span class="screen-subtitle">@MIS_GUARDADOS_ORBIT</span>
          </div>
          <p style="font-size:0.78rem; color:#cbd5e1; text-align:center; margin:0 0 12px;">
            Tus manualidades, lugares y productos guardados ⭐<br>(Pulsa <strong>✕</strong> para quitar)
          </p>
          <div id="favs-list-container" style="flex:1; overflow-y:auto;"></div>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(uiContainer);

  const rutaActual = (window.location.pathname + " " + pageTitle).toLowerCase();
  if (rutaActual.includes("padre")) {
    document.getElementById("orbit-user-bar")?.classList.add("pos-top");
    document.getElementById("open-ai-assistant")?.classList.add("pos-top");
    document.getElementById("ai-drawer")?.classList.add("pos-top");
  }

  const loginBtn = document.getElementById("global-login-btn");
  const favsBtn = document.getElementById("global-favs-btn");
  const favsBtnLabel = document.getElementById("favs-btn-label");
  const uploadBtn = document.getElementById("global-upload-btn");
  const logoutBtn = document.getElementById("global-logout-btn");
  const logoutBtnLabel = document.getElementById("logout-btn-label");

  function syncIndividualButtonsState() {
    document.querySelectorAll(".orbit-fav-btn[data-fav-item]").forEach((btn) => {
      const id = btn.getAttribute("data-fav-item");
      const isSaved = userFavoritosIds.has(id);
      btn.classList.toggle("saved", isSaved);
      btn.textContent = isSaved ? "⭐ En Mis Favoritos" : "☆ Guardar en Favoritos";
    });
  }
  window.syncIndividualButtonsState = syncIndividualButtonsState;

  async function abrirModalFavoritos() {
    document.getElementById("favs-modal").classList.add("open");
    await renderFavoritosModal();
  }

  loginBtn.addEventListener("click", () => document.getElementById("auth-modal").classList.add("open"));
  uploadBtn.addEventListener("click", () => document.getElementById("submit-idea-modal").classList.add("open"));
  favsBtn.addEventListener("click", abrirModalFavoritos);
  logoutBtn.addEventListener("click", async () => {
    await sb.auth.signOut();
    await updateSessionUI(null);
  });

  function getLocalBackupKey() {
    return currentUser ? `orbit_favs_backup_${currentUser.id}` : null;
  }
  function readLocalBackup() {
    const key = getLocalBackupKey();
    if (!key) return [];
    try { return JSON.parse(localStorage.getItem(key) || "[]"); } catch { return []; }
  }
  function writeLocalBackup(items) {
    const key = getLocalBackupKey();
    if (!key) return;
    try { localStorage.setItem(key, JSON.stringify(items)); } catch {}
  }

  async function loadUserFavoritos() {
    userFavoritosIds.clear();
    if (!currentUser) {
      if (favsBtnLabel) favsBtnLabel.textContent = "Favoritos (0)";
      syncIndividualButtonsState();
      return;
    }

    const { data, error } = await sb
      .from("favoritos_usuario")
      .select("*")
      .eq("user_id", currentUser.id)
      .order("created_at", { ascending: false });

    const localItems = readLocalBackup();
    const mergedMap = new Map();

    localItems.forEach((row) => mergedMap.set(row.item_id, row));
    if (!error && Array.isArray(data)) {
      data.forEach((row) => mergedMap.set(row.item_id, row));
    }

    const finalItems = Array.from(mergedMap.values());
    finalItems.forEach((row) => userFavoritosIds.add(row.item_id));
    writeLocalBackup(finalItems);

    if (favsBtnLabel) favsBtnLabel.textContent = `Favoritos (${userFavoritosIds.size})`;
    syncIndividualButtonsState();
  }

  // FUNCIÓN INDIVIDUAL QUE GUARDA EN MEMORIA + LOCALSTORAGE + SUPABASE
  window.guardarEnFavoritosYRedirigir = async function (itemId, titulo, categoria, enlaceGuardado) {
    if (!currentUser) {
      document.getElementById("auth-modal").classList.add("open");
      const statusEl = document.getElementById("auth-status");
      statusEl.textContent = "Inicia sesión o crea una cuenta para guardar en Mis Favoritos ⭐";
      statusEl.className = "status-banner error";
      return;
    }

    const nuevoFav = {
      user_id: currentUser.id,
      item_id: itemId,
      titulo: titulo || "Elemento guardado",
      categoria: categoria || "Favorito",
      url_pagina: enlaceGuardado || window.location.pathname
    };

    if (!userFavoritosIds.has(itemId)) {
      // 1. Guardado inmediato en memoria y respaldo local para que nunca se pierda
      userFavoritosIds.add(itemId);
      const backup = readLocalBackup().filter((f) => f.item_id !== itemId);
      backup.unshift({ ...nuevoFav, created_at: new Date().toISOString() });
      writeLocalBackup(backup);

      // 2. Sincronizar en Supabase
      const { error } = await sb.from("favoritos_usuario").insert([nuevoFav]);
      if (error) {
        console.warn("Aviso Supabase favoritos_usuario:", error.message);
      }
    }

    if (favsBtnLabel) favsBtnLabel.textContent = `Favoritos (${userFavoritosIds.size})`;
    syncIndividualButtonsState();
    await abrirModalFavoritos();
  };

  async function eliminarFavoritoDesdeModal(itemId) {
    if (!currentUser) return;

    userFavoritosIds.delete(itemId);
    writeLocalBackup(readLocalBackup().filter((f) => f.item_id !== itemId));

    await sb
      .from("favoritos_usuario")
      .delete()
      .eq("user_id", currentUser.id)
      .eq("item_id", itemId);

    if (favsBtnLabel) favsBtnLabel.textContent = `Favoritos (${userFavoritosIds.size})`;
    syncIndividualButtonsState();
    await renderFavoritosModal();
  }

  async function renderFavoritosModal() {
    const container = document.getElementById("favs-list-container");
    if (!currentUser) return;
    container.innerHTML = `<p style="font-size:0.86rem; color:#94a3b8; text-align:center;">Cargando favoritos...</p>`;

    const { data, error } = await sb
      .from("favoritos_usuario")
      .select("*")
      .eq("user_id", currentUser.id)
      .order("created_at", { ascending: false });

    const localItems = readLocalBackup();
    const mergedMap = new Map();

    if (!error && Array.isArray(data)) {
      data.forEach((row) => mergedMap.set(row.item_id, row));
    }
    localItems.forEach((row) => {
      if (!mergedMap.has(row.item_id)) mergedMap.set(row.item_id, row);
    });

    const listaFinal = Array.from(mergedMap.values());

    if (!listaFinal || listaFinal.length === 0) {
      container.innerHTML = `<p style="font-size:0.86rem; color:#94a3b8; text-align:center; padding:16px 0;">Aún no tienes favoritos guardados.</p>`;
      return;
    }

    container.innerHTML = listaFinal
      .map((fav) => {
        const esExterno = fav.url_pagina && fav.url_pagina.startsWith("http");
        const targetAttr = esExterno ? `target="_blank" rel="noopener noreferrer"` : "";
        return `
          <div class="fav-item-row">
            <div style="min-width:0;">
              <strong style="color:#fff; font-size:0.9rem; display:block; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${fav.titulo}</strong>
              <small style="color:#cbd5e1;">${fav.categoria}</small>
            </div>
            <div style="display:flex; gap:6px; flex-shrink:0;">
              ${fav.url_pagina ? `<a href="${fav.url_pagina}" ${targetAttr} class="orbit-star-icon-btn" style="text-decoration:none; height:32px; padding:0 12px; font-size:0.72rem;">Abrir 🔗</a>` : ""}
              <button type="button" class="orbit-star-icon-btn danger" style="height:32px; min-width:32px; padding:0 8px;" data-del-fav="${fav.item_id}">✕</button>
            </div>
          </div>
        `;
      })
      .join("");

    container.querySelectorAll("[data-del-fav]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        await eliminarFavoritoDesdeModal(btn.getAttribute("data-del-fav"));
      });
    });
  }

  async function updateSessionUI(user) {
    currentUser = user;
    if (user) {
      const displayName = user.user_metadata?.display_name || user.email.split("@")[0];
      loginBtn.style.display = "none";
      favsBtn.style.display = "inline-flex";
      uploadBtn.style.display = "inline-flex";
      logoutBtn.style.display = "inline-flex";
      if (logoutBtnLabel) logoutBtnLabel.textContent = `Salir (${displayName})`;
    } else {
      loginBtn.style.display = "inline-flex";
      favsBtn.style.display = "none";
      uploadBtn.style.display = "none";
      logoutBtn.style.display = "none";
    }
    await loadUserFavoritos();
  }

  const { data: sessionData } = await sb.auth.getSession();
  await updateSessionUI(sessionData?.session?.user || null);

  sb.auth.onAuthStateChange(async (_event, session) => {
    await updateSessionUI(session?.user || null);
  });

  document.querySelectorAll("[data-auth-tab]").forEach((tab) => {
    tab.addEventListener("click", () => {
      document.querySelectorAll("[data-auth-tab]").forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      authMode = tab.getAttribute("data-auth-tab");
      document.getElementById("register-name-field").style.display = authMode === "register" ? "flex" : "none";
      document.getElementById("auth-submit-btn").textContent = authMode === "register" ? "Registrarme" : "Iniciar Sesión";
    });
  });

  document.getElementById("auth-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const statusEl = document.getElementById("auth-status");
    const email = document.getElementById("auth-email").value.trim();
    const password = document.getElementById("auth-password").value;
    const name = document.getElementById("auth-name").value.trim();
    statusEl.className = "status-banner";

    if (authMode === "register") {
      if (contieneLenguajeOfensivo(name)) {
        statusEl.textContent = "El nombre elegido contiene lenguaje no permitido.";
        statusEl.classList.add("error");
        return;
      }
      const { error } = await sb.auth.signUp({ email, password, options: { data: { display_name: name || email.split("@")[0] } } });
      if (error) { statusEl.textContent = error.message; statusEl.classList.add("error"); }
      else {
        statusEl.textContent = "¡Cuenta creada! Ya puedes guardar favoritos.";
        statusEl.classList.add("success");
        setTimeout(() => document.getElementById("auth-modal").classList.remove("open"), 1100);
      }
    } else {
      const { error } = await sb.auth.signInWithPassword({ email, password });
      if (error) { statusEl.textContent = "Correo o contraseña incorrectos."; statusEl.classList.add("error"); }
      else { document.getElementById("auth-modal").classList.remove("open"); }
    }
  });

  document.getElementById("submit-idea-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!currentUser) return;
    const statusEl = document.getElementById("idea-status");
    const btn = document.getElementById("publish-idea-btn");
    const payload = {
      titulo: document.getElementById("idea-titulo").value.trim(),
      categoria: document.getElementById("idea-categoria").value,
      costo_aprox: document.getElementById("idea-costo").value.trim(),
      materiales: document.getElementById("idea-materiales").value.trim(),
      pasos: document.getElementById("idea-pasos").value.trim()
    };
    if (contieneLenguajeOfensivo(`${payload.titulo} ${payload.materiales} ${payload.pasos}`)) {
      statusEl.textContent = "⚠️ Tu publicación contiene palabras no permitidas.";
      statusEl.className = "status-banner error";
      return;
    }
    btn.disabled = true;
    try {
      const modRes = await fetch("/api/ai-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "moderate_idea", ideaPayload: payload })
      });
      const modData = await modRes.json();
      if (!modRes.ok || !modData.aprobado) {
        statusEl.textContent = `❌ ${modData.motivo || modData.error}`;
        statusEl.className = "status-banner error";
        btn.disabled = false;
        return;
      }
      const autorNombre = currentUser.user_metadata?.display_name || currentUser.email.split("@")[0];
      const { error } = await sb.from("ideas_comunidad").insert([{ user_id: currentUser.id, autor_nombre: autorNombre, ...payload, consejo_ia: modData.sugerencia_ia || "" }]);
      if (error) throw error;
      statusEl.textContent = `✅ ¡Publicada!`;
      statusEl.className = "status-banner success";
      e.target.reset();
      setTimeout(() => document.getElementById("submit-idea-modal").classList.remove("open"), 1800);
    } catch (err) {
      statusEl.textContent = "Error: " + err.message;
      statusEl.className = "status-banner error";
    } finally {
      btn.disabled = false;
    }
  });

  document.getElementById("close-auth-modal").addEventListener("click", () => document.getElementById("auth-modal").classList.remove("open"));
  document.getElementById("close-idea-modal").addEventListener("click", () => document.getElementById("submit-idea-modal").classList.remove("open"));
  document.getElementById("close-favs-modal").addEventListener("click", () => document.getElementById("favs-modal").classList.remove("open"));

  const aiDrawer = document.getElementById("ai-drawer");
  const aiMessages = document.getElementById("ai-messages");
  const aiInput = document.getElementById("ai-chat-input");
  document.getElementById("open-ai-assistant").addEventListener("click", () => aiDrawer.classList.toggle("open"));
  document.getElementById("close-ai-drawer").addEventListener("click", () => aiDrawer.classList.remove("open"));

  async function sendToAI(text) {
    if (!text.trim()) return;
    const u = document.createElement("div"); u.className = "ai-msg user"; u.textContent = text; aiMessages.appendChild(u);
    const b = document.createElement("div"); b.className = "ai-msg bot"; b.textContent = "Pensando... ✨"; aiMessages.appendChild(b);
    try {
      const res = await fetch("/api/ai-assistant", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "chat", message: text, pageContext: pageTitle })
      });
      const data = await res.json();
      b.textContent = data.reply || data.error || "Sin respuesta.";
    } catch { b.textContent = "No pude conectarme con Nova."; }
    aiMessages.scrollTop = aiMessages.scrollHeight;
  }

  document.getElementById("ai-chat-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const m = aiInput.value; aiInput.value = ""; sendToAI(m);
  });
  document.querySelectorAll(".ai-chip").forEach((c) => c.addEventListener("click", () => sendToAI(c.getAttribute("data-prompt"))));
});