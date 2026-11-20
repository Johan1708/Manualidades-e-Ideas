/* ==========================================================================
   AUTH FUTURISTA (PANTALLA HOLOGRÁFICA) + FAVORITOS + IDEAS + CHISPA IA GLOBAL
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
      --orbit-blue-rgb: 0 220 255;
      --orbit-primary-rgb: 33 150 243;
    }

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
      background: rgba(10, 16, 26, 0.88) !important;
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

    /* OVERLAY TRANSPARENTE PARA QUE SE SIGA VIENDO EL FONDO DE TU PÁGINA */
    .global-modal-overlay {
      position: fixed !important;
      inset: 0 !important;
      z-index: 100000 !important;
      display: none;
      align-items: center;
      justify-content: center;
      padding: 16px;
      background: rgba(4, 8, 16, 0.48) !important;
      backdrop-filter: blur(5px);
      -webkit-backdrop-filter: blur(5px);
    }
    .global-modal-overlay.open {
      display: flex !important;
    }

    /* ======================================================================
       TARJETA FUTURISTA DE LOGIN (.orbit-login-screen) CON EFECTO ESCÁNER
       ====================================================================== */
    @keyframes pan-overlay {
      from { background-position: 0% 0%; }
      to { background-position: 0% -100%; }
    }

    @keyframes pan-image {
      0% { background-position: 36% 42%; background-size: 200%; }
      20% { background-position: 30% 35%; background-size: 200%; }
      20.0001% { background-position: 60% 85%; background-size: 500%; }
      40% { background-position: 49% 81%; background-size: 500%; }
      40.0001% { background-position: 80% 42%; background-size: 300%; }
      60% { background-position: 84% 33%; background-size: 300%; }
      60.0001% { background-position: 0% 0%; background-size: 300%; }
      80% { background-position: 15% 4%; background-size: 300%; }
      80.0001% { background-position: 80% 10%; background-size: 300%; }
      100% { background-position: 72% 14%; background-size: 300%; }
    }

    .orbit-login-screen {
      width: min(430px, 94vw);
      min-height: 550px;
      max-height: 92vh;
      display: flex;
      border: 3px solid rgb(var(--orbit-primary-rgb) / 85%);
      border-radius: 1.1rem;
      background-color: rgba(8, 16, 28, 0.78);
      backdrop-filter: blur(14px);
      -webkit-backdrop-filter: blur(14px);
      overflow: hidden;
      position: relative;
      z-index: 10;
      box-shadow: 0 0 40px rgba(33, 150, 243, 0.45), inset 0 0 24px rgba(0, 240, 255, 0.15);
      box-sizing: border-box;
    }

    /* Muescas superior e inferior estilo pantalla futurista */
    .orbit-login-screen::before,
    .orbit-login-screen::after {
      content: "";
      height: 5px;
      position: absolute;
      z-index: 6;
      left: 50%;
      transform: translateX(-50%);
      background-color: #ffffff;
      box-shadow: 0 0 10px #ffffff;
    }
    .orbit-login-screen::before {
      width: 16%;
      top: 0;
      border-bottom-left-radius: 1rem;
      border-bottom-right-radius: 1rem;
    }
    .orbit-login-screen::after {
      width: 26%;
      bottom: 0;
      border-top-left-radius: 1rem;
      border-top-right-radius: 1rem;
    }

    /* Imagen animada de fondo dentro de la tarjeta */
    .orbit-login-screen > .screen-image {
      background-image: url("https://images.unsplash.com/photo-1515266591878-f93e32bc5937?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80");
      height: 100%;
      width: 100%;
      position: absolute;
      z-index: 1;
      left: 0;
      top: 0;
      background-size: 300%;
      background-position: 0% 0%;
      filter: sepia(100%) hue-rotate(165deg) brightness(0.75);
      opacity: 0.42;
      animation: pan-image 15s linear infinite;
      pointer-events: none;
    }

    /* Líneas de escaneo CRT/Holograma animadas */
    .orbit-login-screen > .screen-overlay {
      background: linear-gradient(
        rgb(var(--orbit-primary-rgb) / 0.18),
        rgb(var(--orbit-primary-rgb) / 0.18) 3px,
        transparent 3px,
        transparent 9px
      );
      background-size: 100% 9px;
      height: 100%;
      width: 100%;
      animation: pan-overlay 22s infinite linear;
      position: absolute;
      z-index: 2;
      left: 0;
      top: 0;
      pointer-events: none;
    }

    /* Marco interior con contenido del Login */
    .orbit-login-screen > .screen-content {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      flex-grow: 1;
      position: relative;
      z-index: 4;
      margin: 0.95rem;
      padding: 1.4rem 1.35rem 1.6rem;
      border: 1px solid rgb(var(--orbit-primary-rgb) / 55%);
      border-radius: 0.75rem;
      overflow-y: auto;
      color: #ffffff;
      font-family: 'Segoe UI', system-ui, sans-serif;
    }

    .screen-top-close {
      position: absolute;
      top: 10px;
      right: 10px;
      z-index: 8;
    }

    /* Encabezado tipo CODEPEN / HYPERPLEXED con efecto scramble */
    .screen-header-brand {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      margin-top: 0.4rem;
      margin-bottom: 1.1rem;
      position: relative;
      padding-top: 0.9rem;
    }
    .screen-header-brand::before,
    .screen-header-brand::after {
      content: "";
      position: absolute;
      top: 0;
      background-color: rgb(var(--orbit-primary-rgb));
      border-radius: 1rem;
      box-shadow: 0px 0px 8px 3px rgb(var(--orbit-primary-rgb) / 60%);
    }
    .screen-header-brand::before {
      height: 2px;
      width: 50px;
      transform: translateX(-18px);
      opacity: 0.8;
    }
    .screen-header-brand::after {
      height: 3px;
      width: 30px;
      transform: translateX(24px);
    }

    .screen-scramble-title {
      position: relative;
      font-family: "Source Code Pro", "Consolas", monospace;
      font-size: 2.05rem;
      font-weight: 700;
      color: #ffffff;
      letter-spacing: 0.14rem;
      text-transform: uppercase;
      text-shadow: 0 0 12px rgba(33, 150, 243, 0.85);
      display: inline-block;
      margin: 0;
    }
    .screen-scramble-title::before,
    .screen-scramble-title::after {
      content: "";
      height: 4px;
      width: 4px;
      position: absolute;
      border: 2px solid #ffffff;
      border-radius: 2px;
    }
    .screen-scramble-title::before {
      top: 52%;
      right: -1.1rem;
    }
    .screen-scramble-title::after {
      top: 42%;
      left: -1.1rem;
    }

    .screen-subtitle {
      font-family: "Source Code Pro", "Consolas", monospace;
      opacity: 0.85;
      font-size: 0.78rem;
      color: #9be7ff;
      letter-spacing: 0.22rem;
      text-transform: uppercase;
      margin-top: 4px;
      text-shadow: 0 0 8px rgba(0, 240, 255, 0.6);
    }

    /* Tabs y campos dentro de la tarjeta futurista */
    .auth-tabs {
      display: flex;
      gap: 8px;
      margin-bottom: 12px;
    }
    .auth-tab-btn {
      flex: 1;
      padding: 8px;
      border-radius: 8px;
      border: 1px solid rgb(var(--orbit-primary-rgb) / 50%);
      background: rgba(8, 18, 32, 0.7);
      color: #a9dcff;
      font-family: "Source Code Pro", monospace;
      font-size: 0.82rem;
      font-weight: 700;
      letter-spacing: 0.06rem;
      text-transform: uppercase;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .auth-tab-btn.active {
      background: rgb(var(--orbit-primary-rgb) / 30%);
      border-color: #38bdf8;
      color: #ffffff;
      box-shadow: 0 0 14px rgb(var(--orbit-primary-rgb) / 45%);
    }

    .form-field {
      display: flex;
      flex-direction: column;
      gap: 5px;
      margin-bottom: 11px;
    }
    .form-field label {
      font-size: 0.78rem;
      font-family: "Source Code Pro", monospace;
      letter-spacing: 0.04rem;
      color: #bae6fd;
      display: flex;
      justify-content: space-between;
    }
    .form-field input,
    .form-field select,
    .form-field textarea {
      padding: 10px 12px;
      border-radius: 8px;
      border: 1px solid rgb(var(--orbit-primary-rgb) / 55%);
      background: rgba(6, 13, 24, 0.82);
      color: #ffffff;
      font-size: 0.88rem;
      outline: none;
      transition: border-color 0.2s, box-shadow 0.2s;
    }
    .form-field input:focus,
    .form-field select:focus,
    .form-field textarea:focus {
      border-color: #38bdf8;
      box-shadow: 0 0 12px rgb(var(--orbit-primary-rgb) / 50%);
    }
    .form-field textarea {
      min-height: 75px;
      resize: vertical;
    }

    .btn-spooky-primary {
      padding: 11px 16px;
      border-radius: 8px;
      border: 1px solid #7dd3fc;
      background: linear-gradient(135deg, #0284c7, #2196f3, #00d4ff) !important;
      color: #ffffff !important;
      font-family: "Source Code Pro", monospace;
      font-weight: 700;
      font-size: 0.9rem;
      letter-spacing: 0.08rem;
      text-transform: uppercase;
      cursor: pointer;
      box-shadow: 0 0 18px rgba(33, 150, 243, 0.55);
      transition: transform 0.15s ease, box-shadow 0.2s ease;
    }
    .btn-spooky-primary:hover {
      transform: translateY(-1px);
      box-shadow: 0 0 26px rgba(56, 189, 248, 0.85);
    }

    /* MODAL ESTÁNDAR PARA SUBIR IDEA Y FAVORITOS */
    .global-modal-card {
      width: min(470px, 100%);
      max-height: 90vh;
      overflow-y: auto;
      padding: 22px;
      border-radius: 18px;
      border: 1.5px solid rgba(0, 240, 255, 0.55) !important;
      background: linear-gradient(160deg, rgba(13, 19, 30, 0.94), rgba(8, 12, 20, 0.96)) !important;
      box-shadow: 0 0 35px rgba(0, 240, 255, 0.28) !important;
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

    .status-banner {
      display: none;
      padding: 8px 11px;
      border-radius: 8px;
      font-size: 0.81rem;
      margin-bottom: 10px;
    }
    .status-banner.error {
      display: block;
      background: rgba(255, 65, 90, 0.22);
      border: 1px solid rgba(255, 80, 100, 0.7);
      color: #ffc2cb;
    }
    .status-banner.success {
      display: block;
      background: rgba(0, 240, 180, 0.18);
      border: 1px solid rgba(0, 240, 180, 0.65);
      color: #9effe6;
    }

    /* BOTÓN FAVORITOS Y GRID COMUNIDAD */
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
    }
    .orbit-fav-btn.saved {
      background: rgba(255, 204, 0, 0.18);
      border-color: #ffd54f;
      color: #ffe57f;
    }
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
    }
    .comunidad-card h4 { margin: 6px 0 8px; color: #ffffff; }
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
    .comunidad-detail { font-size: 0.84rem; line-height: 1.45; color: #d8ecf5; white-space: pre-line; margin-top: 6px; }
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

    /* BOTÓN Y PANEL FLOTANTE CHISPA IA */
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
      color: #e8fcff !important;
      font-family: 'Orbitron', 'Segoe UI', sans-serif;
      font-weight: 700;
      font-size: 0.92rem;
      letter-spacing: 0.6px;
      cursor: pointer;
      box-shadow: 0 0 18px rgba(0, 240, 255, 0.35), inset 0 0 10px rgba(0, 240, 255, 0.15) !important;
      transition: transform 0.22s ease, box-shadow 0.22s ease;
    }
    .ai-fab-btn:hover {
      transform: translateY(-2px) scale(1.03);
      border-color: #00f0ff !important;
      box-shadow: 0 0 26px rgba(0, 240, 255, 0.65) !important;
    }
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
      box-shadow: 0 16px 45px rgba(0, 0, 0, 0.8), 0 0 28px rgba(0, 240, 255, 0.25) !important;
      color: #eef6ff !important;
      font-family: 'Segoe UI', system-ui, sans-serif;
    }
    .ai-drawer.open { display: flex !important; }
    .ai-drawer-header {
      padding: 13px 16px !important;
      background: linear-gradient(135deg, rgba(0, 195, 255, 0.24), rgba(18, 26, 40, 0.95)) !important;
      border-bottom: 1px solid rgba(0, 240, 255, 0.35) !important;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .ai-drawer-header h4 { margin: 0 !important; font-size: 0.98rem !important; color: #ffffff !important; }
    .ai-drawer-header small { display: block; font-size: 0.74rem !important; color: #8eeeff !important; }
    .ai-close-btn {
      width: 30px;
      height: 30px;
      border-radius: 50%;
      border: 1px solid rgba(0, 240, 255, 0.45) !important;
      background: rgba(0, 240, 255, 0.14) !important;
      color: #d8fbff !important;
      cursor: pointer;
    }
    .ai-messages {
      flex: 1;
      padding: 14px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .ai-msg { max-width: 86%; padding: 10px 13px; border-radius: 14px; font-size: 0.88rem; line-height: 1.42; }
    .ai-msg.bot {
      align-self: flex-start;
      background: rgba(24, 34, 50, 0.88) !important;
      border: 1px solid rgba(0, 240, 255, 0.28) !important;
      color: #e6f4ff !important;
    }
    .ai-msg.user {
      align-self: flex-end;
      background: linear-gradient(135deg, #0099cc, #00d4ff) !important;
      color: #041019 !important;
      font-weight: 600;
    }
    .ai-quick-prompts {
      padding: 8px 12px;
      display: flex;
      gap: 7px;
      overflow-x: auto;
      border-top: 1px solid rgba(0, 240, 255, 0.16);
      background: rgba(8, 12, 19, 0.7);
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
    }
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
    .ai-input-row button {
      padding: 9px 15px;
      border-radius: 10px;
      border: none;
      background: linear-gradient(135deg, #00b8e6, #00f0ff) !important;
      color: #03121a !important;
      font-weight: 800;
      cursor: pointer;
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

    <!-- MODAL LOGIN / REGISTRO CON DISEÑO DE PANTALLA FUTURISTA -->
    <div class="global-modal-overlay" id="auth-modal">
      <div class="orbit-login-screen" id="orbit-login-screen">
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

              <button type="submit" class="btn-spooky-primary" style="width:100%; margin-top:8px;" id="auth-submit-btn">
                Iniciar Sesión
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>

    <!-- MODAL SUBIR IDEA -->
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
            <label>Título de la manualidad <span id="cnt-titulo">0/80</span></label>
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
            <label>Costo aproximado <span>(máx 30)</span></label>
            <input type="text" id="idea-costo" maxlength="30" required placeholder="Ej. $50 MXN o Material reciclado" />
          </div>

          <div class="form-field">
            <label>Materiales necesarios <span id="cnt-mat">0/600</span></label>
            <textarea id="idea-materiales" minlength="10" maxlength="600" required placeholder="- 1 botella de plástico
- Pintura acrílica
- Luz LED"></textarea>
          </div>

          <div class="form-field">
            <label>Instrucciones Paso a Paso <span id="cnt-pasos">0/2000</span></label>
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

  // EFECTO DE TEXTO SCRAMBLE EN LA TARJETA FUTURISTA DE LOGIN
  const scrambleLetters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let scrambleInterval = null;
  const loginScreen = document.getElementById("orbit-login-screen");
  const scrambleTitle = document.getElementById("auth-scramble-title");

  function triggerScramble(targetText) {
    if (!scrambleTitle) return;
    if (targetText) {
      scrambleTitle.dataset.value = targetText;
      scrambleTitle.innerText = targetText;
    }
    let iteration = 0;
    clearInterval(scrambleInterval);
    scrambleInterval = setInterval(() => {
      scrambleTitle.innerText = scrambleTitle.dataset.value
        .split("")
        .map((letter, index) => {
          if (letter === " ") return " ";
          if (index < iteration) return scrambleTitle.dataset.value[index];
          return scrambleLetters[Math.floor(Math.random() * 26)];
        })
        .join("");

      if (iteration >= scrambleTitle.dataset.value.length) {
        clearInterval(scrambleInterval);
      }
      iteration += 1 / 3;
    }, 30);
  }

  if (loginScreen) {
    loginScreen.addEventListener("mouseenter", () => triggerScramble());
  }

  // Contadores de caracteres
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
    triggerScramble(authMode === "register" ? "REGISTRO" : "ACCESO");
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
      triggerScramble("ACCESO");
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
      triggerScramble(authMode === "register" ? "REGISTRO" : "ACCESO");
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

  // Cerrar modales con botón X o haciendo clic fuera en el fondo
  document.getElementById("close-auth-modal").addEventListener("click", () => {
    document.getElementById("auth-modal").classList.remove("open");
  });
  document.getElementById("auth-modal").addEventListener("click", (e) => {
    if (e.target.id === "auth-modal") document.getElementById("auth-modal").classList.remove("open");
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