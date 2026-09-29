<template>
  <div class="container">
    <!-- Tarjeta de Búsqueda -->
    <div class="box caja-oscura p-5 mb-5">
      <h3 class="title is-3 texto-blanco has-text-weight-bold mb-4">Búsqueda de Inscriptos</h3>
      
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

    <!-- Notificación visual en reemplazo de los alert() nativos -->
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

      <!-- CASO A: MÚLTIPLES PERSONAS ENCONTRADAS (PANTALLA DE PRE-SELECCIÓN) -->
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

      <!-- CASO B: UNICO PARTICIPANTE SELECCIONADO (O ÚLTIMO RESULTADO) -->
      <div v-else-if="participanteSeleccionado">
        <!-- Botón para volver al listado si hubo varios -->
        <button v-if="listaParticipantesUnicos.length > 1" @click="participanteSeleccionado = null" class="button is-small is-light mb-4 has-text-weight-bold">
          ← Volver a la lista de resultados
        </button>

        <!-- SECCIÓN 1: DATOS GENERALES DEL PARTICIPANTE Y ESCUELA -->
        <div class="box mb-5" style="background-color: #0f172a; border: 1px solid #334155;">
          <div class="columns is-vcentered">
            <div class="column is-3">
              <p class="is-size-6 texto-gris has-text-weight-semibold">DNI DEL PARTICIPANTE</p>
              <p class="is-size-4 texto-blanco has-text-weight-bold">{{ participanteSeleccionado.dni }}</p>
            </div>
            <div class="column is-5">
              <p class="is-size-6 texto-gris has-text-weight-semibold">APELLIDOS Y NOMBRES</p>
              <p class="is-size-4 texto-blanco has-text-weight-bold">{{ participanteSeleccionado.alumno }}</p>
            </div>
            <div class="column is-4">
              <p class="is-size-6 texto-gris has-text-weight-semibold">ESCUELA</p>
              <p class="is-size-4 texto-blanco has-text-weight-bold">{{ participanteSeleccionado.escuela }}</p>
            </div>
          </div>
        </div>

        <!-- SECCIÓN 2: TABLA EXCLUSIVA PARA LAS MODALIDADES DE ESTE PARTICIPANTE -->
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
</template>

<script>
/**
 * Propósito: Proveer la interfaz para la búsqueda de participantes, un sistema de pre-selección 
 *            cuando hay múltiples coincidencias por apellido/nombre, y el check-in presencial por modalidad.
 * A quién alimenta: Al componente principal App.vue.
 * Qué datos retorna: Lista filtrada de inscriptos, listado único agrupado por DNI y actualización de asistencia.
 */
import api from '../services/api';

export default {
  name: 'Acreditar',
  data() {
    return {
      terminoBusqueda: '',
      inscriptosRaw: [],
      participanteSeleccionado: null,
      cargando: false,
      mensajeModal: {
        texto: '',
        tipo: 'exito'
      }
    };
  },
  computed: {
    /**
     * Propósito: Agrupar los registros crudos devueltos por el backend por DNI único para evitar duplicados en la pre-selección.
     * A quién alimenta: A la tabla de pre-selección cuando la búsqueda arroja múltiples personas.
     * Qué datos retorna: Un array de objetos con los datos únicos de cada participante y sus inscripciones.
     */
    listaParticipantesUnicos() {
      const mapa = new Map();
      for (const item of this.inscriptosRaw) {
        if (!mapa.has(item.dni)) {
          mapa.set(item.dni, {
            dni: item.dni,
            alumno: item.alumno,
            escuela: item.escuela
          });
        }
      }
      return Array.from(mapa.values());
    },

    /**
     * Propósito: Filtrar todas las inscripciones/modalidades que pertenecen estrictamente al participante seleccionado.
     * A quién alimenta: A la tabla detallada de modalidades del alumno elegido.
     * Qué datos retorna: Un array con las filas de modalidades correspondientes al DNI del participante activo.
     */
    inscripcionesDelSeleccionado() {
      if (!this.participanteSeleccionado) return [];
      return this.inscriptosRaw.filter(item => item.dni === this.participanteSeleccionado.dni);
    }
  },
  methods: {
    /**
     * Propósito: Consultar al backend mediante Axios y procesar el listado bruto de inscripciones de la búsqueda.
     * A quién alimenta: A las propiedades computadas de pre-selección y filtrado de participantes.
     * Qué datos retorna: Asigna el array obtenido a inscriptosRaw y gestiona la selección automática si hay un único resultado.
     */
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

        // Si la búsqueda arroja una sola persona única, la seleccionamos automáticamente por comodidad
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

    /**
     * Propósito: Establecer manualmente el participante activo cuando el usuario hace clic en "SELECCIONAR" desde la tabla múltiple.
     * A quién alimenta: A la vista de detalles y modalidades del alumno elegido.
     * Qué datos retorna: Actualiza la variable reactiva participanteSeleccionado.
     * 
     * @param {Object} persona - Objeto con los datos del participante elegido.
     */
    seleccionarParticipante(persona) {
      this.participanteSeleccionado = persona;
    },

    /**
     * Propósito: Enviar una petición POST al backend con el inscripto_id específico para registrar el check-in presencial.
     * A quién alimenta: Al controlador del backend AcreditacionController.acreditarInscripto.
     * Qué datos retorna: Actualiza el estado de presencia en la estructura local y muestra una notificación visual.
     * 
     * @param {number} inscriptoId - Identificador único de la inscripción específica de esa modalidad.
     */
    async realizarAcreditacion(inscriptoId) {
      try {
        await api.post('/acreditaciones', {
          inscripto_id: inscriptoId,
          presente: true,
          documentacion_ok: true
        });

        // Actualizamos de forma reactiva en el array bruto local
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

    /**
     * Propósito: Mostrar un mensaje visual temporal en la interfaz en reemplazo de alertas nativas.
     * A quién alimenta: A la barra de notificaciones superior del componente.
     * Qué datos retorna: Actualiza el estado reactivo mensajeModal con texto y tipo.
     * 
     * @param {string} texto - Texto del mensaje a mostrar.
     * @param {string} tipo - Tipo de notificación ('exito' o 'error').
     */
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