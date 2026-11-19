let modelosCacheados = null;

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Usa POST" });
  }

  const apiKey = (process.env.GEMINI_API_KEY || "").trim();
  if (!apiKey) {
    return res.status(500).json({ error: "Falta GEMINI_API_KEY en Vercel." });
  }

  const body = typeof req.body === "string" ? JSON.parse(req.body) : (req.body || {});
  const { mode, message, pageContext, ideaPayload } = body;

  const isMod = mode === "moderate_idea";

  const mapaDelSitio = `
CONOCIMIENTO DE TU SITIO WEB ("Manualidades e Ideas"):
- El usuario está viendo actualmente: "${pageContext || "Inicio"}".
- Cómo navegar en el sitio: Desde la pantalla principal o el menú superior/Menú Orbit, el usuario debe seleccionar la tarjeta o enlace de la sección que desea visitar.
- Secciones principales disponibles en el sitio:
  1. Navidad: incluye adornos navideños hechos a mano, esferas personalizadas, coronas para puerta, árboles decorativos con material reciclado, botas navideñas y centros de mesa festivos. Para entrar: ve al menú principal (Menú Orbit / barra de navegación superior) y haz clic en la opción o tarjeta "Navidad".
  2. Decoración: adornos temáticos, lámparas caseras (como lámpara fantasma con botella reciclada), coronas decorativas, centros de mesa y ambientación. Para entrar: selecciona "Decoración" en el menú principal.
  3. Animatrónicos y Susto: figuras con movimiento, efectos de terror y utilería creativa. Para entrar: selecciona "Animatrónicos" en el menú principal.
  4. Fiesta, Bebidas y Botanas: recetas temáticas, vasos decorados y mesas de dulces. Para entrar: selecciona "Fiesta" en el menú principal.
  5. Disfraces y Maquillaje: trajes caseros, máscaras y caracterización económica. Para entrar: selecciona "Disfraces" en el menú principal.
  6. Día de las Madres / Regalos: tarjetas, flores de papel, cajas sorpresa y detalles hechos a mano. Para entrar: selecciona "Día de las Madres" en el menú principal.
- Funciones interactivas de la plataforma:
  * Botón "+ SUBIR IDEA" (aparece arriba al iniciar sesión en "SESION"): permite publicar manualidades propias con título, categoría, costo aproximado, materiales y pasos.
  * Moderación inteligente: Chispa IA revisa automáticamente cada publicación antes de subirla.
  * Accesos rápidos en el chat: "Ideas con cartón", "Ahorrar materiales" y "Redactar mi idea".
`;

  const systemPrompt = isMod
    ? `Eres el moderador de "Manualidades e Ideas". Evalúa si es una manualidad respetuosa y clara. Responde SOLO JSON: {"aprobado": true/false, "motivo": "breve", "sugerencia_ia": "consejo corto"}`
    : `Eres "Chispa IA", el asistente inteligente de la web "Manualidades e Ideas".
${mapaDelSitio}
REGLAS DE RESPUESTA:
1. Si el usuario dice que quiere ir a una sección (por ejemplo: "Quiero ir a la sección de Navidad") o pregunta qué opciones hay en el sitio, descríbele claramente qué manualidades/contenido tiene esa sección y dale las instrucciones paso a paso de cómo ingresar dentro de la misma página.
2. Si el usuario hace cualquier pregunta general fuera del tema de manualidades (deportes, historia, cultura general, curiosidades, etc., como "¿Quién es el más grande de Champions?"), respóndele directamente con el dato correcto y total precisión.
3. Sé amable, claro y conciso (máximo 5 líneas).`;

  const userPrompt = isMod
    ? `Título: ${ideaPayload?.titulo}\nCategoría: ${ideaPayload?.categoria}\nMateriales: ${ideaPayload?.materiales}\nPasos: ${ideaPayload?.pasos}`
    : (message || "Hola");

  // 1. Obtener y guardar en caché los modelos reales disponibles en tu API Key
  if (!modelosCacheados) {
    try {
      const listRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
      );
      const listData = await listRes.json();
      if (listRes.ok && Array.isArray(listData.models)) {
        const disponibles = listData.models
          .filter((m) => (m.supportedGenerationMethods || []).includes("generateContent"))
          .map((m) => m.name.replace("models/", ""))
          .filter((name) => name.includes("flash") || name.includes("lite") || name.includes("hydrogen"));

        if (disponibles.length > 0) {
          disponibles.sort((a, b) => {
            const score = (n) => (n.includes("lite") ? 1 : n.includes("flash") ? 2 : 3);
            return score(a) - score(b);
          });
          modelosCacheados = disponibles.slice(0, 3);
        }
      }
    } catch {
      // Si falla el listado, usa respaldo por defecto
    }
  }

  const modelosAProbar = modelosCacheados || ["gemini-3.8-flash", "gemini-2.5-flash", "gemini-2.0-flash"];
  const errores = [];

  for (const modelo of modelosAProbar) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 7500);

    try {
      const genConfig = {
        temperature: isMod ? 0.1 : 0.7,
        maxOutputTokens: 380,
        responseMimeType: isMod ? "application/json" : "text/plain"
      };

      // Solo enviar thinkingConfig en modelos serie 3+ que lo soportan
      if (modelo.includes("gemini-3") || modelo.includes("gemini-4")) {
        genConfig.thinkingConfig = { thinkingLevel: "low" };
      }

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${modelo}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({
            system_instruction: { parts: [{ text: systemPrompt }] },
            contents: [{ parts: [{ text: userPrompt }] }],
            generationConfig: genConfig
          })
        }
      );

      clearTimeout(timer);
      const data = await response.json();

      if (response.ok) {
        const replyText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "Sin respuesta.";
        return res.status(200).json(isMod ? JSON.parse(replyText) : { reply: replyText });
      }

      errores.push(`${modelo}: ${response.status} (${data?.error?.message || "Error"})`);

      if ([400, 401, 403].includes(response.status)) break;
    } catch (e) {
      clearTimeout(timer);
      errores.push(`${modelo}: ${e.name === "AbortError" ? "Timeout 7.5s" : e.message}`);
    }
  }

  return res.status(503).json({
    error: `No se pudo responder ahorita [${errores.join(" | ")}]`
  });
};