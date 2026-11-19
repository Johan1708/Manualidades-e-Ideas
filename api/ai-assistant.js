// api/ai-assistant.js
module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido (usa POST)" });
  }

  const { mode, message, pageContext, ideaPayload } = req.body || {};
  const apiKey = (process.env.GEMINI_API_KEY || "").trim();

  if (!apiKey) {
    return res.status(500).json({
      error: "Falta GEMINI_API_KEY en Vercel. Agrégala en Variables de entorno y haz Redeploy."
    });
  }

  try {
    let systemPrompt = "";
    let userPrompt = "";

    if (mode === "moderate_idea") {
      systemPrompt = `Eres el moderador oficial de "Manualidades e Ideas".
Evalúa la publicación del usuario bajo estas reglas:
1. Cero groserías, insultos, lenguaje sexual, violencia real o acoso.
2. Debe ser una manualidad, decoración, disfraz, receta temática o idea creativa real.
3. Debe tener materiales claros y pasos coherentes.
Responde ÚNICAMENTE con un JSON válido:
{"aprobado": true/false, "motivo": "Explicación breve", "sugerencia_ia": "Consejo corto para mejorarla"}`;

      userPrompt = `Título: ${ideaPayload?.titulo}\nCategoría: ${ideaPayload?.categoria}\nMateriales: ${ideaPayload?.materiales}\nPasos: ${ideaPayload?.pasos}`;
    } else {
      systemPrompt = `Eres "Chispa IA", el asistente creativo de "Manualidades e Ideas".
El usuario está en la sección: "${pageContext || "Inicio"}".
Ayúdalo con ideas de manualidades, materiales económicos, sustituciones caseras y pasos detallados. Sé cálido, práctico y breve.`;
      userPrompt = message || "Hola";
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemPrompt }] },
          contents: [{ parts: [{ text: userPrompt }] }],
          generationConfig: {
            temperature: mode === "moderate_idea" ? 0.1 : 0.7,
            maxOutputTokens: 450,
            thinkingConfig: { thinkingLevel: "minimal" },
            responseMimeType: mode === "moderate_idea" ? "application/json" : "text/plain"
          }
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(500).json({
        error: `Error de Gemini (${response.status}): ${data?.error?.message || "Error desconocido"}`
      });
    }

    const replyText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "Sin respuesta.";

    if (mode === "moderate_idea") {
      return res.status(200).json(JSON.parse(replyText));
    }

    return res.status(200).json({ reply: replyText });
  } catch (error) {
    return res.status(500).json({ error: `Fallo interno: ${error.message}` });
  }
};