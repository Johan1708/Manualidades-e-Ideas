// api/ai-assistant.js
module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  const { mode, message, pageContext, ideaPayload } = req.body || {};
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: "Falta configurar GEMINI_API_KEY en Vercel y redesplegar." });
  }

  try {
    let systemPrompt = "";
    let userPrompt = "";

    if (mode === "moderate_idea") {
      systemPrompt = `Eres el moderador oficial de la plataforma "Manualidades e Ideas".
Evalúa la publicación del usuario bajo estas reglas estrictas:
1. Cero groserías, insultos, lenguaje sexual, violencia real, acoso o discurso de odio.
2. Debe ser una manualidad, decoración, disfraz, receta temática o idea creativa real (no spam ni texto sin sentido).
3. Debe tener materiales claros y pasos coherentes.
Responde ÚNICAMENTE con un JSON válido con este formato exacto:
{"aprobado": true/false, "motivo": "Explicación breve y amable para el usuario", "sugerencia_ia": "Un consejo corto para mejorar su manualidad"}`;

      userPrompt = `Título: ${ideaPayload.titulo}
Categoría: ${ideaPayload.categoria}
Materiales: ${ideaPayload.materiales}
Pasos: ${ideaPayload.pasos}`;
    } else {
      systemPrompt = `Eres "Chispa IA", el asistente creativo oficial de "Manualidades e Ideas".
El usuario está actualmente en la sección: "${pageContext || "Inicio"}".
Ayúdalo con ideas de manualidades, listas de materiales económicos, sustituciones caseras, pasos detallados y consejos de decoración. Sé cálido, práctico, breve y estructurado.`;

      userPrompt = message;
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemPrompt }] },
          contents: [{ parts: [{ text: userPrompt }] }],
          generationConfig: {
            temperature: mode === "moderate_idea" ? 0.1 : 0.7,
            responseMimeType: mode === "moderate_idea" ? "application/json" : "text/plain"
          }
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(500).json({
        error: `Error de Gemini (${response.status}): ${data?.error?.message || "Revisa tu API Key"}`
      });
    }

    const replyText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "No pude procesar la respuesta.";

    if (mode === "moderate_idea") {
      return res.status(200).json(JSON.parse(replyText));
    }

    return res.status(200).json({ reply: replyText });
  } catch (error) {
    return res.status(500).json({ error: "Error conectando con la IA: " + error.message });
  }
};