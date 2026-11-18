// Texto que representa la escena (puedes cambiarlo por el mensaje que prefieras)
const textoEmotivo = "Caminando hacia lo desconocido, con la única certeza de que cada paso, cada sacrificio y cada esfuerzo, construirá un horizonte brillante para aquellos que más ama. Gracias por todo, mamá.";

const elementoMensaje = document.getElementById("mensaje-animado");
let indice = 0;

// Efecto de máquina de escribir
function escribirTexto() {
    if (indice < textoEmotivo.length) {
        elementoMensaje.innerHTML += textoEmotivo.charAt(indice);
        indice++;
        setTimeout(escribirTexto, 50); // Cambia el 50 para que escriba más rápido o más lento
    }
}

// Inicia la escritura del texto 2 segundos después de abrir la página, dando tiempo a que cargue el video y el título
setTimeout(escribirTexto, 2000);