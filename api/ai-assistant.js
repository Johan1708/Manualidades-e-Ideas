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
    const frontTimeout = setTimeout(() => frontController.abort(), 11000);

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