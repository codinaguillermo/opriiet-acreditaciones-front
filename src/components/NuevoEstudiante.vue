<template>
  <div class="box caja-oscura p-5">
    
    <!-- ENCABEZADO -->
    <div class="is-flex is-justify-content-space-between is-align-items-center mb-5 flex-wrap">
      <div>
        <h3 class="title is-3 texto-blanco has-text-weight-bold mb-2">Alta de Estudiante Reemplazante</h3>
        <p class="subtitle is-5 texto-claro mb-0">
          Registro individual de alumnos para múltiples modalidades.
        </p>
      </div>
      <div class="mt-3 mt-md-0">
        <button type="button" @click="volver" class="button is-dark is-medium has-text-weight-bold">
          ⬅ Volver a Acreditaciones
        </button>
      </div>
    </div>

    <!-- NOTIFICACIÓN DE ESTADO -->
    <div v-if="notificacion.texto" :class="['notification', notificacion.tipo === 'exito' ? 'is-success' : 'is-danger', 'is-light', 'mb-5']">
      <button class="delete" @click="notificacion.texto = ''"></button>
      <span class="has-text-weight-semibold is-size-5">{{ notificacion.texto }}</span>
    </div>

    <form @submit.prevent="guardarEstudiante">
      
      <!-- SECCIÓN 1: DATOS FIJOS DEL ALUMNO (ENCABEZADO) -->
      <div class="box mb-5" style="background-color: #0f172a; border: 1px solid #334155;">
        <h4 class="title is-5 texto-blanco mb-4 border-bottom pb-2">1. Datos Personales y Escuela</h4>
        <div class="columns is-multiline">
          
          <div class="column is-12-mobile is-6-desktop">
            <div class="field">
              <label class="label texto-blanco">Escuela</label>
              <div class="control">
                <div class="select is-fullwidth">
                  <select v-model="formulario.escuela_id" required class="has-text-weight-bold input-oscuro">
                    <option disabled value="">Seleccione la escuela de origen...</option>
                    <option v-for="escuela in escuelasLista" :key="escuela.escuela_id" :value="escuela.escuela_id">
                      {{ escuela.escuela_nombre }}
                    </option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div class="column is-12-mobile is-6-desktop">
            <div class="field">
              <label class="label texto-blanco">DNI</label>
              <div class="control">
                <input type="text" v-model="formulario.dni" class="input input-oscuro has-text-weight-bold" placeholder="EJ: 45123456" required />
              </div>
            </div>
          </div>

          <div class="column is-12">
            <div class="field">
              <label class="label texto-blanco">Apellidos y Nombres Completos</label>
              <div class="control">
                <input type="text" v-model="formulario.alumno" class="input input-oscuro has-text-weight-bold" placeholder="EJ: GÓMEZ, MARTÍN EDUARDO" required />
              </div>
            </div>
          </div>

          <div class="column is-12">
            <div class="field">
              <label class="checkbox texto-blanco has-text-weight-bold">
                <input type="checkbox" v-model="formulario.es_suplente" class="mr-2" style="transform: scale(1.2);" />
                Marcar como alumno suplente
              </label>
            </div>
          </div>

        </div>
      </div>

      <!-- SECCIÓN 2: SELECCIÓN MÚLTIPLE DE MODALIDADES (DETALLE) -->
      <div class="box mb-5" style="background-color: #0f172a; border: 1px solid #334155;">
        <h4 class="title is-5 texto-blanco mb-4 border-bottom pb-2">2. Asignación de Modalidades</h4>
        
        <div class="columns is-vcentered">
          <div class="column is-4">
            <div class="field">
              <label class="label texto-blanco">Categoría</label>
              <div class="control">
                <div class="select is-fullwidth">
                  <select v-model="seleccionTemporal.categoria_id" @change="onCategoriaChange" class="has-text-weight-bold input-oscuro">
                    <option disabled value="">Seleccione categoría...</option>
                    <option v-for="cat in categoriasLista" :key="cat.categoria_id" :value="cat.categoria_id">
                      {{ cat.categoria_nombre }}
                    </option>
                  </select>
                </div>
              </div>
            </div>
          </div>
          <div class="column is-5">
            <div class="field">
              <label class="label texto-blanco">Modalidad</label>
              <div class="control">
                <div class="select is-fullwidth">
                  <select v-model="seleccionTemporal.modalidad_id" :disabled="!seleccionTemporal.categoria_id" class="has-text-weight-bold input-oscuro">
                    <option disabled value="">{{ seleccionTemporal.categoria_id ? 'Seleccione modalidad...' : 'Primero seleccione categoría' }}</option>
                    <option v-for="mod in modalidadesFiltradas" :key="mod.modalidad_id" :value="mod.modalidad_id">
                      {{ mod.modalidad_nombre }}
                    </option>
                  </select>
                </div>
              </div>
            </div>
          </div>
          <div class="column is-3 has-text-centered mt-4">
            <button type="button" @click="agregarModalidad" :disabled="!seleccionTemporal.modalidad_id" class="button is-info has-text-weight-bold is-fullwidth">
              ➕ Agregar a la lista
            </button>
          </div>
        </div>

        <!-- TABLA DE MODALIDADES SELECCIONADAS (LETRAS CLARAS, GRANDES Y BRILLANTES) -->
        <div class="table-container mt-4" v-if="formulario.modalidadesSeleccionadas.length > 0">
          <table class="table is-fullwidth is-bordered" style="background-color: #0f172a; border: 2px solid #475569;">
            <thead>
              <tr style="background-color: #1e293b;">
                <th class="has-text-white has-text-weight-bold is-size-5">Categoría</th>
                <th class="has-text-white has-text-weight-bold is-size-5">Modalidad</th>
                <th class="has-text-centered has-text-white has-text-weight-bold is-size-5" style="width: 120px;">Quitar</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in formulario.modalidadesSeleccionadas" :key="item.modalidad_id">
                <td class="has-text-white has-text-weight-bold is-size-4">{{ item.categoria_nombre }}</td>
                <td class="has-text-warning has-text-weight-bold is-size-4">{{ item.modalidad_nombre }}</td>
                <td class="has-text-centered">
                  <button type="button" @click="quitarModalidad(index)" class="button is-danger is-medium has-text-weight-bold">❌</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-else class="notification is-warning is-light py-2 px-3 mt-3">
          Aún no se han agregado modalidades para este alumno.
        </div>
      </div>

      <!-- BOTONES DE ACCIÓN -->
      <div class="field is-grouped mt-5">
        <div class="control">
          <button 
            type="submit" 
            class="button is-link is-large has-text-weight-bold" 
            :class="{ 'is-loading': guardando }"
            :disabled="!esFormularioValido"
          >
            💾 REGISTRAR INSCRIPCIONES
          </button>
        </div>
        <div class="control">
          <button type="button" @click="resetearFormulario" class="button is-dark is-large has-text-weight-bold">
            LIMPIAR TODO
          </button>
        </div>
      </div>
    </form>

  </div>
</template>

<script>
import api from '../services/api';

export default {
  name: 'NuevoEstudiante',
  emits: ['volver', 'estudiante-creado'],
  data() {
    return {
      guardando: false,
      escuelasLista: [],
      modalidadesBrutas: [],
      
      formulario: {
        escuela_id: '',
        dni: '',
        alumno: '',
        es_suplente: false,
        modalidadesSeleccionadas: []
      },

      seleccionTemporal: {
        categoria_id: '',
        modalidad_id: ''
      },

      notificacion: { texto: '', tipo: 'exito' }
    };
  },
  computed: {
    categoriasLista() {
      const mapa = new Map();
      for (const item of this.modalidadesBrutas) {
        if (!mapa.has(item.categoria_id)) {
          mapa.set(item.categoria_id, {
            categoria_id: item.categoria_id,
            categoria_nombre: item.categoria_nombre
          });
        }
      }
      return Array.from(mapa.values());
    },
    modalidadesFiltradas() {
      if (!this.seleccionTemporal.categoria_id) return [];
      return this.modalidadesBrutas.filter(
        m => m.categoria_id === Number(this.seleccionTemporal.categoria_id)
      );
    },
    esFormularioValido() {
      return Boolean(
        this.formulario.escuela_id &&
        this.formulario.dni &&
        this.formulario.dni.trim() !== '' &&
        this.formulario.alumno &&
        this.formulario.alumno.trim() !== '' &&
        this.formulario.modalidadesSeleccionadas.length > 0
      );
    }
  },
  mounted() {
    this.cargarCatalogos();
  },
  methods: {
    async cargarCatalogos() {
      try {
        const [resEscuelas, resModalidades] = await Promise.all([
          api.get('/acreditaciones/escuelas'),
          api.get('/equipos/categorias-modalidades')
        ]);
        if (resEscuelas.data && resEscuelas.data.exito) {
          this.escuelasLista = resEscuelas.data.data;
        }
        if (resModalidades.data && resModalidades.data.exito) {
          this.modalidadesBrutas = resModalidades.data.data;
        }
      } catch (error) {
        console.error('Error al cargar catálogos:', error);
        this.mostrarNotificacion('Error al cargar listas de escuelas y modalidades.', 'error');
      }
    },

    onCategoriaChange() {
      this.seleccionTemporal.modalidad_id = '';
    },

    agregarModalidad() {
      const modId = this.seleccionTemporal.modalidad_id;
      if (!modId) return;

      const existe = this.formulario.modalidadesSeleccionadas.find(m => m.modalidad_id === modId);
      if (existe) {
        this.mostrarNotificacion('Esta modalidad ya fue agregada a la lista.', 'error');
        return;
      }

      const modalidadData = this.modalidadesBrutas.find(m => m.modalidad_id === modId);
      if (modalidadData) {
        this.formulario.modalidadesSeleccionadas.push({
          modalidad_id: modalidadData.modalidad_id,
          modalidad_nombre: modalidadData.modalidad_nombre,
          categoria_nombre: modalidadData.categoria_nombre
        });
      }

      this.seleccionTemporal.categoria_id = '';
      this.seleccionTemporal.modalidad_id = '';
    },

    quitarModalidad(index) {
      this.formulario.modalidadesSeleccionadas.splice(index, 1);
    },

    async guardarEstudiante() {
      if (!this.esFormularioValido) return;
      this.guardando = true;

      const modalidadesIds = this.formulario.modalidadesSeleccionadas.map(m => m.modalidad_id);

      const payload = {
        escuela_id: this.formulario.escuela_id,
        dni: this.formulario.dni.trim(),
        alumno: this.formulario.alumno.trim().toUpperCase(),
        es_suplente: this.formulario.es_suplente,
        modalidades: modalidadesIds
      };

      try {
        const respuesta = await api.post('/acreditaciones/inscriptos-nuevo', payload);
        if (respuesta.data && respuesta.data.exito) {
          this.mostrarNotificacion(`Estudiante ${payload.alumno} registrado en ${modalidadesIds.length} modalidades.`, 'exito');
          this.$emit('estudiante-creado');
          this.resetearFormulario();
        }
      } catch (error) {
        console.error('Error al registrar estudiante:', error);
        const mensajeError = error.response?.data?.error || 'Error interno al registrar al estudiante.';
        this.mostrarNotificacion(mensajeError, 'error');
      } finally {
        this.guardando = false;
      }
    },

    resetearFormulario() {
      this.formulario = {
        escuela_id: '',
        dni: '',
        alumno: '',
        es_suplente: false,
        modalidadesSeleccionadas: []
      };
      this.seleccionTemporal = { categoria_id: '', modalidad_id: '' };
    },

    volver() {
      this.$emit('volver');
    },

    mostrarNotificacion(texto, tipo) {
      this.notificacion = { texto, tipo };
      setTimeout(() => {
        if (this.notificacion.texto === texto) this.notificacion.texto = '';
      }, 5000);
    }
  }
};
</script>

<style scoped>
.caja-oscura {
  background-color: #1e293b;
  border-radius: 8px;
}
.texto-blanco {
  color: #ffffff !important;
}
.texto-claro {
  color: #cbd5e1 !important;
}
.input-oscuro {
  background-color: #0f172a !important;
  color: #ffffff !important;
  border: 2px solid #475569 !important;
}
.input-oscuro::placeholder {
  color: #64748b !important;
}
.input-oscuro:focus, .input-oscuro:active {
  border-color: #3b82f6 !important;
  box-shadow: 0 0 0 0.125em rgba(59, 130, 246, 0.25) !important;
}
</style>