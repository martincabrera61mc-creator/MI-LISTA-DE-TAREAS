"use strict";

/* ==========================================================
   Lista de tareas diarias con temporizador y recordatorio
   ========================================================== */

const MAX_TAREAS = 10;
const CLAVE_ALMACENAMIENTO = "tareas-diarias";
const SEGUNDOS_POCO_TIEMPO = 60;

const ETIQUETAS_ESTADO = {
  pendiente: "Pendiente",
  "en-curso": "En curso",
  pausada: "Pausada",
  vencida: "Tiempo agotado",
  completada: "Completada",
};

/* ---------- Referencias al DOM ---------- */
const formulario = document.getElementById("formulario");
const campoNombre = document.getElementById("nombre-tarea");
const campoDuracion = document.getElementById("duracion-tarea");
const mensajeFormulario = document.getElementById("mensaje-formulario");
const listaTareas = document.getElementById("lista-tareas");
const contenedorAvisos = document.getElementById("avisos");
const barraProgreso = document.getElementById("barra-progreso");
const textoProgreso = document.getElementById("texto-progreso");
const botonReiniciar = document.getElementById("boton-reiniciar");
const textoFecha = document.getElementById("fecha");

/* ---------- Estado ---------- */
let tareas = cargarTareas();

/* ==========================================================
   Almacenamiento
   ========================================================== */

function cargarTareas() {
  try {
    const guardadas = localStorage.getItem(CLAVE_ALMACENAMIENTO);
    return guardadas ? JSON.parse(guardadas) : [];
  } catch (error) {
    return [];
  }
}

function guardarTareas() {
  try {
    localStorage.setItem(CLAVE_ALMACENAMIENTO, JSON.stringify(tareas));
  } catch (error) {
    mostrarMensaje("No se pudo guardar el progreso en este navegador.");
  }
}

/* ==========================================================
   Lógica de tareas
   ========================================================== */

function crearTarea(nombre, minutos) {
  const duracion = minutos * 60;

  return {
    id: Date.now(),
    nombre,
    duracion,
    restante: duracion,
    estado: "pendiente",
    finalizaEn: null,
  };
}

function segundosRestantes(tarea) {
  if (tarea.estado === "en-curso") {
    return Math.max(0, Math.ceil((tarea.finalizaEn - Date.now()) / 1000));
  }
  return tarea.restante;
}

function iniciarTarea(tarea) {
  tarea.estado = "en-curso";
  tarea.finalizaEn = Date.now() + tarea.restante * 1000;
}

function pausarTarea(tarea) {
  tarea.restante = segundosRestantes(tarea);
  tarea.estado = "pausada";
  tarea.finalizaEn = null;
}

function completarTarea(tarea) {
  if (tarea.estado === "en-curso") {
    tarea.restante = segundosRestantes(tarea);
  }
  tarea.estado = "completada";
  tarea.finalizaEn = null;
}

function reabrirTarea(tarea) {
  tarea.estado = "pendiente";
  tarea.restante = tarea.duracion;
}

function buscarTarea(id) {
  return tareas.find((tarea) => tarea.id === id);
}

/* ==========================================================
   Recordatorios
   ========================================================== */

function avisarTiempoAgotado(tarea) {
  mostrarAviso(`Se acabó el tiempo de: ${tarea.nombre}`);
  emitirSonido();
  enviarNotificacion(tarea);
}

function mostrarAviso(texto) {
  const aviso = document.createElement("div");
  aviso.className = "aviso";

  const mensaje = document.createElement("span");
  mensaje.textContent = texto;

  const botonCerrar = document.createElement("button");
  botonCerrar.type = "button";
  botonCerrar.textContent = "Entendido";
  botonCerrar.addEventListener("click", () => aviso.remove());

  aviso.append(mensaje, botonCerrar);
  contenedorAvisos.append(aviso);
}

function emitirSonido() {
  try {
    const contexto = new AudioContext();
    const oscilador = contexto.createOscillator();
    oscilador.frequency.value = 880;
    oscilador.connect(contexto.destination);
    oscilador.start();
    oscilador.stop(contexto.currentTime + 0.6);
  } catch (error) {
    // Si el navegador bloquea el audio, el aviso visual sigue funcionando.
  }
}

function pedirPermisoNotificaciones() {
  if ("Notification" in window && Notification.permission === "default") {
    Notification.requestPermission();
  }
}

function enviarNotificacion(tarea) {
  if ("Notification" in window && Notification.permission === "granted") {
    new Notification("Tiempo agotado", { body: tarea.nombre });
  }
}

/* ==========================================================
   Formato
   ========================================================== */

function formatearTiempo(totalSegundos) {
  const horas = Math.floor(totalSegundos / 3600);
  const minutos = Math.floor((totalSegundos % 3600) / 60);
  const segundos = totalSegundos % 60;
  const dos = (numero) => String(numero).padStart(2, "0");

  return horas > 0
    ? `${horas}:${dos(minutos)}:${dos(segundos)}`
    : `${dos(minutos)}:${dos(segundos)}`;
}

function formatearFecha() {
  return new Date().toLocaleDateString("es-CO", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

/* ==========================================================
   Renderizado
   ========================================================== */

function crearBoton(texto, clase, accion) {
  const boton = document.createElement("button");
  boton.type = "button";
  boton.className = `boton ${clase}`;
  boton.textContent = texto;
  boton.addEventListener("click", accion);
  return boton;
}

function crearElementoTarea(tarea) {
  const item = document.createElement("li");
  item.className = `tarea ${tarea.estado}`;
  item.dataset.id = tarea.id;

  const casilla = document.createElement("input");
  casilla.type = "checkbox";
  casilla.checked = tarea.estado === "completada";
  casilla.setAttribute("aria-label", `Marcar como completada: ${tarea.nombre}`);
  casilla.addEventListener("change", () => alternarCompletada(tarea.id));

  const nombre = document.createElement("span");
  nombre.className = "tarea-nombre";
  nombre.textContent = tarea.nombre;

  const detalle = document.createElement("div");
  detalle.className = "tarea-detalle";
  detalle.innerHTML =
    `${tarea.duracion / 60} min · ` +
    `<span class="tarea-tiempo"></span> · ` +
    `<span class="tarea-estado">${ETIQUETAS_ESTADO[tarea.estado]}</span>`;

  const acciones = document.createElement("div");
  acciones.className = "tarea-acciones";

  if (tarea.estado !== "completada") {
    const enCurso = tarea.estado === "en-curso";
    acciones.append(
      crearBoton(
        enCurso ? "Pausar" : "Iniciar",
        "boton-secundario",
        () => alternarTemporizador(tarea.id)
      )
    );
  }

  acciones.append(
    crearBoton("Eliminar", "boton-peligro", () => eliminarTarea(tarea.id))
  );

  item.append(casilla, nombre, detalle, acciones);
  return item;
}

function render() {
  listaTareas.replaceChildren();

  if (tareas.length === 0) {
    const vacia = document.createElement("li");
    vacia.className = "lista-vacia";
    vacia.textContent = "Aún no tienes tareas. Agrega la primera arriba.";
    listaTareas.append(vacia);
  } else {
    tareas.forEach((tarea) => listaTareas.append(crearElementoTarea(tarea)));
  }

  actualizarProgreso();
  actualizarTiempos();
  actualizarBotonAgregar();
}

function actualizarProgreso() {
  const completadas = tareas.filter((t) => t.estado === "completada").length;

  barraProgreso.max = Math.max(tareas.length, 1);
  barraProgreso.value = completadas;
  textoProgreso.textContent = `${completadas} de ${tareas.length} completadas`;
}

function actualizarBotonAgregar() {
  const lleno = tareas.length >= MAX_TAREAS;
  formulario.querySelector("button[type='submit']").disabled = lleno;

  if (lleno) {
    mostrarMensaje(`Llegaste al máximo de ${MAX_TAREAS} tareas por día.`);
  }
}

function mostrarMensaje(texto) {
  mensajeFormulario.textContent = texto;
}

/* Actualiza solo los tiempos, sin redibujar toda la lista. */
function actualizarTiempos() {
  tareas.forEach((tarea) => {
    const item = listaTareas.querySelector(`[data-id="${tarea.id}"]`);
    if (!item) return;

    const segundos = segundosRestantes(tarea);
    item.querySelector(".tarea-tiempo").textContent = formatearTiempo(segundos);

    const pocoTiempo =
      tarea.estado === "en-curso" && segundos <= SEGUNDOS_POCO_TIEMPO;
    item.classList.toggle("poco-tiempo", pocoTiempo);
  });
}

/* ==========================================================
   Temporizador (se ejecuta cada segundo)
   ========================================================== */

function revisarTiemposAgotados() {
  let huboCambios = false;

  tareas.forEach((tarea) => {
    if (tarea.estado === "en-curso" && segundosRestantes(tarea) === 0) {
      tarea.estado = "vencida";
      tarea.restante = 0;
      tarea.finalizaEn = null;
      avisarTiempoAgotado(tarea);
      huboCambios = true;
    }
  });

  if (huboCambios) {
    guardarTareas();
    render();
  }
}

function tic() {
  revisarTiemposAgotados();
  actualizarTiempos();
}

/* ==========================================================
   Acciones del usuario
   ========================================================== */

function agregarTarea(evento) {
  evento.preventDefault();

  const nombre = campoNombre.value.trim();
  const minutos = Number(campoDuracion.value);

  if (tareas.length >= MAX_TAREAS) return;

  if (!nombre || !Number.isInteger(minutos) || minutos < 1) {
    mostrarMensaje("Escribe un nombre y una duración de al menos 1 minuto.");
    return;
  }

  tareas.push(crearTarea(nombre, minutos));
  guardarTareas();
  mostrarMensaje("");
  formulario.reset();
  campoDuracion.value = 25;
  campoNombre.focus();
  render();
}

function alternarTemporizador(id) {
  const tarea = buscarTarea(id);
  if (!tarea) return;

  if (tarea.estado === "en-curso") {
    pausarTarea(tarea);
  } else {
    if (tarea.restante === 0) tarea.restante = tarea.duracion;
    pedirPermisoNotificaciones();
    iniciarTarea(tarea);
  }

  guardarTareas();
  render();
}

function alternarCompletada(id) {
  const tarea = buscarTarea(id);
  if (!tarea) return;

  if (tarea.estado === "completada") {
    reabrirTarea(tarea);
  } else {
    completarTarea(tarea);
  }

  guardarTareas();
  render();
}

function eliminarTarea(id) {
  tareas = tareas.filter((tarea) => tarea.id !== id);
  guardarTareas();
  mostrarMensaje("");
  render();
}

function reiniciarDia() {
  if (tareas.length === 0) return;

  if (confirm("¿Borrar todas las tareas para empezar un nuevo día?")) {
    tareas = [];
    guardarTareas();
    contenedorAvisos.replaceChildren();
    mostrarMensaje("");
    render();
  }
}

/* ==========================================================
   Inicio
   ========================================================== */

formulario.addEventListener("submit", agregarTarea);
botonReiniciar.addEventListener("click", reiniciarDia);

textoFecha.textContent = formatearFecha();
render();
revisarTiemposAgotados();
setInterval(tic, 1000);
