<template>
  <div class="container">
    
    <!-- VISTA 1: BUSCADOR PRINCIPAL DE ACREDITACIONES -->
    <div v-if="vistaActual === 'acreditar'">
      
      <!-- Tarjeta de Búsqueda y Botón de Nuevo Estudiante -->
      <div class="box caja-oscura p-5 mb-5">
        <div class="is-flex is-justify-content-space-between is-align-items-center flex-wrap mb-4">
          <div>
            <h3 class="title is-3 texto-blanco has-text-weight-bold mb-1">Búsqueda de Inscriptos</h3>
            <p class="subtitle is-6 texto-claro mb-0">Realice el check-in presencial de los participantes.</p>
          </div>
          <div class="mt-3 mt-md-0">
            <button @click="irANuevo" class="button is-success is-medium has-text-weight-bold">
              ➕ NUEVO ESTUDIANTE
            </button>
          </div>
        </div>
        
        <div class="field has-addons">
          <div class="control is-expanded">
            <input 
              type="text" 
              v-model="terminoBusqueda" 
              @keyup.enter="buscarInscriptos"
              class="input is-large input-oscuro has-text-weight-bold" 
              placeholder="INGRESE DNI, APELLIDO O NOMBRE Y PRESIONE ENTER..." 
            />
          </div>
          <div class="control">
            <button @click="buscarInscriptos" class="button is-link is-large has-text-weight-bold">
              BUSCAR
            </button>
          </div>
        </div>
      </div>

      <!-- Notificación visual -->
      <div v-if="mensajeModal.texto" :class="['notification', mensajeModal.tipo === 'exito' ? 'is-success' : 'is-danger', 'is-light', 'mb-5']">
        <button class="delete" @click="mensajeModal.texto = ''"></button>
        <span class="has-text-weight-semibold is-size-5">{{ mensajeModal.texto }}</span>
      </div>

      <!-- Resultados de la Búsqueda -->
      <div class="box caja-oscura p-5">
        <h4 class="title is-4 texto-blanco has-text-weight-bold mb-4">Resultados de la Búsqueda</h4>

        <p v-if="cargando" class="texto-claro is-size-5">Buscando en la base de datos...</p>

        <div v-else-if="inscriptosRaw.length === 0" class="notification is-warning is-light is-size-5">
          No se encontraron inscriptos coincidentes.
        </div>

        <!-- CASO A: MÚLTIPLES PERSONAS ENCONTRADAS -->
        <div v-else-if="!participanteSeleccionado && listaParticipantesUnicos.length > 1">
          <div class="notification is-info is-light mb-4 is-size-5">
            Se encontraron <strong>{{ listaParticipantesUnicos.length }} participantes</strong> con ese criterio. Por favor, seleccione el correcto:
          </div>
          <div class="table-container">
            <table class="table is-fullwidth is-hoverable tabla-custom">
              <thead>
                <tr>
                  <th class="texto-blanco is-size-5">DNI</th>
                  <th class="texto-blanco is-size-5">Apellidos y Nombres</th>
                  <th class="texto-blanco is-size-5">Escuela</th>
                  <th class="texto-blanco is-size-5 has-text-centered">Acción</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="persona in listaParticipantesUnicos" :key="persona.dni">
                  <td class="texto-claro is-size-5 has-text-weight-bold">{{ persona.dni }}</td>
                  <td class="texto-claro is-size-5 has-text-weight-bold">{{ persona.alumno }}</td>
                  <td class="texto-claro is-size-5">{{ persona.escuela }}</td>
                  <td class="has-text-centered">
                    <button @click="seleccionarParticipante(persona)" class="button is-link is-medium has-text-weight-bold">
                      SELECCIONAR
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- CASO B: UNICO PARTICIPANTE SELECCIONADO -->
        <div v-else-if="participanteSeleccionado">
          <button v-if="listaParticipantesUnicos.length > 1" @click="participanteSeleccionado = null" class="button is-small is-light mb-4 has-text-weight-bold">
            ← Volver a la lista de resultados
          </button>

          <!-- DATOS GENERALES -->
          <div class="box mb-5" style="background-color: #0f172a; border: 1px solid #334155;">
            <div class="columns is-vcentered">
              <div class="column is-3">
                <p class="is-size-6 texto-gris has-text-weight-semibold">DNI DEL PARTICIPANTE</p>
                <p class="is-size-4 texto-blanco has-text-weight-bold">{{ participanteSeleccionado.dni }}</p>
              </div>
              <div class="column is-4">
                <p class="is-size-6 texto-gris has-text-weight-semibold">APELLIDOS Y NOMBRES</p>
                <p class="is-size-4 texto-blanco has-text-weight-bold">{{ participanteSeleccionado.alumno }}</p>
              </div>
              <div class="column is-3">
                <p class="is-size-6 texto-gris has-text-weight-semibold">ESCUELA</p>
                <p class="is-size-4 texto-blanco has-text-weight-bold">{{ participanteSeleccionado.escuela }}</p>
              </div>
              <div class="column is-2 has-text-centered">
                <button @click="eliminarEstudiante(participanteSeleccionado.dni)" class="button is-danger is-medium has-text-weight-bold">
                  🗑️ ELIMINAR
                </button>
              </div>
            </div>
          </div>

          <!-- TABLA DE MODALIDADES -->
          <h5 class="title is-5 texto-blanco has-text-weight-bold mb-3">Modalidades e Inscripciones Asignadas</h5>
          <div class="table-container">
            <table class="table is-fullwidth is-hoverable tabla-custom">
              <thead>
                <tr>
                  <th class="texto-blanco is-size-5">Modalidad / Categoría</th>
                  <th class="texto-blanco is-size-5">Estado</th>
                  <th class="texto-blanco is-size-5 has-text-centered">Acción</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="inscripcion in inscripcionesDelSeleccionado" :key="inscripcion.inscripto_id">
                  <td class="texto-claro is-size-5 has-text-weight-bold">{{ inscripcion.modalidad }}</td>
                  <td>
                    <span :class="inscripcion.presente ? 'tag is-success is-medium is-size-6' : 'tag is-danger is-medium is-size-6'">
                      {{ inscripcion.presente ? 'ACREDITADO' : 'PENDIENTE' }}
                    </span>
                  </td>
                  <td class="has-text-centered">
                    <button 
                      v-if="!inscripcion.presente" 
                      @click="realizarAcreditacion(inscripcion.inscripto_id)" 
                      class="button is-success is-medium has-text-weight-bold">
                      ACREDITAR
                    </button>
                    <span v-else class="texto-claro is-size-5 has-text-weight-semibold">Completado</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </div>

    <!-- VISTA 2: COMPONENTE DE ALTA -->
    <div v-else-if="vistaActual === 'nuevo'">
      <NuevoEstudiante 
        @volver="vistaActual = 'acreditar'" 
        @estudiante-creado="manejarEstudianteCreado" 
      />
    </div>

    <!-- MODAL DE CONFIRMACIÓN DE ELIMINACIÓN -->
    <div class="modal" :class="{ 'is-active': modalConfirmacion.activo }">
      <div class="modal-background" @click="cancelarEliminacion"></div>
      <div class="modal-content">
        <div class="box" style="background-color: #1e293b; border: 1px solid #ef4444;">
          <h3 class="title is-4 has-text-danger has-text-weight-bold has-text-centered mb-4">
            ⚠️ ATENCIÓN: ACCIÓN IRREVERSIBLE
          </h3>
          <p class="is-size-5 has-text-white has-text-centered mb-5">
            ¿Está seguro que desea ELIMINAR COMPLETAMENTE al estudiante con DNI <strong class="has-text-warning">{{ modalConfirmacion.dni }}</strong> y todas sus inscripciones en las distintas modalidades?
            <br><br>
            Esta acción debe realizarse antes de iniciar la competencia.
          </p>
          <div class="field is-grouped is-grouped-centered">
            <div class="control">
              <button @click="confirmarEliminacion" class="button is-danger is-medium has-text-weight-bold">
                🗑️ SÍ, ELIMINAR COMPLETAMENTE
              </button>
            </div>
            <div class="control">
              <button @click="cancelarEliminacion" class="button is-light is-medium has-text-weight-bold">
                CANCELAR
              </button>
            </div>
          </div>
        </div>
      </div>
      <button class="modal-close is-large" aria-label="close" @click="cancelarEliminacion"></button>
    </div>

  </div>
</template>

<script>
import api from '../services/api';
import NuevoEstudiante from './NuevoEstudiante.vue';

export default {
  name: 'Acreditar',
  components: {
    NuevoEstudiante
  },
  data() {
    return {
      vistaActual: 'acreditar',
      terminoBusqueda: '',
      inscriptosRaw: [],
      participanteSeleccionado: null,
      cargando: false,
      mensajeModal: {
        texto: '',
        tipo: 'exito'
      },
      modalConfirmacion: {
        activo: false,
        dni: null
      }
    };
  },
  computed: {
    listaParticipantesUnicos() {
      const mapa = new Map();
      for (const item of this.inscriptosRaw) {
        if (!mapa.has(item.dni)) {
          mapa.set(item.dni, {
            inscripto_id: item.inscripto_id,
            dni: item.dni,
            alumno: item.alumno,
            escuela: item.escuela,
            es_suplente: item.es_suplente
          });
        }
      }
      return Array.from(mapa.values());
    },

    inscripcionesDelSeleccionado() {
      if (!this.participanteSeleccionado) return [];
      return this.inscriptosRaw.filter(item => item.dni === this.participanteSeleccionado.dni);
    }
  },
  methods: {
    async buscarInscriptos() {
      if (!this.terminoBusqueda || !this.terminoBusqueda.trim()) {
        this.inscriptosRaw = [];
        this.participanteSeleccionado = null;
        return;
      }
      this.cargando = true;
      this.mensajeModal.texto = '';
      this.participanteSeleccionado = null;
      try {
        const respuesta = await api.get(`/acreditaciones/buscar?termino=${this.terminoBusqueda.trim()}`);
        let datos = [];
        if (Array.isArray(respuesta.data)) {
          datos = respuesta.data;
        } else if (respuesta.data && Array.isArray(respuesta.data.data)) {
          datos = respuesta.data.data;
        }
        
        this.inscriptosRaw = datos;

        const unicos = this.listaParticipantesUnicos;
        if (unicos.length === 1) {
          this.participanteSeleccionado = unicos[0];
        }
      } catch (error) {
        console.error('Error al buscar inscriptos:', error);
        this.mostrarMensaje('Error al conectar con el servidor para realizar la búsqueda.', 'error');
        this.inscriptosRaw = [];
      } finally {
        this.cargando = false;
      }
    },

    eliminarEstudiante(dni) {
      this.modalConfirmacion.dni = dni;
      this.modalConfirmacion.activo = true;
    },

    cancelarEliminacion() {
      this.modalConfirmacion.activo = false;
      this.modalConfirmacion.dni = null;
    },

    async confirmarEliminacion() {
      const dni = this.modalConfirmacion.dni;
      this.cancelarEliminacion();

      try {
        const respuesta = await api.delete(`/acreditaciones/inscriptos/${dni}`);
        
        if (respuesta.data && respuesta.data.exito) {
          this.mostrarMensaje('Estudiante eliminado completamente del sistema.', 'exito');
          this.participanteSeleccionado = null;
          
          if (this.terminoBusqueda) {
            this.buscarInscriptos();
          }
        }
      } catch (error) {
        console.error('Error al eliminar estudiante:', error);
        const errorMsg = error.response?.data?.error || 'Error al intentar eliminar el estudiante del sistema.';
        this.mostrarMensaje(errorMsg, 'error');
      }
    },

    seleccionarParticipante(persona) {
      this.participanteSeleccionado = persona;
    },

    irANuevo() {
      this.vistaActual = 'nuevo';
    },

    async realizarAcreditacion(inscriptoId) {
      try {
        await api.post('/acreditaciones', {
          inscripto_id: inscriptoId,
          presente: true,
          documentacion_ok: true
        });

        const registro = this.inscriptosRaw.find(p => p.inscripto_id === inscriptoId);
        if (registro) {
          registro.presente = 1;
        }
        this.mostrarMensaje('Acreditación registrada correctamente.', 'exito');
      } catch (error) {
        console.error('Error al acreditar al inscripto:', error.response || error);
        const errorMsg = error.response?.data?.error || 'No se pudo completar la acreditación. Verifique el servidor.';
        this.mostrarMensaje(errorMsg, 'error');
      }
    },

    manejarEstudianteCreado() {
      this.vistaActual = 'acreditar';
      this.mostrarMensaje('Estudiante reemplazante registrado con éxito. Ya puede buscarlo para acreditarlo.', 'exito');
      if (this.terminoBusqueda) {
        this.buscarInscriptos();
      }
    },

    mostrarMensaje(texto, tipo) {
      this.mensajeModal = { texto, tipo };
      setTimeout(() => {
        if (this.mensajeModal.texto === texto) {
          this.mensajeModal.texto = '';
        }
      }, 5000);
    }
  }
};
</script>

<style scoped>
.texto-gris { color: #94a3b8 !important; }

.tabla-custom {
  background-color: #0f172a !important;
  color: #ffffff !important;
}
.tabla-custom th {
  background-color: #1e293b !important;
  color: #ffffff !important;
  border-bottom: 2px solid #475569;
}
.tabla-custom td {
  border-bottom: 1px solid #334155;
  vertical-align: middle;
}
.tabla-custom tr:hover {
  background-color: #1e293b !important;
}
</style>