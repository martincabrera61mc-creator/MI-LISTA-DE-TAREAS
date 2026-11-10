<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Tareas del día</title>
  <link rel="stylesheet" href="estilo.css">
</head>
<body>
  <main class="app">

    <header class="encabezado">
      <div>
        <h1>Tareas del día</h1>
        <p id="fecha" class="fecha"></p>
      </div>
      <span id="contador-tareas" class="contador-tareas">0 / 10 tareas</span>
    </header>

    <!-- Resumen -->
    <section class="resumen" aria-label="Resumen del día">
      <article class="tarjeta">
        <h2>Completadas</h2>
        <p id="resumen-completadas" class="tarjeta-valor">0 de 0</p>
        <progress id="barra-progreso" value="0" max="1"></progress>
      </article>
      <article class="tarjeta">
        <h2>Tiempo planificado</h2>
        <p id="resumen-planificado" class="tarjeta-valor">0 min</p>
      </article>
      <article class="tarjeta">
        <h2>Tiempo pendiente</h2>
        <p id="resumen-pendiente" class="tarjeta-valor">0 min</p>
      </article>
    </section>

    <!-- Tablero de tareas -->
    <section class="tablero">
      <div class="tabla-contenedor">
        <table>
          <thead>
            <tr>
              <th class="col-casilla"><span class="solo-lectores">Hecho</span></th>
              <th>Tarea</th>
              <th>Estado</th>
              <th>Duración</th>
              <th>Tiempo restante</th>
              <th class="col-acciones"><span class="solo-lectores">Acciones</span></th>
            </tr>
          </thead>

          <tbody id="cuerpo-tabla"></tbody>

          <tfoot>
            <tr class="fila-nueva">
              <td></td>
              <td>
                <input id="nombre-tarea" form="formulario" type="text" maxlength="60"
                       placeholder="+ Agregar tarea" aria-label="Nombre de la tarea" required>
              </td>
              <td colspan="2">
                <div class="duracion-nueva">
                  <input id="duracion-tarea" form="formulario" type="number"
                         min="1" max="600" value="25" aria-label="Duración en minutos" required>
                  <span>min</span>
                  <div class="atajos" role="group" aria-label="Duraciones rápidas">
                    <button type="button" data-minutos="15">15</button>
                    <button type="button" data-minutos="25">25</button>
                    <button type="button" data-minutos="45">45</button>
                    <button type="button" data-minutos="60">60</button>
                  </div>
                </div>
              </td>
              <td colspan="2">
                <button type="submit" form="formulario" class="boton boton-principal">Agregar</button>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <form id="formulario" autocomplete="off"></form>
      <p id="mensaje-formulario" class="mensaje-formulario" aria-live="polite"></p>
    </section>

    <footer class="pie">
      <button id="boton-reiniciar" type="button" class="boton boton-secundario">Reiniciar el día</button>
    </footer>

  </main>

  <!-- Avisos y recordatorios -->
  <div id="avisos" class="avisos" role="alert" aria-live="assertive"></div>

  <script src="app.js"></script>
</body>
</html>
