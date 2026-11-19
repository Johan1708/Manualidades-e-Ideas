/* ==========================================================================
   AUTH + MODERACIÓN DE IDEAS + ASISTENTE IA GLOBAL (TODAS LAS PÁGINAS)
   ========================================================================== */

// 1. PEGA AQUÍ TUS CREDENCIALES DE SUPABASE
const SUPABASE_URL = "https://TU_PROYECTO.supabase.co";
const SUPABASE_ANON_KEY = "TU_SUPABASE_ANON_KEY";

// Filtro rápido local de groserías antes de gastar tokens de IA
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

// Cargar SDK de Supabase dinámicamente si no está en el HTML
function loadSupabaseSDK() {
  return new Promise((resolve) => {
    if (window.supabase) return resolve(window.supabase);
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";
    script.onload = () => resolve(window.supabase);
    document.head.appendChild(script);
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  const supabaseLib = await loadSupabaseSDK();
  const sb = supabaseLib.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  let currentUser = null;
  let authMode = "login"; // 'login' | 'register'
  const pageTitle = document.title || window.location.pathname;

  // Inyectar HTML de los modales y el Asistente IA flotante en la página actual
  const uiContainer = document.createElement("div");
  uiContainer.innerHTML = `
    <!-- BOTÓN FLOTANTE IA -->
    <button class="ai-fab-btn" id="open-ai-assistant">
      <span>✨ Chispa IA</span>
    </button>

    <!-- PANEL DE CHAT IA -->
    <aside class="ai-drawer" id="ai-drawer">
      <div class="ai-drawer-header">
        <div>
          <h4>✨ Chispa IA • Guía Creativa</h4>
          <small>Asistente activo en: ${pageTitle.slice(0, 34)}</small>
        </div>
        <button class="ai-close-btn" id="close-ai-drawer">✕</button>
      </div>

      <div class="ai-messages" id="ai-messages">
        <div class="ai-msg bot">¡Hola! Soy <strong>Chispa IA</strong>. Estoy contigo en esta sección para ayudarte con materiales, pasos, sustitutos económicos o ideas nuevas. ¿Qué quieres crear hoy?</div>
      </div>

      <div class="ai-quick-prompts">
        <button class="ai-chip" data-prompt="Dame 3 ideas fáciles con cartón y papel para esta sección">📦 Ideas con cartón</button>
        <button class="ai-chip" data-prompt="¿Cómo puedo sustituir materiales caros por cosas de casa?">💡 Ahorrar materiales</button>
        <button class="ai-chip" data-prompt="Ayúdame a redactar una idea para subirla a la comunidad">✍️ Redactar mi idea</button>
      </div>

      <form class="ai-input-row" id="ai-chat-form">
        <input type="text" id="ai-chat-input" placeholder="Pregúntale algo a la IA..." maxlength="300" required />
        <button type="submit">Enviar</button>
      </form>
    </aside>

    <!-- MODAL LOGIN / REGISTRO -->
    <div class="global-modal-overlay" id="auth-modal">
      <div class="global-modal-card">
        <div class="global-modal-top">
          <h3 id="auth-modal-heading">Iniciar Sesión</h3>
          <button class="ai-close-btn" id="close-auth-modal">✕</button>
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
          <button class="ai-close-btn" id="close-idea-modal">✕</button>
        </div>

        <p style="font-size:0.84rem; color:#ccc; margin-top:0; opacity:1; transform:none;">
          Tu idea será revisada por <strong>Chispa IA</strong> para verificar lenguaje respetuoso y claridad antes de publicarse.
        </p>

        <div class="status-banner" id="idea-status"></div>

        <form id="submit-idea-form">
          <div class="form-field">
            <label>Título de la manualidad <span class="char-counter" id="cnt-titulo">0/80</span></label>
            <input type="text" id="idea-titulo" minlength="5" maxlength="80" required placeholder="Ej. Lámpara fantasma con botella reciclada" />
          </div>

          <div class="form-field">
            <label>Categoría / Sección</label>
            <select id="idea-categoria" required>
              <option value="Decoración">🎃 Decoración</option>
              <option value="Animatrónicos">🤖 Animatrónicos y Susto</option>
              <option value="Fiesta">🦇 Fiesta, Bebidas y Botanas</option>
              <option value="Disfraces">🎭 Disfraces y Maquillaje</option>
              <option value="Día de las Madres">💐 Día de las Madres / Regalos</option>
            </select>
          </div>

          <div class="form-field">
            <label>Costo aproximado <span class="char-counter">(máx 30 caracteres)</span></label>
            <input type="text" id="idea-costo" maxlength="30" required placeholder="Ej. $50 MXN o Material reciclado" />
          </div>

          <div class="form-field">
            <label>Materiales necesarios <span class="char-counter" id="cnt-mat">0/600</span></label>
            <textarea id="idea-materiales" minlength="10" maxlength="600" required placeholder="- 1 botella de plástico
- Pintura blanca
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
  `;
  document.body.appendChild(uiContainer);

  // Contadores de caracteres en vivo
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

  // Actualizar botones del Header según si hay sesión activa
  const headerActions = document.querySelector(".header-actions") || document.querySelector("header");
  const sessionBtn = document.querySelector(".header .button");

  const uploadBtn = document.createElement("button");
  uploadBtn.className = "button";
  uploadBtn.textContent = "+ SUBIR IDEA";
  uploadBtn.style.display = "none";
  uploadBtn.addEventListener("click", () => {
    document.getElementById("submit-idea-modal").classList.add("open");
  });

  if (headerActions && sessionBtn) {
    headerActions.insertBefore(uploadBtn, sessionBtn);
  }

  function updateSessionUI(user) {
    currentUser = user;
    if (!sessionBtn) return;
    if (user) {
      const displayName = user.user_metadata?.display_name || user.email.split("@")[0];
      sessionBtn.textContent = `SALIR (${displayName.toUpperCase()})`;
      uploadBtn.style.display = "inline-block";
    } else {
      sessionBtn.textContent = "SESION";
      uploadBtn.style.display = "none";
    }
  }

  // Verificar sesión inicial
  const { data: sessionData } = await sb.auth.getSession();
  updateSessionUI(sessionData?.session?.user || null);

  sb.auth.onAuthStateChange((_event, session) => {
    updateSessionUI(session?.user || null);
  });

  // Clic en el botón SESION / SALIR
  if (sessionBtn) {
    sessionBtn.addEventListener("click", async (e) => {
      e.preventDefault();
      if (currentUser) {
        await sb.auth.signOut();
        updateSessionUI(null);
      } else {
        document.getElementById("auth-modal").classList.add("open");
      }
    });
  }

  // Tabs Login / Registro
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

  // Enviar formulario Login / Registro
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
        statusEl.textContent = "¡Cuenta creada! Ya puedes subir tus ideas.";
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

  // Enviar nueva idea con validación de límites + filtro de lenguaje + IA
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

    // 1. Filtro instantáneo de lenguaje ofensivo
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
      // 2. Moderación inteligente con API de IA
      const modRes = await fetch("/api/ai-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "moderate_idea", ideaPayload: payload })
      });
      const modData = await modRes.json();

      if (!modData.aprobado) {
        statusEl.textContent = `❌ Publicación rechazada por IA: ${modData.motivo}`;
        statusEl.className = "status-banner error";
        btn.disabled = false;
        btn.textContent = "Verificar con IA y Publicar 🚀";
        return;
      }

      // 3. Guardar en base de datos
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
      setTimeout(() => document.getElementById("submit-idea-modal").classList.remove("open"), 2200);
    } catch (err) {
      statusEl.textContent = "Error al guardar la idea: " + err.message;
      statusEl.className = "status-banner error";
    } finally {
      btn.disabled = false;
      btn.textContent = "Verificar con IA y Publicar 🚀";
    }
  });

  // Cerrar modales
  document.getElementById("close-auth-modal").addEventListener("click", () => {
    document.getElementById("auth-modal").classList.remove("open");
  });
  document.getElementById("close-idea-modal").addEventListener("click", () => {
    document.getElementById("submit-idea-modal").classList.remove("open");
  });

  // Lógica del Chat Asistente IA en cualquier página
  const aiDrawer = document.getElementById("ai-drawer");
  const aiMessages = document.getElementById("ai-messages");
  const aiInput = document.getElementById("ai-chat-input");

  document.getElementById("open-ai-assistant").addEventListener("click", () => {
    aiDrawer.classList.toggle("open");
  });
  document.getElementById("close-ai-drawer").addEventListener("click", () => {
    aiDrawer.classList.remove("open");
  });

  async function sendToAI(text) {
    if (!text.trim()) return;
    const userBubble = document.createElement("div");
    userBubble.className = "ai-msg user";
    userBubble.textContent = text;
    aiMessages.appendChild(userBubble);

    const botBubble = document.createElement("div");
    botBubble.className = "ai-msg bot";
    botBubble.textContent = "Pensando idea... ✨";
    aiMessages.appendChild(botBubble);
    aiMessages.scrollTop = aiMessages.scrollHeight;

    try {
      const res = await fetch("/api/ai-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "chat",
          message: text,
          pageContext: pageTitle
        })
      });
      const data = await res.json();
      botBubble.textContent = data.reply || data.error || "No recibí respuesta.";
    } catch {
      botBubble.textContent = "No pude conectarme con Chispa IA en este momento.";
    }
    aiMessages.scrollTop = aiMessages.scrollHeight;
  }

  document.getElementById("ai-chat-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const msg = aiInput.value;
    aiInput.value = "";
    sendToAI(msg);
  });

  document.querySelectorAll(".ai-chip").forEach((chip) => {
    chip.addEventListener("click", () => sendToAI(chip.getAttribute("data-prompt")));
  });
});