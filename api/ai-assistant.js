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
- El usuario está viendo actualmente la sección: "${pageContext || "Inicio"}".
- Secciones principales disponibles en el menú del sitio:
  1. Decoración: adornos temáticos, lámparas caseras (como lámpara fantasma con botella reciclada), coronas decorativas, centros de mesa y ambientación.
  2. Animatrónicos y Susto: figuras con movimiento, efectos de terror y utilería creativa.
  3. Fiesta, Bebidas y Botanas: recetas temáticas, vasos decorados y mesas de dulces.
  4. Disfraces y Maquillaje: trajes caseros, máscaras y caracterización económica.
  5. Día de las Madres / Regalos: tarjetas, flores de papel, cajas sorpresa y detalles hechos a mano.
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
1. Si el usuario pregunta qué opciones, secciones, categorías, manualidades o funciones hay en el sitio web, recomiéndale primero las secciones, proyectos y herramientas exactas de "Manualidades e Ideas".
2. Si el usuario hace cualquier pregunta general fuera del tema de manualidades (deportes, historia, cultura general, curiosidades, etc., como "¿Quién es el más grande de Champions?"), respóndele directamente con el dato correcto y total precisión.
3. Sé amable, claro y conciso (máximo 4 o 5 líneas).`;

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
        maxOutputTokens: 350,
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