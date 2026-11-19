let aiOcupada = false;

async function enviarMensajeChispa(textoManual) {
  const input = document.getElementById("chispa-input"); // ajusta al ID de tu input si es distinto
  const btnEnviar = document.getElementById("chispa-send-btn"); // ajusta al ID de tu botón
  const chips = document.querySelectorAll(".chispa-chip"); // ajusta a la clase de tus botones rápidos
  const mensaje = (textoManual || input.value).trim();

  if (!mensaje || aiOcupada) return;

  // Bloquear controles mientras responde
  aiOcupada = true;
  if (input) {
    input.value = "";
    input.disabled = true;
    input.placeholder = "Chispa IA está escribiendo...";
  }
  if (btnEnviar) {
    btnEnviar.disabled = true;
    btnEnviar.style.opacity = "0.5";
    btnEnviar.style.pointerEvents = "none";
  }
  chips.forEach(chip => {
    chip.disabled = true;
    chip.style.opacity = "0.5";
    chip.style.pointerEvents = "none";
  });

  agregarBurbujaUsuario(mensaje);
  const burbujaPensando = agregarBurbujaIA("Pensando idea... ✨");

  try {
    const res = await fetch("/api/ai-assistant", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: mensaje,
        pageContext: document.title
      })
    });

    const data = await res.json();
    burbujaPensando.textContent = res.ok
      ? data.reply
      : (data.error || "Ocurrió un error al responder.");
  } catch (err) {
    burbujaPensando.textContent = "No se pudo conectar con Chispa IA. Intenta de nuevo.";
  } finally {
    // Desbloquear controles siempre al terminar
    aiOcupada = false;
    if (input) {
      input.disabled = false;
      input.placeholder = "Pregúntale algo a la IA...";
      input.focus();
    }
    if (btnEnviar) {
      btnEnviar.disabled = false;
      btnEnviar.style.opacity = "1";
      btnEnviar.style.pointerEvents = "auto";
    }
    chips.forEach(chip => {
      chip.disabled = false;
      chip.style.opacity = "1";
      chip.style.pointerEvents = "auto";
    });
  }
}