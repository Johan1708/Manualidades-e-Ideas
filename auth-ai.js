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
CONOCIMIENTO DE TU SITIO WEB ("Manualidades e Ideas - Menú Orbit"):
- El usuario está actualmente en: "${pageContext || "Menú Orbit (Inicio)"}".
- Cómo ingresar a cualquier sección: En la pantalla principal (Menú Orbit, donde aparece el rostro holográfico central) o desde el botón de menú superior izquierdo ("MENÚ DE IDEAS"), haz clic directamente sobre la tarjeta de la temática que quieras abrir.
- Las 5 secciones disponibles en el sitio son:
  1. HALLOWEEN (tarjeta superior izquierda): incluye decoraciones de terror, lámparas fantasma con botellas recicladas, calabazas creativas, utilería y disfraces económicos. Para entrar: haz clic en la tarjeta "HALLOWEEN" en el Menú Orbit.
  2. DÍA DE MUERTOS (tarjeta superior derecha): incluye papel picado, calaveritas decoradas, flores de cempasúchil de papel, altares en miniatura y veladoras artesanales. Para entrar: haz clic en la tarjeta "DÍA DE MUERTOS" a la derecha del Menú Orbit.
  3. NAVIDAD (tarjeta central derecha): incluye adornos navideños hechos a mano, esferas personalizadas, coronas para puerta, arbolitos reciclados y centros de mesa festivos. Para entrar: haz clic en la tarjeta "NAVIDAD" ubicada en el lado derecho del Menú Orbit.
  4. DÍA DE LAS MADRES (tarjeta inferior izquierda): incluye tarjetas pop-up, ramos de flores eternas de papel, cajas sorpresa y regalos personalizados hechos a mano. Para entrar: haz clic en la tarjeta "DÍA DE LAS MADRES" abajo a la izquierda del Menú Orbit.
  5. DÍA DEL PADRE (tarjeta inferior derecha): incluye tarjetas originales, organizadores de escritorio reciclados, portarretratos y detalles creativos hechos a mano. Para entrar: haz clic en la tarjeta "DÍA DEL PADRE" abajo a la derecha del Menú Orbit.
- Funciones extra:
  * Al iniciar sesión en "SESION" aparece "+ SUBIR IDEA" para compartir manualidades propias (revisadas por Chispa IA).
`;

  const systemPrompt = isMod
    ? `Eres el moderador de "Manualidades e Ideas". Evalúa si es una manualidad respetuosa y clara. Responde SOLO JSON: {"aprobado": true/false, "motivo": "breve", "sugerencia_ia": "consejo corto"}`
    : `Eres "Chispa IA", el asistente inteligente de la web "Manualidades e Ideas".
${mapaDelSitio}
REGLAS DE RESPUESTA:
1. Si el usuario dice que quiere ir a una sección (ej. "Quiero ir a la sección de Navidad") o pregunta qué opciones hay en el sitio, descríbele qué manualidades contiene esa sección y dale las instrucciones exactas para hacer clic en su tarjeta dentro del Menú Orbit.
2. Si el usuario hace cualquier pregunta general fuera del tema de manualidades (deportes, historia, cultura general, curiosidades, etc., como "¿Quién es el más grande de Champions?"), respóndele directamente con el dato correcto y total precisión.
3. Sé amable, claro y conciso (máximo 5 líneas).`;

  const userPrompt = isMod
    ? `Título: ${ideaPayload?.titulo}\nCategoría: ${ideaPayload?.categoria}\nMateriales: ${ideaPayload?.materiales}\nPasos: ${ideaPayload?.pasos}`
    : (message || "Hola");

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
      // Respaldo por defecto
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