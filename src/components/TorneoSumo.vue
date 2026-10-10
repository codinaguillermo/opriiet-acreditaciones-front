<template>
  <div class="box caja-oscura p-5">
    <h3 class="title is-3 texto-blanco has-text-weight-bold mb-2">Gestión de Torneo: Sumo</h3>
    <p class="subtitle is-4 has-text-weight-bold mb-4" style="color: #ffffff !important;">Modalidad Activa: {{ nombreModalidadActiva }}</p>

    <!-- CARTEL DE CAMPEÓN / GANADOR ABSOLUTO -->
    <div v-if="equipoCampeon" class="box mb-5 p-5 has-text-centered" style="background: linear-gradient(135deg, #1e3a8a 0%, #1e1b4b 100%); border: 3px solid #3b82f6; box-shadow: 0 0 20px rgba(59, 130, 246, 0.4);">
      <span class="tag is-dark is-large has-text-weight-bold mb-3 texto-blanco" style="font-size: 1.2rem; background-color: #0f172a; color: #ffffff !important; border: 1px solid #3b82f6;">🏆 CAMPEÓN ABSOLUTO DE LA MODALIDAD 🏆</span>
      <p class="is-size-2 has-text-weight-bold texto-blanco mb-2" style="color: #ffffff !important;">{{ equipoCampeon.nombre_equipo }}</p>
      <p class="is-size-5 has-text-weight-semibold texto-blanco" style="color: #ffffff !important;">Escuela: {{ equipoCampeon.escuela_nombre }}</p>
    </div>

    <!-- Controles Globales de Operación -->
    <div class="columns is-multiline mb-4 is-align-items-flex-end">
      <div class="column is-12">
        <div class="buttons are-medium">
          <button 
            class="button is-link has-text-weight-bold" 
            @click="generarSorteoRonda1"
            :disabled="cargando || combates.length > 0"
          >
            🔀 Sortear Ronda 1
          </button>
          <button 
            v-if="!torneoFinalizado"
            class="button is-primary has-text-weight-bold" 
            @click="generarSorteoSiguienteRonda"
            :disabled="cargando || !rondaAnteriorFinalizada"
          >
            ⚡ Sortear Siguiente Ronda
          </button>
          <button 
            class="button is-info has-text-weight-bold" 
            @click="cargarLlaves"
          >
            🔄 Actualizar
          </button>
          <button 
            class="button is-danger has-text-weight-bold" 
            @click="abrirModalReset"
          >
            🗑️ Reiniciar Torneo
          </button>
        </div>
      </div>
    </div>

    <!-- Alertas -->
    <div v-if="mensajeExito" class="notification is-success is-light has-text-weight-bold mb-4">
      {{ mensajeExito }}
    </div>
    <div v-if="mensajeError" class="notification is-danger is-light has-text-weight-bold mb-4">
      {{ mensajeError }}
    </div>

    <!-- SISTEMA DE PESTAÑAS (TABS) DINÁMICAS POR RONDA -->
    <div v-if="combates.length > 0" class="tabs is-boxed is-medium mt-5 custom-tabs">
      <ul>
        <li v-for="rondaNum in rondasDisponibles" :key="rondaNum" :class="{ 'is-active': pestañaActiva === rondaNum }">
          <a @click="pestañaActiva = rondaNum" class="has-text-weight-bold">
            📍 Ronda {{ rondaNum }}
          </a>
        </li>
      </ul>
    </div>

    <!-- CONTENIDO DE LAS PESTAÑAS -->
    <div v-if="combates.length === 0" class="notification is-warning is-light has-text-weight-bold mt-5">
      No hay combates generados para esta modalidad. Utilice el botón "Sortear Ronda 1" para iniciar.
    </div>

    <div v-else>
      <!-- RENDERIZADO DINÁMICO POR CADA RONDA SELECCIONADA -->
      <div v-for="rondaNum in rondasDisponibles" :key="'contenido-' + rondaNum" v-show="pestañaActiva === rondaNum">
        
        <!-- GRAN FINAL NORMAL (SI EXISTE EN ESTA RONDA) -->
        <div v-if="obtenerCombatesPorRondaYGrupo(rondaNum, 'FINAL').length > 0" class="mb-6">
          <h4 class="title is-4 has-text-warning has-text-weight-bold mb-4">🏆 Ronda {{ rondaNum }} - GRAN FINAL ABSOLUTA 🏆</h4>
          <div class="columns is-multiline">
            <div v-for="combate in obtenerCombatesPorRondaYGrupo(rondaNum, 'FINAL')" :key="combate.id" class="column is-12">
              <div class="box p-5" style="background-color: #0f172a; border: 3px solid #fbbf24; box-shadow: 0 0 15px rgba(251, 191, 36, 0.3);">
                
                <div class="is-flex is-justify-content-space-between is-align-items-center mb-3">                  
                  <span class="tag is-medium has-text-weight-bold" :class="combate.estado === 'finalizado' ? 'is-success' : 'is-warning'">
                    {{ combate.estado.toUpperCase() }}
                  </span>
                </div>

                <div class="columns is-mobile is-vcentered text-center my-3">
                  <div class="column is-5">
                    <p class="is-size-4 has-text-weight-bold texto-blanco" style="color: #ffffff !important;">{{ combate.robot_1_nombre || 'Invicto Zona A' }}</p>
                  </div>
                  <div class="column is-2 has-text-centered">
                    <span class="tag is-warning is-large has-text-weight-bold">VS</span>
                  </div>
                  <div class="column is-5">
                    <p class="is-size-4 has-text-weight-bold texto-blanco" style="color: #ffffff !important;">
                      {{ combate.robot_2_nombre || (combate.robot_2_id === null ? 'Sin Rival / Eliminados (W.O.)' : 'Ganador Zona B') }}
                    </p>
                  </div>
                </div>

                <div v-if="combate.estado === 'pendiente' && combate.robot_1_id && combate.robot_2_id" class="mt-4">
                  <div class="buttons are-medium is-centered mb-3">
                    <button class="button is-success has-text-weight-bold" @click="registrarResultado(combate.id, combate.robot_1_id)">
                      🏆 Ganó Campeonato: {{ combate.robot_1_nombre }}
                    </button>
                    <button class="button is-success has-text-weight-bold" @click="registrarResultado(combate.id, combate.robot_2_id)">
                      🏆 Ganó Campeonato: {{ combate.robot_2_nombre }}
                    </button>
                  </div>
                </div>

                <div v-if="combate.estado === 'finalizado'" class="has-text-centered mt-3">
                  <p class="is-size-5 texto-blanco has-text-weight-semibold mb-2" style="color: #ffffff !important;">
                    Ganador del Combate: 
                    <strong class="has-text-success">
                      {{ combate.ganador_nombre }}
                    </strong>
                  </p>
                  <button class="button is-warning is-small has-text-weight-bold" @click="abrirModalRevertir(combate.id)">
                    ⚠️ Revertir Resultado (Error de Juez)
                  </button>
                </div>

              </div>
            </div>
          </div>
        </div>

        <!-- GRUPO A -->
        <div class="mb-6">
          <h4 class="title is-4 has-text-success has-text-weight-bold mb-4">🏆 Ronda {{ rondaNum }} - Grupo A (Ganadores / Invictos)</h4>
          
          <!-- TARJETA DE PASE LIBRE ZONA A -->
          <div v-if="pasesLibresZonaAPorRonda[rondaNum]" class="box mb-4 p-4" style="background-color: #1e3a8a; border: 2px solid #3b82f6;">
            <div class="is-flex is-justify-content-space-between is-align-items-center">
              <div>
                <span class="tag is-info is-medium has-text-weight-bold mb-2">🎫 Zona A - PASE LIBRE</span>
                <p class="is-size-4 has-text-weight-bold texto-blanco m-0" style="color: #ffffff !important;">{{ pasesLibresZonaAPorRonda[rondaNum].nombre_equipo }}</p>
                <p class="is-size-6 mt-1 texto-blanco has-text-weight-semibold" style="color: #ffffff !important;">Escuela: {{ pasesLibresZonaAPorRonda[rondaNum].escuela_nombre }} (Avanza directo en Zona A sin luchar).</p>
              </div>
            </div>
          </div>

          <!-- MENSAJE DINÁMICO ZONA A VACÍA -->
          <div v-if="obtenerCombatesPorRondaYGrupo(rondaNum, 'A').length === 0" class="box mb-4 p-4" style="background-color: #0f172a; border: 1px solid #3b82f6;">
            <p class="is-size-5 has-text-weight-bold texto-blanco mb-2" style="color: #ffffff !important;">No hay combates en la Zona A para esta ronda.</p>
            <p class="is-size-4 has-text-info has-text-weight-bold" style="color: #60a5fa !important;">
              {{ obtenerMensajeZonaVacia(rondaNum, 'A') }}
            </p>
          </div>

          <div class="columns is-multiline">
            <div v-for="combate in obtenerCombatesPorRondaYGrupo(rondaNum, 'A')" :key="combate.id" class="column is-12-tablet is-6-desktop">
              <div class="box p-4" style="background-color: #0f172a; border: 1px solid #166534;">
                
                <div class="is-flex is-justify-content-space-between is-align-items-center mb-3">                  
                  <span class="tag is-medium has-text-weight-bold" :class="combate.estado === 'finalizado' ? 'is-success' : 'is-warning'">
                    {{ combate.estado.toUpperCase() }}
                  </span>
                </div>

                <div class="columns is-mobile is-vcentered text-center my-3">
                  <div class="column is-5">
                    <p class="is-size-5 has-text-weight-bold texto-blanco" style="color: #ffffff !important;">{{ combate.robot_1_nombre || 'Por definir' }}</p>
                  </div>
                  <div class="column is-2 has-text-centered">
                    <span class="tag is-success is-medium has-text-weight-bold">VS</span>
                  </div>
                  <div class="column is-5">
                    <p class="is-size-5 has-text-weight-bold texto-blanco" style="color: #ffffff !important;">{{ combate.robot_2_nombre || 'Por definir' }}</p>
                  </div>
                </div>

                <div v-if="combate.estado === 'pendiente' && combate.robot_1_id && combate.robot_2_id" class="mt-4">
                  <div class="buttons are-small is-centered mb-2">
                    <button class="button is-success has-text-weight-bold" @click="registrarResultado(combate.id, combate.robot_1_id)">
                      Ganó: {{ combate.robot_1_nombre }}
                    </button>
                    <button class="button is-success has-text-weight-bold" @click="registrarResultado(combate.id, combate.robot_2_id)">
                      Ganó: {{ combate.robot_2_nombre }}
                    </button>
                  </div>

                  <div class="buttons are-small is-centered mb-2">
                    <button class="button is-danger is-light has-text-weight-bold" @click="abrirModalExpulsar(combate.id, combate.robot_1_id, combate.robot_1_nombre)">
                      ⛔ Expulsar: {{ combate.robot_1_nombre }}
                    </button>
                    <button class="button is-danger is-light has-text-weight-bold" @click="abrirModalExpulsar(combate.id, combate.robot_2_id, combate.robot_2_nombre)">
                      ⛔ Expulsar: {{ combate.robot_2_nombre }}
                    </button>
                  </div>

                  <div class="has-text-centered">
                    <button class="button is-danger is-small is-dark has-text-weight-bold" @click="registrarDobleDescalificacion(combate.id)">
                      ⚠️ Doble Descalificación / No Presentados
                    </button>
                  </div>
                </div>

                <div v-if="combate.estado === 'finalizado'" class="has-text-centered mt-3">
                  <p class="texto-blanco has-text-weight-semibold mb-2" style="color: #ffffff !important;">
                    Ganador: 
                    <strong :class="combate.ganador_nombre ? 'has-text-success' : 'has-text-danger'">
                      {{ combate.ganador_nombre || 'EMPATE / DOBLE DERROTA (Nadie avanza)' }}
                    </strong>
                  </p>
                  <button class="button is-warning is-small has-text-weight-bold" @click="abrirModalRevertir(combate.id)">
                    ⚠️ Revertir Resultado (Error de Juez)
                  </button>
                </div>

              </div>
            </div>
          </div>
        </div>

        <!-- GRUPO B -->
        <div>
          <h4 class="title is-4 has-text-warning has-text-weight-bold mb-4">🛡️ Ronda {{ rondaNum }} - Grupo B (Llave de Perdedores / Repechaje)</h4>
          
          <!-- TARJETA DE PASE LIBRE ZONA B -->
          <div v-if="pasesLibresZonaBPorRonda[rondaNum]" class="box mb-4 p-4" style="background-color: #854d0e; border: 2px solid #ca8a04;">
            <div class="is-flex is-justify-content-space-between is-align-items-center">
              <div>
                <span class="tag is-warning is-medium has-text-weight-bold mb-2">🎫 Zona B - PASE LIBRE (Descansa)</span>
                <p class="is-size-4 has-text-weight-bold texto-blanco m-0" style="color: #ffffff !important;">{{ pasesLibresZonaBPorRonda[rondaNum].nombre_equipo }}</p>
                <p class="is-size-6 mt-1 texto-blanco has-text-weight-semibold" style="color: #ffffff !important;">Escuela: {{ pasesLibresZonaBPorRonda[rondaNum].escuela_nombre }} (Avanza directo en Zona B sin luchar).</p>
              </div>
            </div>
          </div>

          <!-- MENSAJE DINÁMICO ZONA B VACÍA -->
          <div v-if="obtenerCombatesPorRondaYGrupo(rondaNum, 'B').length === 0" class="box mb-4 p-4" style="background-color: #0f172a; border: 1px solid #ca8a04;">
            <p class="is-size-5 has-text-weight-bold texto-blanco mb-2" style="color: #ffffff !important;">No hay combates en la Zona B para esta ronda.</p>
            <p class="is-size-4 has-text-warning has-text-weight-bold" style="color: #fbbf24 !important;">
              {{ obtenerMensajeZonaVacia(rondaNum, 'B') }}
            </p>
          </div>

          <div class="columns is-multiline">
            <div v-for="combate in obtenerCombatesPorRondaYGrupo(rondaNum, 'B')" :key="combate.id" class="column is-12-tablet is-6-desktop">
              <div class="box p-4" style="background-color: #0f172a; border: 1px solid #ca8a04;">
                
                <div class="is-flex is-justify-content-space-between is-align-items-center mb-3">                  
                  <span class="tag is-medium has-text-weight-bold" :class="combate.estado === 'finalizado' ? 'is-success' : 'is-warning'">
                    {{ combate.estado.toUpperCase() }}
                  </span>
                </div>

                <div class="columns is-mobile is-vcentered text-center my-3">
                  <div class="column is-5">
                    <p class="is-size-5 has-text-weight-bold texto-blanco" style="color: #ffffff !important;">{{ combate.robot_1_nombre || 'Por definir' }}</p>
                  </div>
                  <div class="column is-2 has-text-centered">
                    <span class="tag is-warning is-medium has-text-weight-bold">VS</span>
                  </div>
                  <div class="column is-5">
                    <p class="is-size-5 has-text-weight-bold texto-blanco" style="color: #ffffff !important;">{{ combate.robot_2_nombre || 'Por definir' }}</p>
                  </div>
                </div>

                <div v-if="combate.estado === 'pendiente' && combate.robot_1_id && combate.robot_2_id" class="mt-4">
                  <div class="buttons are-small is-centered mb-2">
                    <button class="button is-success has-text-weight-bold" @click="registrarResultado(combate.id, combate.robot_1_id)">
                      Ganó: {{ combate.robot_1_nombre }}
                    </button>
                    <button class="button is-success has-text-weight-bold" @click="registrarResultado(combate.id, combate.robot_2_id)">
                      Ganó: {{ combate.robot_2_nombre }}
                    </button>
                  </div>

                  <div class="buttons are-small is-centered mb-2">
                    <button class="button is-danger is-light has-text-weight-bold" @click="abrirModalExpulsar(combate.id, combate.robot_1_id, combate.robot_1_nombre)">
                      ⛔ Expulsar: {{ combate.robot_1_nombre }}
                    </button>
                    <button class="button is-danger is-light has-text-weight-bold" @click="abrirModalExpulsar(combate.id, combate.robot_2_id, combate.robot_2_nombre)">
                      ⛔ Expulsar: {{ combate.robot_2_nombre }}
                    </button>
                  </div>

                  <div class="has-text-centered">
                    <button class="button is-danger is-small is-dark has-text-weight-bold" @click="registrarDobleDescalificacion(combate.id)">
                      ⚠️ Doble Descalificación / No Presentados
                    </button>
                  </div>
                </div>

                <div v-if="combate.estado === 'finalizado'" class="has-text-centered mt-3">
                  <p class="texto-blanco has-text-weight-semibold mb-2" style="color: #ffffff !important;">
                    Ganador: 
                    <strong :class="combate.ganador_nombre ? 'has-text-success' : 'has-text-danger'">
                      {{ combate.ganador_nombre || 'EMPATE / DOBLE DERROTA (Nadie avanza)' }}
                    </strong>
                  </p>
                  <button class="button is-warning is-small has-text-weight-bold" @click="abrirModalRevertir(combate.id)">
                    ⚠️ Revertir Resultado (Error de Juez)
                  </button>
                </div>

              </div>
            </div>
          </div>
        </div>

      </div>
    </div>

    <!-- MODALES -->
    <div class="modal" :class="{ 'is-active': mostrarModalExpulsar }">
      <div class="modal-background" @click="cerrarModalExpulsar"></div>
      <div class="modal-card">
        <header class="modal-card-head" style="background-color: #7f1d1d; border-bottom: 2px solid #991b1b;">
          <p class="modal-card-title texto-blanco has-text-weight-bold">⛔ Expulsión Definitiva de Equipo</p>
          <button class="delete" aria-label="close" @click="cerrarModalExpulsar"></button>
        </header>
        <section class="modal-card-body" style="background-color: #0f172a; color: #ffffff;">
          <p class="is-size-5 mb-3 has-text-danger has-text-weight-bold">¿Está seguro de expulsar de forma permanente a "{{ equipoAEspulsarNombre }}"?</p>
          <p class="texto-blanco has-text-weight-semibold">Esta acción eliminará al equipo y su rival avanzará con victoria por W.O.</p>
        </section>
        <footer class="modal-card-foot" style="background-color: #1e293b; border-top: 2px solid #334155;">
          <button class="button is-danger has-text-weight-bold" @click="confirmarExpulsion">Sí, Expulsar Definitivamente</button>
          <button class="button has-text-weight-bold" @click="cerrarModalExpulsar">Cancelar</button>
        </footer>
      </div>
    </div>

    <div class="modal" :class="{ 'is-active': mostrarModalRevertir }">
      <div class="modal-background" @click="cerrarModalRevertir"></div>
      <div class="modal-card">
        <header class="modal-card-head" style="background-color: #1e293b; border-bottom: 2px solid #334155;">
          <p class="modal-card-title texto-blanco has-text-weight-bold">Confirmar Reversión de Combate</p>
          <button class="delete" aria-label="close" @click="cerrarModalRevertir"></button>
        </header>
        <section class="modal-card-body" style="background-color: #0f172a; color: #ffffff;">
          <p class="is-size-5 mb-3 texto-blanco has-text-weight-bold">¿Está seguro de revertir este combate?</p>
          <p class="texto-blanco has-text-weight-semibold">Se desharán las penalizaciones y el combate volverá a estar pendiente.</p>
        </section>
        <footer class="modal-card-foot" style="background-color: #1e293b; border-top: 2px solid #334155;">
          <button class="button is-warning has-text-weight-bold" @click="confirmarReversion">Sí, Revertir</button>
          <button class="button has-text-weight-bold" @click="cerrarModalRevertir">Cancelar</button>
        </footer>
      </div>
    </div>

    <div class="modal" :class="{ 'is-active': mostrarModalReset }">
      <div class="modal-background" @click="cerrarModalReset"></div>
      <div class="modal-card">
        <header class="modal-card-head" style="background-color: #7f1d1d; border-bottom: 2px solid #991b1b;">
          <p class="modal-card-title texto-blanco has-text-weight-bold">⚠️ ADVERTENCIA: Reiniciar Torneo</p>
          <button class="delete" aria-label="close" @click="cerrarModalReset"></button>
        </header>
        <section class="modal-card-body" style="background-color: #0f172a; color: #ffffff;">
          <p class="is-size-5 mb-3 has-text-danger has-text-weight-bold">¿Desea reiniciar el torneo por completo?</p>
          <p class="texto-blanco has-text-weight-semibold">Se borrarán todas las llaves y se restablecerán los estados de los equipos.</p>
        </section>
        <footer class="modal-card-foot" style="background-color: #1e293b; border-top: 2px solid #334155;">
          <button class="button is-danger has-text-weight-bold" @click="confirmarResetTorneo">Sí, Reiniciar Todo</button>
          <button class="button has-text-weight-bold" @click="cerrarModalReset">Cancelar</button>
        </footer>
      </div>
    </div>

    <!-- MODAL DE AVISO DE GRAN FINAL -->
    <div class="modal" :class="{ 'is-active': mostrarModalGranFinal }">
      <div class="modal-background" @click="mostrarModalGranFinal = false"></div>
      <div class="modal-card">
        <header class="modal-card-head" style="background-color: #1e3a8a; border-bottom: 2px solid #3b82f6;">
          <p class="modal-card-title texto-blanco has-text-weight-bold">🏆 ¡Definición de Zonas Concluida!</p>
          <button class="delete" aria-label="close" @click="mostrarModalGranFinal = false"></button>
        </header>
        <section class="modal-card-body" style="background-color: #0f172a; color: #ffffff;">
          <p class="is-size-5 mb-3 has-text-warning has-text-weight-bold">{{ mensajeModalGranFinal }}</p>
          <p class="texto-blanco has-text-weight-semibold">Ganador zona "A" vs Ganador zona "B"</p>
        </section>
        <footer class="modal-card-foot" style="background-color: #1e293b; border-top: 2px solid #334155;">
          <button class="button is-link has-text-weight-bold" @click="mostrarModalGranFinal = false">Ir a la Gran Final</button>
        </footer>
      </div>
    </div>

  </div>
</template>

<script>
import api from '../services/api';

export default {
  name: 'TorneoSumo',
  props: {
    modalidadInicial: {
      type: Number,
      required: true
    }
  },
  data() {
    return {
      nombreModalidadActiva: 'Cargando modalidad...',
      combates: [],
      pasesLibresZonaAPorRonda: {}, 
      pasesLibresZonaBPorRonda: {}, 
      cargando: false,
      mensajeExito: '',
      mensajeError: '',
      pestañaActiva: 1, 
      mostrarModalExpulsar: false,
      equipoAEspulsarId: null,
      equipoAEspulsarNombre: '',
      combateParaExpulsionId: null,
      mostrarModalRevertir: false,
      combateIdARevertir: null,
      mostrarModalReset: false,
      mostrarModalGranFinal: false,
      mensajeModalGranFinal: '',
      campeonWO: null // <--- Estado para atrapar al campeón por abandono
    };
  },
  computed: {
    rondasDisponibles() {
      if (this.combates.length === 0) return [1];
      const rondas = [...new Set(this.combates.map(c => c.ronda))];
      return rondas.sort((a, b) => a - b);
    },
    rondaAnteriorFinalizada() {
      if (this.combates.length === 0) return false;
      const ultimaRonda = Math.max(...this.rondasDisponibles);
      const combatesUltima = this.combates.filter(c => c.ronda === ultimaRonda);
      if (combatesUltima.length === 0) return false;
      return combatesUltima.every(c => c.estado === 'finalizado');
    },

    // MATRIZ DE CONTROL EN MEMORIA (FRONTEND) DE LA GRAN FINAL
    matrizGranFinal() {
      const combatesFinales = this.combates.filter(c => c.grupo === 'FINAL' && c.estado === 'finalizado');
      if (combatesFinales.length === 0) return null;

      const primerFinal = this.combates.find(c => c.grupo === 'FINAL');
      if (!primerFinal || !primerFinal.robot_1_id || !primerFinal.robot_2_id) return null;

      let matriz = [
        [primerFinal.robot_1_id, primerFinal.robot_1_nombre, 'A', 0],
        [primerFinal.robot_2_id, primerFinal.robot_2_nombre, 'B', 1]
      ];

      for (const fin of combatesFinales) {
        if (!fin.ganador_id) continue;
        const perdedorRow = (fin.ganador_id === matriz[0][0]) ? matriz[1] : matriz[0];
        perdedorRow[3] += 1;
      }

      return matriz;
    },

    torneoFinalizado() {
      // Detección especial de final por Abandono (W.O.) 
      if (this.campeonWO) return true;

      const matriz = this.matrizGranFinal;
      if (!matriz) return false;

      return matriz.some(row => row[3] >= 2);
    },

    equipoCampeon() {
      // Si tenemos la data del campeón directo por W.O.
      if (this.campeonWO) return this.campeonWO;

      const finales = this.combates.filter(c => c.grupo === 'FINAL' && c.estado === 'finalizado');
      if (finales.length === 0) return null;

      const matriz = this.matrizGranFinal;
      if (!matriz) return null;

      const ganador = matriz.find(row => row[3] < 2 && (matriz[0][3] >= 2 || matriz[1][3] >= 2));
      if (!ganador) return null;

      const combateUltimaFinal = finales[finales.length - 1];

      if (combateUltimaFinal && combateUltimaFinal.ganador_id === ganador[0]) {
        return {
          nombre_equipo: combateUltimaFinal.ganador_nombre,
          escuela_nombre: combateUltimaFinal.ganador_escuela_nombre || 'Escuela No Especificada'
        };
      }

      const combateGanador = finales.find(c => c.ganador_id === ganador[0]);
      return {
        nombre_equipo: ganador[1],
        escuela_nombre: combateGanador?.ganador_escuela_nombre || 'Escuela No Especificada'
      };
    },

    requiereGranFinal2() {
      const matriz = this.matrizGranFinal;
      if (!matriz) return false;

      const combatesFinales = this.combates.filter(c => c.grupo === 'FINAL' && c.estado === 'finalizado');
      
      return combatesFinales.length === 1 && matriz[0][3] === 1 && matriz[1][3] === 1;
    }
  },
  mounted() {
    this.inicializarVista();
  },
  methods: {
    async inicializarVista() {
      if (!this.modalidadInicial) {
        this.mensajeError = 'No se especificó una modalidad válida.';
        return;
      }
      await this.obtenerNombreModalidad();
      await this.cargarLlaves();
    },

    async obtenerNombreModalidad() {
      try {
        const respuesta = await api.get('/equipos/categorias-modalidades');
        if (respuesta.data && respuesta.data.exito) {
          const mod = respuesta.data.data.find(m => m.modalidad_id === this.modalidadInicial);
          if (mod) {
            this.nombreModalidadActiva = `${mod.categoria_nombre} - ${mod.modalidad_nombre}`;
          } else {
            this.nombreModalidadActiva = 'Modalidad ID: ' + this.modalidadInicial;
          }
        }
      } catch (error) {
        console.error('Error al obtener nombre de modalidad:', error);
        this.nombreModalidadActiva = 'Modalidad ID: ' + this.modalidadInicial;
      }
    },

    async cargarLlaves() {
      if (!this.modalidadInicial) return;
      this.mensajeError = '';
      this.mensajeExito = '';
      this.pasesLibresZonaAPorRonda = {};
      this.pasesLibresZonaBPorRonda = {};

      try {
        const respLlaves = await api.get(`/torneo/llaves/${this.modalidadInicial}`);
        if (respLlaves.data && respLlaves.data.exito) {
          this.combates = respLlaves.data.data;
          
          for (const ronda of this.rondasDisponibles) {
            try {
              const respLibreA = await api.get(`/torneo/pase-libre/${this.modalidadInicial}?ronda=${ronda}&grupo=A`);
              if (respLibreA.data && respLibreA.data.exito && respLibreA.data.pase_libre) {
                this.pasesLibresZonaAPorRonda[ronda] = respLibreA.data.pase_libre;
              }
              const respLibreB = await api.get(`/torneo/pase-libre/${this.modalidadInicial}?ronda=${ronda}&grupo=B`);
              if (respLibreB.data && respLibreB.data.exito && respLibreB.data.pase_libre) {
                this.pasesLibresZonaBPorRonda[ronda] = respLibreB.data.pase_libre;
              }
            } catch (err) {
              console.error(`Error al cargar pases libres de ronda ${ronda}:`, err);
            }
          }
        }
      } catch (error) {
        console.error('Error al cargar llaves:', error);
        this.mensajeError = 'Error al obtener el cuadro de llaves.';
      }
    },

    obtenerCombatesPorRondaYGrupo(ronda, grupo) {
      return this.combates.filter(c => c.ronda === ronda && c.grupo === grupo);
    },

    // NUEVO MÉTODO: Calcula dinámicamente quién espera en la zona o si está vacía
    obtenerMensajeZonaVacia(rondaNum, grupo) {
      const equipos = new Map();

      // Recopilamos a todos los equipos que participaron alguna vez
      this.combates.forEach(c => {
        if (c.robot_1_id && !equipos.has(c.robot_1_id)) {
            equipos.set(c.robot_1_id, { nombre: c.robot_1_nombre, derrotas: 0 });
        }
        if (c.robot_2_id && !equipos.has(c.robot_2_id)) {
            equipos.set(c.robot_2_id, { nombre: c.robot_2_nombre, derrotas: 0 });
        }
      });

      // Sumamos las derrotas únicamente hasta la ronda ANTERIOR a la que estamos mirando
      const combatesPrevios = this.combates.filter(c => c.ronda < rondaNum && c.estado === 'finalizado' && c.grupo !== 'FINAL');
      
      combatesPrevios.forEach(c => {
        if (c.ganador_id) {
          const perdedor_id = (c.robot_1_id === c.ganador_id) ? c.robot_2_id : c.robot_1_id;
          if (perdedor_id && equipos.has(perdedor_id)) {
            equipos.get(perdedor_id).derrotas++;
          }
        } else if (c.ganador_id === null && c.robot_1_id && c.robot_2_id) {
          // Doble descalificación suma a ambos
          if (equipos.has(c.robot_1_id)) equipos.get(c.robot_1_id).derrotas++;
          if (equipos.has(c.robot_2_id)) equipos.get(c.robot_2_id).derrotas++;
        }
      });

      const targetDerrotas = (grupo === 'A') ? 0 : 1;
      const sobrevivientes = Array.from(equipos.values()).filter(e => e.derrotas === targetDerrotas);

      if (sobrevivientes.length === 1) {
        return `✅ Finalista en espera: ${sobrevivientes[0].nombre}`;
      } else if (sobrevivientes.length > 1) {
        return `✅ ${sobrevivientes.length} equipos en espera.`;
      } else {
        return "❌ Zona vacía, sin ganadores.";
      }
    },

    async generarSorteoRonda1() {
      if (!this.modalidadInicial) return;
      this.cargando = true;
      this.mensajeError = '';
      this.mensajeExito = '';
      try {
        const respuesta = await api.post('/torneo/sorteo-ronda-1', {
          modalidad_id: this.modalidadInicial
        });
        if (respuesta.data && respuesta.data.exito) {
          this.mensajeExito = respuesta.data.mensaje;
          this.pestañaActiva = 1;
          await this.cargarLlaves();
        }
      } catch (error) {
        console.error('Error en sorteo R1:', error);
        this.mensajeError = error.response?.data?.error || 'Error al generar el sorteo de Ronda 1.';
      } finally {
        this.cargando = false;
      }
    },

    async generarSorteoSiguienteRonda() {
      if (!this.modalidadInicial) return;
      this.cargando = true;
      this.mensajeError = '';
      this.mensajeExito = '';

      try {
        const payload = {
          modalidad_id: this.modalidadInicial,
          forzar_desempate: this.requiereGranFinal2
        };

        const respuesta = await api.post('/torneo/sorteo-siguiente-ronda', payload);

        if (respuesta.data && respuesta.data.exito) {
          
          // LÓGICA DE ABANDONO / W.O. REPORTADA POR EL ÁRBITRO
          if (respuesta.data.torneo_finalizado) {
            this.mensajeExito = respuesta.data.mensaje;
            
            const campeonId = respuesta.data.campeon_absoluto_id;
            let datosCampeon = { nombre_equipo: 'Equipo #' + campeonId, escuela_nombre: 'Escuela No Especificada' };
            
            // Buscamos el nombre para el cartel azul sin pedirle nada más a la BD
            for (const c of this.combates) {
              if (c.robot_1_id === campeonId) {
                datosCampeon = { nombre_equipo: c.robot_1_nombre, escuela_nombre: c.ganador_escuela_nombre || 'Escuela No Especificada' }; 
                break; 
              }
              if (c.robot_2_id === campeonId) {
                datosCampeon = { nombre_equipo: c.robot_2_nombre, escuela_nombre: c.ganador_escuela_nombre || 'Escuela No Especificada' }; 
                break; 
              }
            }
            
            this.campeonWO = datosCampeon;
            await this.cargarLlaves();
            return;
          }

          // LÓGICA NORMAL DE RONDA O GRAN FINAL
          if (respuesta.data.modal_aviso) {
            this.mensajeModalGranFinal = respuesta.data.modal_aviso;
            this.mostrarModalGranFinal = true;
          }
          this.mensajeExito = respuesta.data.mensaje;
          
          if (respuesta.data.ronda) {
            this.pestañaActiva = respuesta.data.ronda; 
          }
          
          await this.cargarLlaves();
        } else if (respuesta.data && !respuesta.data.exito) {
          // LÓGICA DE TORNEO DESIERTO O ERROR LÓGICO
          this.mensajeError = respuesta.data.error || 'Ocurrió un problema al sortear la siguiente ronda.';
        }
      } catch (error) {
        console.error('Error en sorteo siguiente ronda:', error);
        this.mensajeError = error.response?.data?.error || 'Error crítico al generar la siguiente ronda.';
      } finally {
        this.cargando = false;
      }
    },

    async registrarResultado(combateId, ganadorId) {
      this.mensajeError = '';
      this.mensajeExito = '';
      try {
        const respuesta = await api.post('/torneo/resultado', {
          combate_id: combateId,
          ganador_id: ganadorId
        });
        if (respuesta.data && respuesta.data.exito) {
          this.mensajeExito = 'Resultado registrado correctamente.';
          await this.cargarLlaves();
        }
      } catch (error) {
        console.error('Error al registrar resultado:', error);
        this.mensajeError = error.response?.data?.error || 'Error al registrar el resultado.';
      }
    },

    async registrarDobleDescalificacion(combateId) {
      this.mensajeError = '';
      this.mensajeExito = '';
      try {
        const respuesta = await api.post('/torneo/resultado', {
          combate_id: combateId,
          doble_descalificacion: true
        });
        if (respuesta.data && respuesta.data.exito) {
          this.mensajeExito = respuesta.data.mensaje;
          this.cargarLlaves();
        }
      } catch (error) {
        console.error('Error en doble descalificación:', error);
        this.mensajeError = error.response?.data?.error || 'Error al registrar la doble descalificación.';
      }
    },

    abrirModalExpulsar(combateId, equipoId, nombreEquipo) {
      this.combateParaExpulsionId = combateId;
      this.equipoAEspulsarId = equipoId;
      this.equipoAEspulsarNombre = nombreEquipo;
      this.mostrarModalExpulsar = true;
    },

    cerrarModalExpulsar() {
      this.mostrarModalExpulsar = false;
      this.combateParaExpulsionId = null;
      this.equipoAEspulsarId = null;
      this.equipoAEspulsarNombre = '';
    },

    async confirmarExpulsion() {
      if (!this.combateParaExpulsionId || !this.equipoAEspulsarId) return;
      const combateId = this.combateParaExpulsionId;
      const equipoId = this.equipoAEspulsarId;
      this.cerrarModalExpulsar();

      this.mensajeError = '';
      this.mensajeExito = '';
      try {
        const respuesta = await api.post('/torneo/descalificar-permanente', {
          combate_id: combateId,
          equipo_a_descalificar_id: equipoId
        });
        if (respuesta.data && respuesta.data.exito) {
          this.mensajeExito = respuesta.data.mensaje;
          this.cargarLlaves();
        }
      } catch (error) {
        console.error('Error al descalificar permanentemente:', error);
        this.mensajeError = error.response?.data?.error || 'Error al procesar la expulsión.';
      }
    },

    abrirModalRevertir(combateId) {
      this.combateIdARevertir = combateId;
      this.mostrarModalRevertir = true;
    },

    cerrarModalRevertir() {
      this.mostrarModalRevertir = false;
      this.combateIdARevertir = null;
    },

    async confirmarReversion() {
      if (!this.combateIdARevertir) return;
      const idAProcesar = this.combateIdARevertir;
      this.cerrarModalRevertir();
      this.mensajeError = '';
      this.mensajeExito = '';

      try {
        const respuesta = await api.post('/torneo/revertir', { combate_id: idAProcesar });
        if (respuesta.data && respuesta.data.exito) {
          this.mensajeExito = respuesta.data.mensaje;
          this.cargarLlaves();
        }
      } catch (error) {
        console.error('Error al revertir combate:', error);
        this.mensajeError = error.response?.data?.error || 'Error al intentar revertir el combate.';
      }
    },

    abrirModalReset() {
      this.mostrarModalReset = true;
    },

    cerrarModalReset() {
      this.mostrarModalReset = false;
    },

    async confirmarResetTorneo() {
      if (!this.modalidadInicial) return;
      const modId = this.modalidadInicial;
      this.cerrarModalReset();
      this.mensajeError = '';
      this.mensajeExito = '';

      this.cargando = true;
      try {
        const respuesta = await api.delete(`/torneo/resetear/${modId}`);
        if (respuesta.data && respuesta.data.exito) {
          this.mensajeExito = respuesta.data.mensaje;
          this.combates = [];
          this.pasesLibresZonaAPorRonda = {};
          this.pasesLibresZonaBPorRonda = {};
          this.pestañaActiva = 1;
          this.campeonWO = null;
        }
      } catch (error) {
        console.error('Error al reiniciar torneo:', error);
        this.mensajeError = error.response?.data?.error || 'Error al intentar reiniciar el torneo.';
      } finally {
        this.cargando = false;
      }
    }
  }
};
</script>

<style scoped>
.custom-tabs ul {
  border-bottom: 2px solid #334155 !important;
}
.custom-tabs li a {
  background-color: #1e293b !important;
  color: #94a3b8 !important;
  border-color: #334155 !important;
  border-bottom: none !important;
}
.custom-tabs li.is-active a {
  background-color: #0f172a !important;
  color: #ffffff !important;
  border-color: #3b82f6 #3b82f6 transparent !important;
  border-top: 3px solid #3b82f6 !important;
}
</style>