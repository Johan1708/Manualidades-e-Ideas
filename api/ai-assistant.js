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
  const timer = setTimeout(() => controller.abort(), 8000);

  try {
    const isMod = mode === "moderate_idea";
    const systemPrompt = isMod
      ? `Eres el moderador de "Manualidades e Ideas". Evalúa si es una manualidad respetuosa y clara. Responde SOLO JSON: {"aprobado": true/false, "motivo": "breve", "sugerencia_ia": "consejo corto"}`
      : `Eres "Chispa IA", asistente creativo de "Manualidades e Ideas" en "${pageContext || "Inicio"}". Responde amable, práctico y breve (máximo 4 líneas).`;

    const userPrompt = isMod
      ? `Título: ${ideaPayload?.titulo}\nCategoría: ${ideaPayload?.categoria}\nMateriales: ${ideaPayload?.materiales}\nPasos: ${ideaPayload?.pasos}`
      : (message || "Hola");

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${apiKey}`,
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
            thinkingConfig: { thinkingLevel: "low" },
            responseMimeType: isMod ? "application/json" : "text/plain"
          }
        })
      }
    );

    clearTimeout(timer);
    const data = await response.json();

    if (!response.ok) {
      return res.status(500).json({
        error: `Gemini (${response.status}): ${data?.error?.message || "Error"}`
      });
    }

    const replyText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "Sin respuesta.";
    return res.status(200).json(isMod ? JSON.parse(replyText) : { reply: replyText });
  } catch (err) {
    clearTimeout(timer);
    return res.status(500).json({
      error: err.name === "AbortError" ? "Tiempo agotado (8s)" : `Error: ${err.message}`
    });
  }
};