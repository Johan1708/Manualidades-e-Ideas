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

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20000);

  const esperar = (ms) => new Promise((r) => setTimeout(r, ms));

  try {
    const isMod = mode === "moderate_idea";
    const systemPrompt = isMod
      ? `Eres el moderador de "Manualidades e Ideas". Evalúa si es una manualidad respetuosa y clara. Responde SOLO JSON: {"aprobado": true/false, "motivo": "breve", "sugerencia_ia": "consejo corto"}`
      : `Eres "Chispa IA", asistente creativo de "Manualidades e Ideas" en "${pageContext || "Inicio"}". Responde amable, práctico y breve (máximo 4 líneas).`;

    const userPrompt = isMod
      ? `Título: ${ideaPayload?.titulo}\nCategoría: ${ideaPayload?.categoria}\nMateriales: ${ideaPayload?.materiales}\nPasos: ${ideaPayload?.pasos}`
      : (message || "Hola");

    // Lista de intentos: reintenta gemini-3.8-flash y prueba alternativas si hay alta demanda (503)
    const intentos = [
      { modelo: "gemini-3.8-flash", thinking: "low" },
      { modelo: "gemini-3.8-flash-lite", thinking: "low" },
      { modelo: "gemini-3-flash-preview", thinking: "low" },
      { modelo: "gemini-3.8-flash", thinking: "low" }
    ];

    let lastError = "";

    for (let i = 0; i < intentos.length; i++) {
      const { modelo, thinking } = intentos[i];

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${modelo}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({
            system_instruction: { parts: [{ text: systemPrompt }] },
            contents: [{ parts: [{ text: userPrompt }] }],
            generationConfig: {
              temperature: isMod ? 0.1 : 0.7,
              maxOutputTokens: 350,
              thinkingConfig: { thinkingLevel: thinking },
              responseMimeType: isMod ? "application/json" : "text/plain"
            }
          })
        }
      );

      const data = await response.json();

      if (response.ok) {
        clearTimeout(timer);
        const replyText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "Sin respuesta.";
        return res.status(200).json(isMod ? JSON.parse(replyText) : { reply: replyText });
      }

      lastError = `${modelo} (${response.status}): ${data?.error?.message || "Error"}`;

      // Si es error de autenticación (400/401/403), detenerse; si es 404, 429 o 503, probar el siguiente
      if ([400, 401, 403].includes(response.status)) break;

      if (response.status === 503 || response.status === 429) {
        await esperar(900);
      }
    }

    clearTimeout(timer);
    return res.status(503).json({
      error: "Chispa IA tiene mucha demanda en este momento. Intenta enviar tu mensaje en unos segundos ✨"
    });
  } catch (err) {
    clearTimeout(timer);
    return res.status(500).json({
      error: err.name === "AbortError" ? "Tiempo agotado (20s)" : `Error: ${err.message}`
    });
  }
};