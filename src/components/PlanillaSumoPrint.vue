<template>
  <!-- La clase oculta-impresion asegura que el fondo oscuro no se imprima -->
  <div class="box caja-oscura p-5 oculta-impresion">
    
    <!-- CONTROLES SUPERIORES (NO SE IMPRIMEN) -->
    <div class="is-flex is-justify-content-space-between is-align-items-center mb-5 flex-wrap controles-no-impresos">
      <button type="button" @click="volver" class="button is-dark is-medium has-text-weight-bold">
        ⬅ Volver a la competencia
      </button>
      <button type="button" @click="imprimirNativo" class="button is-link is-medium has-text-weight-bold">
        🖨️ Imprimir (Ctrl+P)
      </button>
    </div>

    <!-- CONTENEDOR DE LA HOJA (La clase area-impresion controla lo que va al papel) -->
    <div class="contenedor-hoja-scroll">
      <div class="hoja-a4 area-impresion">
        
        <!-- ENCABEZADO -->
        <div class="encabezado-planilla mb-4">
          <h2 class="title is-4 has-text-centered mb-1 has-text-black has-text-weight-bold">OPRIIET 2026 - Modalidad: {{ datosPlanilla.nombreModalidad }}</h2>
          <h3 class="subtitle is-5 has-text-centered mt-0 has-text-black has-text-weight-bold">Ronda nro {{ datosPlanilla.rondaActual }}</h3>
        </div>

        <!-- ZONA A -->
        <div v-if="datosPlanilla.combatesZonaA && datosPlanilla.combatesZonaA.length > 0" class="seccion-zona mb-5">
          <h4 class="title is-5 mb-2 has-text-black has-text-weight-bold">Grupo A - solo ganadores contra ganadores</h4>
          
          <p v-if="datosPlanilla.paseLibreZonaA" class="has-text-black mb-2 has-text-weight-bold is-size-6">
            Equipo con pase libre: {{ datosPlanilla.paseLibreZonaA.nombre_equipo }}
          </p>

          <table class="table is-bordered is-fullwidth tabla-fiscalizacion">
            <thead>
              <tr>
                <th class="has-text-centered is-vcentered">Equipo Azul<br>(Robot 1)</th>
                <th class="has-text-centered is-vcentered columna-check">Ganador</th>
                <th class="has-text-centered is-vcentered">Equipo Rojo<br>(Robot 2)</th>
                <th class="has-text-centered is-vcentered columna-check">Ganador</th>
                <th class="has-text-centered is-vcentered columna-check">Equipo<br>expulsado</th>
                <th class="has-text-centered is-vcentered columna-check">Doble<br>desc.</th>
              </tr>
            </thead>
            <tbody>
              <!-- La clase fila-no-cortar evita que la fila se divida en el salto de página -->
              <tr v-for="combate in datosPlanilla.combatesZonaA" :key="combate.id" class="fila-no-cortar">
                <td class="is-vcentered has-text-weight-semibold">{{ combate.robot_1_nombre || 'Por definir' }}</td>
                <td></td>
                <td class="is-vcentered has-text-weight-semibold">{{ combate.robot_2_nombre || 'Por definir' }}</td>
                <td></td>
                <td></td>
                <td></td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- ZONA B -->
        <div v-if="datosPlanilla.combatesZonaB && datosPlanilla.combatesZonaB.length > 0" class="seccion-zona mb-5">
          <h4 class="title is-5 mb-2 has-text-black has-text-weight-bold">Grupo B - llave de perdedores / repechaje</h4>
          
          <p v-if="datosPlanilla.paseLibreZonaB" class="has-text-black mb-2 has-text-weight-bold is-size-6">
            Equipo con pase libre: {{ datosPlanilla.paseLibreZonaB.nombre_equipo }}
          </p>

          <table class="table is-bordered is-fullwidth tabla-fiscalizacion">
            <thead>
              <tr>
                <th class="has-text-centered is-vcentered">Equipo Azul<br>(Robot 1)</th>
                <th class="has-text-centered is-vcentered columna-check">Ganador</th>
                <th class="has-text-centered is-vcentered">Equipo Rojo<br>(Robot 2)</th>
                <th class="has-text-centered is-vcentered columna-check">Ganador</th>
                <th class="has-text-centered is-vcentered columna-check">Equipo<br>expulsado</th>
                <th class="has-text-centered is-vcentered columna-check">Doble<br>desc.</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="combate in datosPlanilla.combatesZonaB" :key="combate.id" class="fila-no-cortar">
                <td class="is-vcentered has-text-weight-semibold">{{ combate.robot_1_nombre || 'Por definir' }}</td>
                <td></td>
                <td class="is-vcentered has-text-weight-semibold">{{ combate.robot_2_nombre || 'Por definir' }}</td>
                <td></td>
                <td></td>
                <td></td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- GRAN FINAL -->
        <div v-if="datosPlanilla.combatesFinal && datosPlanilla.combatesFinal.length > 0" class="seccion-zona mb-5">
          <h4 class="title is-5 mb-2 has-text-black has-text-weight-bold">GRAN FINAL ABSOLUTA</h4>
          <table class="table is-bordered is-fullwidth tabla-fiscalizacion">
            <thead>
              <tr>
                <th class="has-text-centered is-vcentered">Equipo Azul<br>(Robot 1)</th>
                <th class="has-text-centered is-vcentered columna-check">Ganador</th>
                <th class="has-text-centered is-vcentered">Equipo Rojo<br>(Robot 2)</th>
                <th class="has-text-centered is-vcentered columna-check">Ganador</th>
                <th class="has-text-centered is-vcentered columna-check">Equipo<br>expulsado</th>
                <th class="has-text-centered is-vcentered columna-check">Doble<br>desc.</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="combate in datosPlanilla.combatesFinal" :key="combate.id" class="fila-no-cortar">
                <td class="is-vcentered has-text-weight-semibold">{{ combate.robot_1_nombre || 'Por definir' }}</td>
                <td></td>
                <td class="is-vcentered has-text-weight-semibold">{{ combate.robot_2_nombre || 'Por definir' }}</td>
                <td></td>
                <td></td>
                <td></td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- OBSERVACIONES (Tampoco se corta a la mitad) -->
        <div class="observaciones mt-6 fila-no-cortar">
          <h5 class="has-text-black has-text-weight-bold is-size-6 mb-2">OBSERVACIONES / INCIDENCIAS:</h5>
          <div class="lineas-observaciones"></div>
        </div>

      </div>
    </div>

  </div>
</template>

<script>
/**
 * Propósito: Renderizar la planilla de fiscalización para imprimirla limpiamente.
 * A quién alimenta: Al módulo de impresión nativo del navegador.
 * Qué datos retorna: Vista generada desde los datos inyectados por el componente padre.
 */
export default {
  name: 'PlanillaSumoPrint',
  props: {
    datosPlanilla: {
      type: Object,
      required: true
    }
  },
  emits: ['volver'],
  methods: {
    volver() {
      this.$emit('volver');
    },
    imprimirNativo() {
      window.print();
    }
  }
};
</script>

<style scoped>
.caja-oscura {
  background-color: #1e293b;
  border-radius: 8px;
}

.contenedor-hoja-scroll {
  width: 100%;
  overflow-x: auto;
  background-color: #525659;
  padding: 20px;
  border-radius: 4px;
  display: flex;
  justify-content: center;
}

.hoja-a4 {
  background-color: white;
  width: 210mm;
  min-height: 297mm;
  padding: 15mm;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
  font-family: Arial, sans-serif;
  color: black;
}

.has-text-black {
  color: black !important;
}

.tabla-fiscalizacion {
  border-collapse: collapse;
}

.tabla-fiscalizacion th,
.tabla-fiscalizacion td {
  border: 1px solid #000 !important;
  color: black !important;
  background-color: white !important;
  font-size: 14px;
}

.tabla-fiscalizacion th {
  background-color: #f2f2f2 !important;
}

.columna-check {
  width: 12%;
}

.lineas-observaciones {
  width: 100%;
  height: 100px;
  border: 1px solid #000;
}
</style>

<style>
/* REGLAS ESTRICTAS PARA IMPRESIÓN NATIVA (GLOBALES) */
@media print {
  /* 1. Oculta toda la interfaz de la aplicación (Navbar, menús, fondos) */
  body * {
    visibility: hidden;
  }
  
  /* 2. Hace visible únicamente la hoja de la planilla y su contenido */
  .area-impresion, .area-impresion * {
    visibility: visible;
  }
  
  /* 3. Desplaza la hoja a la esquina superior absoluta, ignorando el espacio muerto del navbar */
  .area-impresion {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    margin: 0;
    padding: 15mm; 
    box-shadow: none;
  }
  
  /* Ocultar botones y contenedores de scroll del componente */
  .oculta-impresion, .contenedor-hoja-scroll {
    background: transparent !important;
    padding: 0 !important;
  }
  .controles-no-impresos {
    display: none !important;
  }

  /* Evitar cortes de página en medio de una fila */
  .fila-no-cortar {
    page-break-inside: avoid;
  }

  /* 4. Elimina la fecha, hora y URL (localhost) que inyecta el navegador */
  @page {
    margin: 0; 
  }
}
</style>