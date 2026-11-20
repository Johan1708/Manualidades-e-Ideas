/* ==========================================================================
   AUTH + FAVORITOS + MODERACIÓN DE IDEAS + ASISTENTE IA GLOBAL (ESTÉTICA ORBIT)
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

// Inyectar estilos globales con estética Orbit (Vidrio oscuro + Neón Cian + Plata metálico)
function injectOrbitAIStyles() {
  if (document.getElementById("chispa-orbit-theme")) return;
  const style = document.createElement("style");
  style.id = "chispa-orbit-theme";
  style.textContent = `
    /* BARRA GLOBAL DE SESIÓN Y ACCIONES (ARRIBA A LA DERECHA EN TODAS LAS PÁGINAS) */
    .orbit-user-bar {
      position: fixed !important;
      top: 18px !important;
      right: 22px !important;
      z-index: 99999 !important;
      display: flex !important;
      align-items: center;
      gap: 9px;
      flex-wrap: wrap;
      justify-content: flex-end;
    }
    .orbit-pill-btn {
      padding: 9px 16px;
      border-radius: 999px;
      border: 1.5px solid rgba(0, 240, 255, 0.7) !important;
      background: rgba(10, 16, 26, 0.9) !important;
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      color: #e8fcff !important;
      font-family: 'Orbitron', 'Segoe UI', sans-serif;
      font-size: 0.8rem;
      font-weight: 700;
      letter-spacing: 0.4px;
      cursor: pointer;
      box-shadow: 0 0 15px rgba(0, 240, 255, 0.3) !important;
      transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
    }
    .orbit-pill-btn:hover {
      border-color: #00f0ff !important;
      transform: translateY(-1px);
      box-shadow: 0 0 22px rgba(0, 240, 255, 0.65) !important;
    }
    .orbit-pill-btn.primary {
      background: linear-gradient(135deg, #00a8d6, #00f0ff) !important;
      color: #03121a !important;
      border: none !important;
    }
    .orbit-pill-btn.danger {
      border-color: rgba(255, 95, 115, 0.65) !important;
      color: #ffc2cb !important;
    }
    .orbit-pill-btn.danger:hover {
      border-color: #ff5f73 !important;
      box-shadow: 0 0 16px rgba(255, 95, 115, 0.5) !important;
    }

    /* BOTÓN FAVORITOS EN TARJETAS */
    .orbit-fav-btn {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      margin-top: 8px;
      padding: 6px 12px;
      border-radius: 999px;
      border: 1px solid rgba(0, 240, 255, 0.45);
      background: rgba(12, 20, 32, 0.85);
      color: #bdf6ff;
      font-size: 0.78rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .orbit-fav-btn.saved {
      background: rgba(255, 204, 0, 0.18);
      border-color: #ffd54f;
      color: #ffe57f;
      box-shadow: 0 0 12px rgba(255, 213, 79, 0.35);
    }

    /* GRID DE IDEAS DE LA COMUNIDAD */
    .comunidad-grid-wrapper {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(270px, 1fr));
      gap: 18px;
      margin: 24px auto;
      max-width: 1140px;
      padding: 0 16px;
    }
    .comunidad-card {
      padding: 18px;
      border-radius: 16px;
      border: 1px solid rgba(0, 240, 255, 0.35);
      background: rgba(12, 18, 28, 0.88);
      backdrop-filter: blur(10px);
      color: #eef7ff;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.45);
    }
    .comunidad-card h4 { margin: 6px 0 8px; color: #ffffff; font-size: 1.05rem; }
    .comunidad-badge {
      display: inline-block;
      padding: 3px 10px;
      border-radius: 999px;
      font-size: 0.72rem;
      font-weight: 700;
      background: rgba(0, 240, 255, 0.16);
      border: 1px solid rgba(0, 240, 255, 0.45);
      color: #6ef6ff;
    }
    .comunidad-meta { font-size: 0.78rem; color: #9ac5d6; margin-bottom: 10px; }
    .comunidad-detail {
      font-size: 0.84rem;
      line-height: 1.45;
      color: #d8ecf5;
      white-space: pre-line;
      margin-top: 6px;
    }
    .fav-item-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      padding: 10px 12px;
      border-radius: 10px;
      border: 1px solid rgba(0, 240, 255, 0.25);
      background: rgba(16, 24, 36, 0.85);
      margin-bottom: 8px;
    }

    /* BOTÓN FLOTANTE CHISPA IA - SIEMPRE VISIBLE */
    .ai-fab-btn {
      position: fixed !important;
      bottom: 22px !important;
      left: 22px !important;
      z-index: 99999 !important;
      display: inline-flex !important;
      align-items: center;
      gap: 8px;
      padding: 11px 20px;
      border-radius: 999px;
      border: 1.5px solid rgba(0, 240, 255, 0.75) !important;
      background: linear-gradient(135deg, rgba(12, 18, 28, 0.92), rgba(22, 34, 48, 0.92)) !important;
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      color: #e8fcff !important;
      font-family: 'Orbitron', 'Segoe UI', sans-serif;
      font-weight: 700;
      font-size: 0.92rem;
      letter-spacing: 0.6px;
      cursor: pointer;
      box-shadow: 0 0 18px rgba(0, 240, 255, 0.35), inset 0 0 10px rgba(0, 240, 255, 0.15) !important;
      transition: transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease;
    }
    .ai-fab-btn:hover {
      transform: translateY(-2px) scale(1.03);
      border-color: #00f0ff !important;
      box-shadow: 0 0 26px rgba(0, 240, 255, 0.65), inset 0 0 14px rgba(0, 240, 255, 0.25) !important;
    }

    /* PANEL DE CHAT IA - ESTÉTICA HOLOGRÁFICA ORBIT */
    .ai-drawer {
      position: fixed !important;
      bottom: 78px !important;
      left: 22px !important;
      width: min(370px, calc(100vw - 36px)) !important;
      max-height: min(530px, calc(100vh - 110px)) !important;
      z-index: 99999 !important;
      display: none;
      flex-direction: column;
      border-radius: 18px !important;
      overflow: hidden;
      border: 1.5px solid rgba(0, 240, 255, 0.55) !important;
      background: rgba(10, 14, 22, 0.92) !important;
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      box-shadow: 0 16px 45px rgba(0, 0, 0, 0.8), 0 0 28px rgba(0, 240, 255, 0.25) !important;
      color: #eef6ff !important;
      font-family: 'Segoe UI', system-ui, sans-serif;
    }
    .ai-drawer.open {
      display: flex !important;
      animation: orbitFadeIn 0.22s ease-out;
    }
    @keyframes orbitFadeIn {
      from { opacity: 0; transform: translateY(10px) scale(0.98); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }

    /* ENCABEZADO DEL PANEL */
    .ai-drawer-header {
      padding: 13px 16px !important;
      background: linear-gradient(135deg, rgba(0, 195, 255, 0.24), rgba(18, 26, 40, 0.95)) !important;
      border-bottom: 1px solid rgba(0, 240, 255, 0.35) !important;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
    }
    .ai-drawer-header h4 {
      margin: 0 !important;
      font-size: 0.98rem !important;
      font-weight: 800;
      letter-spacing: 0.5px;
      color: #ffffff !important;
      text-shadow: 0 0 10px rgba(0, 240, 255, 0.7);
    }
    .ai-drawer-header small {
      display: block;
      margin-top: 2px;
      font-size: 0.74rem !important;
      color: #8eeeff !important;
    }

    .ai-close-btn {
      width: 30px;
      height: 30px;
      border-radius: 50%;
      border: 1px solid rgba(0, 240, 255, 0.4) !important;
      background: rgba(0, 240, 255, 0.1) !important;
      color: #d8fbff !important;
      font-size: 0.9rem;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      transition: background 0.2s, border-color 0.2s;
    }
    .ai-close-btn:hover {
      background: rgba(0, 240, 255, 0.28) !important;
      border-color: #00f0ff !important;
    }

    /* ÁREA DE MENSAJES */
    .ai-messages {
      flex: 1;
      padding: 14px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 10px;
      scrollbar-width: thin;
      scrollbar-color: rgba(0, 240, 255, 0.45) transparent;
    }
    .ai-msg {
      max-width: 86%;
      padding: 10px 13px;
      border-radius: 14px;
      font-size: 0.88rem;
      line-height: 1.42;
      word-wrap: break-word;
    }
    .ai-msg.bot {
      align-self: flex-start;
      background: rgba(24, 34, 50, 0.88) !important;
      border: 1px solid rgba(0, 240, 255, 0.28) !important;
      color: #e6f4ff !important;
      border-bottom-left-radius: 4px;
    }
    .ai-msg.bot strong {
      color: #4ef4ff !important;
    }
    .ai-msg.user {
      align-self: flex-end;
      background: linear-gradient(135deg, #0099cc, #00d4ff) !important;
      color: #041019 !important;
      font-weight: 600;
      border-bottom-right-radius: 4px;
      box-shadow: 0 4px 14px rgba(0, 212, 255, 0.3);
    }

    /* CHIPS DE PREGUNTAS RÁPIDAS */
    .ai-quick-prompts {
      padding: 8px 12px;
      display: flex;
      gap: 7px;
      overflow-x: auto;
      border-top: 1px solid rgba(0, 240, 255, 0.16);
      background: rgba(8, 12, 19, 0.7);
      scrollbar-width: thin;
      scrollbar-color: rgba(0, 240, 255, 0.35) transparent;
    }
    .ai-chip {
      white-space: nowrap;
      padding: 6px 11px;
      border-radius: 999px;
      border: 1px solid rgba(0, 240, 255, 0.42) !important;
      background: rgba(0, 240, 255, 0.08) !important;
      color: #baf6ff !important;
      font-size: 0.77rem;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .ai-chip:hover {
      background: rgba(0, 240, 255, 0.22) !important;
      border-color: #00f0ff !important;
      color: #ffffff !important;
    }

    /* BARRA DE ESCRITURA */
    .ai-input-row {
      display: flex;
      gap: 8px;
      padding: 10px 12px;
      border-top: 1px solid rgba(0, 240, 255, 0.25);
      background: rgba(8, 12, 19, 0.95);
    }
    .ai-input-row input {
      flex: 1;
      padding: 9px 12px;
      border-radius: 10px;
      border: 1px solid rgba(0, 240, 255, 0.35) !important;
      background: rgba(18, 26, 38, 0.9) !important;
      color: #ffffff !important;
      font-size: 0.86rem;
      outline: none;
    }
    .ai-input-row input::placeholder {
      color: #7ea4b8 !important;
    }
    .ai-input-row input:focus {
      border-color: #00f0ff !important;
      box-shadow: 0 0 10px rgba(0, 240, 255, 0.3);
    }
    .ai-input-row button {
      padding: 9px 15px;
      border-radius: 10px;
      border: none;
      background: linear-gradient(135deg, #00b8e6, #00f0ff) !important;
      color: #03121a !important;
      font-weight: 800;
      font-size: 0.85rem;
      cursor: pointer;
      box-shadow: 0 0 12px rgba(0, 240, 255, 0.4);
      transition: transform 0.15s ease, box-shadow 0.15s ease;
    }
    .ai-input-row button:hover:not(:disabled) {
      transform: scale(1.03);
      box-shadow: 0 0 18px rgba(0, 240, 255, 0.7);
    }

    /* MODALES GLOBALES (LOGIN, FAVORITOS Y SUBIR IDEA) EN ESTÉTICA ORBIT */
    .global-modal-overlay {
      position: fixed !important;
      inset: 0 !important;
      z-index: 100000 !important;
      display: none;
      align-items: center;
      justify-content: center;
      padding: 16px;
      background: rgba(4, 7, 13, 0.82) !important;
      backdrop-filter: blur(10px);
    }
    .global-modal-overlay.open {
      display: flex !important;
    }
    .global-modal-card {
      width: min(460px, 100%);
      max-height: 90vh;
      overflow-y: auto;
      padding: 22px;
      border-radius: 18px;
      border: 1.5px solid rgba(0, 240, 255, 0.5) !important;
      background: linear-gradient(160deg, rgba(13, 19, 30, 0.96), rgba(8, 12, 20, 0.98)) !important;
      box-shadow: 0 0 35px rgba(0, 240, 255, 0.25) !important;
      color: #eef7ff !important;
      font-family: 'Segoe UI', system-ui, sans-serif;
    }
    .global-modal-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 14px;
    }
    .global-modal-top h3 {
      margin: 0;
      color: #ffffff !important;
      text-shadow: 0 0 10px rgba(0, 240, 255, 0.6);
    }
    .auth-tabs {
      display: flex;
      gap: 8px;
      margin-bottom: 14px;
    }
    .auth-tab-btn {
      flex: 1;
      padding: 8px;
      border-radius: 10px;
      border: 1px solid rgba(0, 240, 255, 0.3);
      background: rgba(255, 255, 255, 0.04);
      color: #a9d8e6;
      font-weight: 600;
      cursor: pointer;
    }
    .auth-tab-btn.active {
      background: rgba(0, 240, 255, 0.2);
      border-color: #00f0ff;
      color: #ffffff;
    }
    .form-field {
      display: flex;
      flex-direction: column;
      gap: 5px;
      margin-bottom: 12px;
    }
    .form-field label {
      font-size: 0.83rem;
      color: #b8e6f5;
      display: flex;
      justify-content: space-between;
    }
    .form-field input,
    .form-field select,
    .form-field textarea {
      padding: 9px 12px;
      border-radius: 10px;
      border: 1px solid rgba(0, 240, 255, 0.35);
      background: rgba(16, 24, 36, 0.92);
      color: #ffffff;
      font-size: 0.88rem;
      outline: none;
    }
    .form-field textarea {
      min-height: 75px;
      resize: vertical;
    }
    .btn-spooky-primary {
      padding: 11px 16px;
      border-radius: 10px;
      border: none;
      background: linear-gradient(135deg, #00a8d6, #00f0ff) !important;
      color: #03121a !important;
      font-weight: 800;
      cursor: pointer;
      box-shadow: 0 0 16px rgba(0, 240, 255, 0.4);
    }
    .status-banner {
      display: none;
      padding: 9px 12px;
      border-radius: 10px;
      font-size: 0.83rem;
      margin-bottom: 12px;
    }
    .status-banner.error {
      display: block;
      background: rgba(255, 65, 90, 0.16);
      border: 1px solid rgba(255, 80, 100, 0.6);
      color: #ffb3be;
    }
    .status-banner.success {
      display: block;
      background: rgba(0, 240, 180, 0.15);
      border: 1px solid rgba(0, 240, 180, 0.55);
      color: #9effe6;
    }
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
    <!-- BARRA GLOBAL DE SESIÓN, FAVORITOS Y PUBLICAR IDEA -->
    <div class="orbit-user-bar" id="orbit-user-bar">
      <button type="button" class="orbit-pill-btn" id="global-login-btn">👤 Iniciar Sesión</button>
      <button type="button" class="orbit-pill-btn" id="global-favs-btn" style="display:none;">⭐ Favoritos (0)</button>
      <button type="button" class="orbit-pill-btn primary" id="global-upload-btn" style="display:none;">+ Subir Idea</button>
      <button type="button" class="orbit-pill-btn danger" id="global-logout-btn" style="display:none;">Salir</button>
    </div>

    <!-- BOTÓN FLOTANTE IA -->
    <button class="ai-fab-btn" id="open-ai-assistant" type="button">
      <span>✨ Chispa IA</span>
    </button>

    <!-- PANEL DE CHAT IA -->
    <aside class="ai-drawer" id="ai-drawer">
      <div class="ai-drawer-header">
        <div>
          <h4>✨ Chispa IA • Guía Creativa</h4>
          <small>Activo en: ${pageTitle.slice(0, 34)}</small>
        </div>
        <button class="ai-close-btn" id="close-ai-drawer" type="button">✕</button>
      </div>

      <div class="ai-messages" id="ai-messages">
        <div class="ai-msg bot">¡Hola! Soy <strong>Chispa IA</strong>. Te ayudo a explorar <strong>Halloween, Día de Muertos, Navidad, Día de las Madres y Día del Padre</strong>, o a crear cualquier manualidad paso a paso. ¿Qué te gustaría hacer?</div>
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

    <!-- MODAL LOGIN / REGISTRO -->
    <div class="global-modal-overlay" id="auth-modal">
      <div class="global-modal-card">
        <div class="global-modal-top">
          <h3 id="auth-modal-heading">Iniciar Sesión</h3>
          <button class="ai-close-btn" id="close-auth-modal" type="button">✕</button>
        </div>

        <div class="auth-tabs">
          <button type="button" class="auth-tab-btn active" data-auth-tab="login">Entrar</button>
          <button type="button" class="auth-tab-btn" data-auth-tab="register">Crear Cuenta</button>
        </div>

        <div class="status-banner" id="auth-status"></div>

        <form id="auth-form">
          <div class="form-field" id="register-name-field" style="display:none;">
            <label>Nombre o Apodo Creativo <span>(3-25 caracteres)</span></label>
            <input type="text" id="auth-name" minlength="3" maxlength="25" placeholder="Ej. LunaCreativa" />
          </div>

          <div class="form-field">
            <label>Correo Electrónico</label>
            <input type="email" id="auth-email" required placeholder="tu@correo.com" />
          </div>

          <div class="form-field">
            <label>Contraseña <span>(mínimo 6 caracteres)</span></label>
            <input type="password" id="auth-password" minlength="6" required placeholder="••••••" />
          </div>

          <button type="submit" class="btn-spooky-primary" style="width:100%; margin-top:6px;" id="auth-submit-btn">
            Iniciar Sesión
          </button>
        </form>
      </div>
    </div>

    <!-- MODAL SUBIR IDEA CON PARÁMETROS Y REVISIÓN IA -->
    <div class="global-modal-overlay" id="submit-idea-modal">
      <div class="global-modal-card">
        <div class="global-modal-top">
          <h3>✨ Publicar Nueva Idea</h3>
          <button class="ai-close-btn" id="close-idea-modal" type="button">✕</button>
        </div>

        <p style="font-size:0.84rem; color:#b8e6f5; margin-top:0;">
          Tu idea será revisada por <strong>Chispa IA</strong> para verificar lenguaje respetuoso y claridad antes de publicarse.
        </p>

        <div class="status-banner" id="idea-status"></div>

        <form id="submit-idea-form">
          <div class="form-field">
            <label>Título de la manualidad <span class="char-counter" id="cnt-titulo">0/80</span></label>
            <input type="text" id="idea-titulo" minlength="5" maxlength="80" required placeholder="Ej. Esfera navideña con botella reciclada" />
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
            <label>Costo aproximado <span class="char-counter">(máx 30 caracteres)</span></label>
            <input type="text" id="idea-costo" maxlength="30" required placeholder="Ej. $50 MXN o Material reciclado" />
          </div>

          <div class="form-field">
            <label>Materiales necesarios <span class="char-counter" id="cnt-mat">0/600</span></label>
            <textarea id="idea-materiales" minlength="10" maxlength="600" required placeholder="- 1 botella de plástico
- Pintura acrílica
- Luz LED"></textarea>
          </div>

          <div class="form-field">
            <label>Instrucciones Paso a Paso <span class="char-counter" id="cnt-pasos">0/2000</span></label>
            <textarea id="idea-pasos" minlength="20" maxlength="2000" required placeholder="1. Lava y seca la botella...
2. Pinta dos capas..."></textarea>
          </div>

          <button type="submit" class="btn-spooky-primary" style="width:100%;" id="publish-idea-btn">
            Verificar con IA y Publicar 🚀
          </button>
        </form>
      </div>
    </div>

    <!-- MODAL MIS FAVORITOS -->
    <div class="global-modal-overlay" id="favs-modal">
      <div class="global-modal-card">
        <div class="global-modal-top">
          <h3>⭐ Mis Ideas Favoritas</h3>
          <button class="ai-close-btn" id="close-favs-modal" type="button">✕</button>
        </div>
        <div id="favs-list-container">
          <p style="font-size:0.86rem; color:#9ac5d6;">Cargando favoritos...</p>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(uiContainer);

  const bindCounter = (inputId, counterId, max) => {
    const el = document.getElementById(inputId);
    const cnt = document.getElementById(counterId);
    if (el && cnt) {
      el.addEventListener("input", () => (cnt.textContent = `${el.value.length}/${max}`));
    }
  };
  bindCounter("idea-titulo", "cnt-titulo", 80);
  bindCounter("idea-materiales", "cnt-mat", 600);
  bindCounter("idea-pasos", "cnt-pasos", 2000);

  const loginBtn = document.getElementById("global-login-btn");
  const favsBtn = document.getElementById("global-favs-btn");
  const uploadBtn = document.getElementById("global-upload-btn");
  const logoutBtn = document.getElementById("global-logout-btn");

  loginBtn.addEventListener("click", () => {
    document.getElementById("auth-modal").classList.add("open");
  });
  uploadBtn.addEventListener("click", () => {
    document.getElementById("submit-idea-modal").classList.add("open");
  });
  favsBtn.addEventListener("click", async () => {
    document.getElementById("favs-modal").classList.add("open");
    await renderFavoritosModal();
  });
  logoutBtn.addEventListener("click", async () => {
    await sb.auth.signOut();
    await updateSessionUI(null);
  });

  async function loadUserFavoritos() {
    userFavoritosIds.clear();
    if (!currentUser) {
      favsBtn.textContent = "⭐ Favoritos (0)";
      refreshFavButtonsOnPage();
      return;
    }
    const { data } = await sb
      .from("favoritos_usuario")
      .select("item_id")
      .eq("user_id", currentUser.id);

    if (Array.isArray(data)) {
      data.forEach((row) => userFavoritosIds.add(row.item_id));
    }
    favsBtn.textContent = `⭐ Favoritos (${userFavoritosIds.size})`;
    refreshFavButtonsOnPage();
  }

  window.toggleFavorito = async function (itemId, titulo, categoria) {
    if (!currentUser) {
      document.getElementById("auth-modal").classList.add("open");
      const statusEl = document.getElementById("auth-status");
      statusEl.textContent = "Inicia sesión o crea una cuenta para guardar tus favoritos ⭐";
      statusEl.className = "status-banner error";
      return;
    }

    if (userFavoritosIds.has(itemId)) {
      await sb
        .from("favoritos_usuario")
        .delete()
        .eq("user_id", currentUser.id)
        .eq("item_id", itemId);
    } else {
      await sb.from("favoritos_usuario").insert([
        {
          user_id: currentUser.id,
          item_id: itemId,
          titulo,
          categoria,
          url_pagina: window.location.pathname
        }
      ]);
    }
    await loadUserFavoritos();
  };

  function refreshFavButtonsOnPage() {
    document.querySelectorAll("[data-fav-id]").forEach((card) => {
      const itemId = card.getAttribute("data-fav-id");
      const titulo = card.getAttribute("data-fav-title") || "Manualidad";
      const categoria = card.getAttribute("data-fav-cat") || pageTitle;

      let btn = card.querySelector(".orbit-fav-btn");
      if (!btn) {
        btn = document.createElement("button");
        btn.type = "button";
        btn.className = "orbit-fav-btn";
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          window.toggleFavorito(itemId, titulo, categoria);
        });
        card.appendChild(btn);
      }

      const isSaved = userFavoritosIds.has(itemId);
      btn.classList.toggle("saved", isSaved);
      btn.textContent = isSaved ? "⭐ Guardado en Favoritos" : "☆ Guardar en Favoritos";
    });
  }

  async function renderFavoritosModal() {
    const container = document.getElementById("favs-list-container");
    if (!currentUser) return;
    container.innerHTML = `<p style="font-size:0.86rem; color:#9ac5d6;">Cargando favoritos...</p>`;

    const { data, error } = await sb
      .from("favoritos_usuario")
      .select("*")
      .eq("user_id", currentUser.id)
      .order("created_at", { ascending: false });

    if (error || !data || data.length === 0) {
      container.innerHTML = `<p style="font-size:0.86rem; color:#9ac5d6;">Aún no tienes manualidades guardadas. Haz clic en "☆ Guardar en Favoritos" en cualquier idea.</p>`;
      return;
    }

    container.innerHTML = data
      .map(
        (fav) => `
        <div class="fav-item-row">
          <div>
            <strong style="color:#fff; font-size:0.9rem;">${fav.titulo}</strong><br/>
            <small style="color:#7ce8ff;">${fav.categoria}</small>
          </div>
          <div style="display:flex; gap:6px;">
            ${fav.url_pagina ? `<a href="${fav.url_pagina}" class="orbit-pill-btn" style="text-decoration:none; padding:5px 10px; font-size:0.74rem;">Ver</a>` : ""}
            <button type="button" class="orbit-pill-btn danger" style="padding:5px 10px; font-size:0.74rem;" data-del-fav="${fav.item_id}">✕</button>
          </div>
        </div>
      `
      )
      .join("");

    container.querySelectorAll("[data-del-fav]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        await window.toggleFavorito(btn.getAttribute("data-del-fav"), "", "");
        await renderFavoritosModal();
      });
    });
  }

  async function loadComunidadIdeas() {
    const grid = document.getElementById("comunidad-ideas-grid");
    if (!grid) return;

    const categoriaFiltro = grid.getAttribute("data-categoria");
    let query = sb
      .from("ideas_comunidad")
      .select("*")
      .order("created_at", { ascending: false });

    if (categoriaFiltro) {
      query = query.eq("categoria", categoriaFiltro);
    }

    const { data, error } = await query;
    if (error || !data || data.length === 0) {
      grid.innerHTML = `<p style="text-align:center; color:#9ac5d6;">Aún no hay ideas publicadas en esta sección. ¡Inicia sesión y sé el primero en subir una!</p>`;
      return;
    }

    grid.classList.add("comunidad-grid-wrapper");
    grid.innerHTML = data
      .map(
        (idea) => `
        <article class="comunidad-card" data-fav-id="idea-${idea.id}" data-fav-title="${idea.titulo}" data-fav-cat="${idea.categoria}">
          <span class="comunidad-badge">${idea.categoria}</span>
          <h4>${idea.titulo}</h4>
          <div class="comunidad-meta">Por <strong>${idea.autor_nombre || "Creador"}</strong> • Costo: ${idea.costo_aprox}</div>
          <div class="comunidad-detail"><strong>Materiales:</strong>\n${idea.materiales}</div>
          <div class="comunidad-detail"><strong>Pasos:</strong>\n${idea.pasos}</div>
          ${idea.consejo_ia ? `<div class="comunidad-detail" style="color:#7ce8ff; margin-top:8px;">✨ <em>Tip Chispa IA: ${idea.consejo_ia}</em></div>` : ""}
        </article>
      `
      )
      .join("");

    refreshFavButtonsOnPage();
  }

  async function updateSessionUI(user) {
    currentUser = user;
    if (user) {
      const displayName = user.user_metadata?.display_name || user.email.split("@")[0];
      loginBtn.style.display = "none";
      favsBtn.style.display = "inline-block";
      uploadBtn.style.display = "inline-block";
      logoutBtn.style.display = "inline-block";
      logoutBtn.textContent = `Salir (${displayName})`;
    } else {
      loginBtn.style.display = "inline-block";
      favsBtn.style.display = "none";
      uploadBtn.style.display = "none";
      logoutBtn.style.display = "none";
    }
    await loadUserFavoritos();
  }

  const { data: sessionData } = await sb.auth.getSession();
  await updateSessionUI(sessionData?.session?.user || null);
  await loadComunidadIdeas();

  sb.auth.onAuthStateChange(async (_event, session) => {
    await updateSessionUI(session?.user || null);
  });

  document.querySelectorAll("[data-auth-tab]").forEach((tab) => {
    tab.addEventListener("click", () => {
      document.querySelectorAll("[data-auth-tab]").forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      authMode = tab.getAttribute("data-auth-tab");
      document.getElementById("register-name-field").style.display = authMode === "register" ? "flex" : "none";
      document.getElementById("auth-modal-heading").textContent =
        authMode === "register" ? "Crear Cuenta" : "Iniciar Sesión";
      document.getElementById("auth-submit-btn").textContent =
        authMode === "register" ? "Registrarme" : "Iniciar Sesión";
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
      const { error } = await sb.auth.signUp({
        email,
        password,
        options: { data: { display_name: name || email.split("@")[0] } }
      });
      if (error) {
        statusEl.textContent = error.message;
        statusEl.classList.add("error");
      } else {
        statusEl.textContent = "¡Cuenta creada! Ya puedes guardar favoritos y subir tus ideas.";
        statusEl.classList.add("success");
        setTimeout(() => document.getElementById("auth-modal").classList.remove("open"), 1100);
      }
    } else {
      const { error } = await sb.auth.signInWithPassword({ email, password });
      if (error) {
        statusEl.textContent = "Correo o contraseña incorrectos.";
        statusEl.classList.add("error");
      } else {
        document.getElementById("auth-modal").classList.remove("open");
      }
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

    const textoCompleto = `${payload.titulo} ${payload.materiales} ${payload.pasos}`;
    if (contieneLenguajeOfensivo(textoCompleto)) {
      statusEl.textContent = "⚠️ Tu publicación contiene palabras no permitidas. Por favor usa un lenguaje respetuoso.";
      statusEl.className = "status-banner error";
      return;
    }

    btn.disabled = true;
    btn.textContent = "Chispa IA revisando tu idea... ⏳";
    statusEl.className = "status-banner";

    try {
      const modRes = await fetch("/api/ai-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "moderate_idea", ideaPayload: payload })
      });
      const modData = await modRes.json();

      if (!modRes.ok) {
        throw new Error(modData.error || `Error del servidor (${modRes.status})`);
      }

      if (!modData.aprobado) {
        statusEl.textContent = `❌ Publicación rechazada por IA: ${modData.motivo}`;
        statusEl.className = "status-banner error";
        btn.disabled = false;
        btn.textContent = "Verificar con IA y Publicar 🚀";
        return;
      }

      const autorNombre = currentUser.user_metadata?.display_name || currentUser.email.split("@")[0];
      const { error } = await sb.from("ideas_comunidad").insert([
        {
          user_id: currentUser.id,
          autor_nombre: autorNombre,
          ...payload,
          consejo_ia: modData.sugerencia_ia || ""
        }
      ]);

      if (error) throw error;

      statusEl.textContent = `✅ ¡Idea publicada! Consejo de IA: ${modData.sugerencia_ia}`;
      statusEl.className = "status-banner success";
      e.target.reset();
      await loadComunidadIdeas();
      setTimeout(() => document.getElementById("submit-idea-modal").classList.remove("open"), 2200);
    } catch (err) {
      statusEl.textContent = "Error al guardar la idea: " + err.message;
      statusEl.className = "status-banner error";
    } finally {
      btn.disabled = false;
      btn.textContent = "Verificar con IA y Publicar 🚀";
    }
  });

  document.getElementById("close-auth-modal").addEventListener("click", () => {
    document.getElementById("auth-modal").classList.remove("open");
  });
  document.getElementById("close-idea-modal").addEventListener("click", () => {
    document.getElementById("submit-idea-modal").classList.remove("open");
  });
  document.getElementById("close-favs-modal").addEventListener("click", () => {
    document.getElementById("favs-modal").classList.remove("open");
  });

  const aiDrawer = document.getElementById("ai-drawer");
  const aiMessages = document.getElementById("ai-messages");
  const aiInput = document.getElementById("ai-chat-input");
  const aiSubmitBtn = document.getElementById("ai-chat-submit");
  const aiChips = document.querySelectorAll(".ai-chip");
  let isAiThinking = false;

  function setChatLocked(locked) {
    isAiThinking = locked;
    aiInput.disabled = locked;
    aiSubmitBtn.disabled = locked;
    aiInput.placeholder = locked ? "Chispa IA está respondiendo..." : "Pregúntale algo a la IA...";
    aiSubmitBtn.textContent = locked ? "..." : "Enviar";
    aiSubmitBtn.style.opacity = locked ? "0.5" : "1";
    aiSubmitBtn.style.cursor = locked ? "not-allowed" : "pointer";
    aiChips.forEach((chip) => {
      chip.disabled = locked;
      chip.style.opacity = locked ? "0.45" : "1";
      chip.style.pointerEvents = locked ? "none" : "auto";
    });
  }

  document.getElementById("open-ai-assistant").addEventListener("click", () => {
    aiDrawer.classList.toggle("open");
  });
  document.getElementById("close-ai-drawer").addEventListener("click", () => {
    aiDrawer.classList.remove("open");
  });

  async function sendToAI(text) {
    if (!text.trim() || isAiThinking) return;

    setChatLocked(true);

    const userBubble = document.createElement("div");
    userBubble.className = "ai-msg user";
    userBubble.textContent = text;
    aiMessages.appendChild(userBubble);

    const botBubble = document.createElement("div");
    botBubble.className = "ai-msg bot";
    botBubble.textContent = "Pensando idea... ✨";
    aiMessages.appendChild(botBubble);
    aiMessages.scrollTop = aiMessages.scrollHeight;

    const frontController = new AbortController();
    const frontTimeout = setTimeout(() => frontController.abort(), 22000);

    try {
      const res = await fetch("/api/ai-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: frontController.signal,
        body: JSON.stringify({
          mode: "chat",
          message: text,
          pageContext: pageTitle
        })
      });

      clearTimeout(frontTimeout);
      const rawText = await res.text();
      let data = {};
      try {
        data = JSON.parse(rawText);
      } catch {
        throw new Error(`El servidor tardó demasiado (${res.status}). Intenta de nuevo.`);
      }

      if (!res.ok) {
        botBubble.textContent = data.error || `Error del servidor (${res.status}).`;
      } else {
        botBubble.textContent = data.reply || "No recibí respuesta.";
      }
    } catch (err) {
      clearTimeout(frontTimeout);
      if (err.name === "AbortError") {
        botBubble.textContent = "⏳ La respuesta tardó demasiado. Intenta enviar tu mensaje de nuevo.";
      } else {
        botBubble.textContent = err.message || "No pude conectarme con Chispa IA en este momento.";
      }
    } finally {
      setChatLocked(false);
      aiInput.focus();
      aiMessages.scrollTop = aiMessages.scrollHeight;
    }
  }

  document.getElementById("ai-chat-form").addEventListener("submit", (e) => {
    e.preventDefault();
    if (isAiThinking) return;
    const msg = aiInput.value;
    aiInput.value = "";
    sendToAI(msg);
  });

  aiChips.forEach((chip) => {
    chip.addEventListener("click", () => {
      if (isAiThinking) return;
      sendToAI(chip.getAttribute("data-prompt"));
    });
  });
});