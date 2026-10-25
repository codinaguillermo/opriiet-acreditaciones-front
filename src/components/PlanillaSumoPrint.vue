<template>
  <div class="box caja-oscura p-5">
    
    <!-- ENCABEZADO DINÁMICO -->
    <div class="is-flex is-justify-content-space-between is-align-items-center mb-5 flex-wrap">
      <div>
        <h3 class="title is-3 texto-blanco has-text-weight-bold mb-2">
          {{ esModoEdicion ? 'Edición de Datos de Estudiante' : 'Alta de Estudiante Reemplazante' }}
        </h3>
        <p class="subtitle is-5 texto-claro mb-0">
          {{ esModoEdicion ? 'Modificación de registros individuales existentes.' : 'Registro individual de alumnos con documentación aprobada. Solo escuelas, categorías y modalidades preexistentes.' }}
        </p>
      </div>
      <div class="mt-3 mt-md-0">
        <button type="button" @click="volver" class="button is-dark is-medium has-text-weight-bold">
          ⬅ Volver
        </button>
      </div>
    </div>

    <!-- NOTIFICACIÓN DE ESTADO -->
    <div v-if="notificacion.texto" :class="['notification', notificacion.tipo === 'exito' ? 'is-success' : 'is-danger', 'is-light', 'mb-5']">
      <button class="delete" @click="notificacion.texto = ''"></button>
      <span class="has-text-weight-semibold is-size-5">{{ notificacion.texto }}</span>
    </div>

    <!-- FORMULARIO -->
    <form @submit.prevent="guardarEstudiante">
      <div class="columns is-multiline">

        <!-- 1. Selección de Escuela Existente -->
        <div class="column is-12-mobile is-6-desktop">
          <div class="field">
            <label class="label texto-blanco is-size-5">Escuela</label>
            <div class="control">
              <div class="select is-large is-fullwidth">
                <select 
                  v-model="formulario.escuela_id" 
                  required 
                  class="has-text-weight-bold" 
                  style="background-color: #0f172a; color: white; border: 2px solid #475569;"
                >
                  <option disabled value="">Seleccione la escuela de origen...</option>
                  <option v-for="escuela in escuelasLista" :key="escuela.escuela_id" :value="escuela.escuela_id">
                    {{ escuela.escuela_nombre }}
                  </option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <!-- 2. DNI del Alumno -->
        <div class="column is-12-mobile is-6-desktop">
          <div class="field">
            <label class="label texto-blanco is-size-5">DNI</label>
            <div class="control">
              <input 
                type="text" 
                v-model="formulario.dni" 
                class="input is-large input-oscuro has-text-weight-bold" 
                placeholder="EJ: 45123456" 
                required 
              />
            </div>
          </div>
        </div>

        <!-- 3. Apellidos y Nombres -->
        <div class="column is-12">
          <div class="field">
            <label class="label texto-blanco is-size-5">Apellidos y Nombres Completos</label>
            <div class="control">
              <input 
                type="text" 
                v-model="formulario.alumno" 
                class="input is-large input-oscuro has-text-weight-bold" 
                placeholder="EJ: GÓMEZ, MARTÍN EDUARDO" 
                required 
              />
            </div>
          </div>
        </div>

        <!-- 4. Categoría -->
        <div class="column is-12-mobile is-6-desktop">
          <div class="field">
            <label class="label texto-blanco is-size-5">Categoría</label>
            <div class="control">
              <div class="select is-large is-fullwidth">
                <select 
                  v-model="formulario.categoria_id" 
                  @change="onCategoriaChange" 
                  required 
                  class="has-text-weight-bold" 
                  style="background-color: #0f172a; color: white; border: 2px solid #475569;"
                >
                  <option disabled value="">Seleccione categoría...</option>
                  <option v-for="cat in categoriasLista" :key="cat.categoria_id" :value="cat.categoria_id">
                    {{ cat.categoria_nombre }}
                  </option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <!-- 5. Modalidad -->
        <div class="column is-12-mobile is-6-desktop">
          <div class="field">
            <label class="label texto-blanco is-size-5">Modalidad</label>
            <div class="control">
              <div class="select is-large is-fullwidth">
                <select 
                  v-model="formulario.modalidad_id" 
                  :disabled="!formulario.categoria_id" 
                  required 
                  class="has-text-weight-bold" 
                  style="background-color: #0f172a; color: white; border: 2px solid #475569;"
                >
                  <option disabled value="">
                    {{ formulario.categoria_id ? 'Seleccione modalidad...' : 'Primero seleccione una categoría' }}
                  </option>
                  <option v-for="mod in modalidadesFiltradas" :key="mod.modalidad_id" :value="mod.modalidad_id">
                    {{ mod.modalidad_nombre }}
                  </option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <!-- 6. Condición de Suplente -->
        <div class="column is-12 mt-2">
          <div class="field">
            <label class="checkbox texto-blanco is-size-5 has-text-weight-bold">
              <input type="checkbox" v-model="formulario.es_suplente" class="mr-2" style="transform: scale(1.3);" />
              Marcar como alumno suplente
            </label>
          </div>
        </div>

      </div>

      <!-- BOTONES DE ACCIÓN -->
      <div class="field is-grouped mt-6">
        <div class="control">
          <button 
            type="submit" 
            class="button is-link is-large has-text-weight-bold" 
            :class="{ 'is-loading': guardando }"
            :disabled="!esFormularioValido"
          >
            💾 {{ esModoEdicion ? 'GUARDAR CAMBIOS' : 'REGISTRAR ALUMNO' }}
          </button>
        </div>
        <div class="control" v-if="!esModoEdicion">
          <button type="button" @click="resetearFormulario" class="button is-dark is-large has-text-weight-bold">
            LIMPIAR
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
  props: {
    estudianteAEditar: {
      type: Object,
      default: null
    }
  },
  emits: ['volver', 'estudiante-guardado'],
  data() {
    return {
      guardando: false,
      escuelasLista: [],
      modalidadesBrutas: [],
      
      formulario: {
        escuela_id: '',
        dni: '',
        alumno: '',
        categoria_id: '',
        modalidad_id: '',
        es_suplente: false
      },

      notificacion: {
        texto: '',
        tipo: 'exito'
      }
    };
  },
  computed: {
    esModoEdicion() {
      return Boolean(this.estudianteAEditar && this.estudianteAEditar.inscripto_id);
    },
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
      if (!this.formulario.categoria_id) return [];
      return this.modalidadesBrutas.filter(
        m => m.categoria_id === Number(this.formulario.categoria_id)
      );
    },
    esFormularioValido() {
      return Boolean(
        this.formulario.escuela_id &&
        this.formulario.dni &&
        this.formulario.dni.trim() !== '' &&
        this.formulario.alumno &&
        this.formulario.alumno.trim() !== '' &&
        this.formulario.categoria_id &&
        this.formulario.modalidad_id
      );
    }
  },
  async mounted() {
    await this.cargarCatalogos();
    
    // Si pasamos un estudiante por props, precargamos los datos
    if (this.esModoEdicion) {
      this.precargarDatosEdicion();
    }
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
        console.error('Error al cargar catálogos maestros:', error);
        this.mostrarNotificacion('Error al cargar listas de escuelas y modalidades.', 'error');
      }
    },

    precargarDatosEdicion() {
      const est = this.estudianteAEditar;
      
      // Buscamos la categoría correspondiente a la modalidad del alumno en las modalidades brutas
      const modEncontrada = this.modalidadesBrutas.find(m => m.modalidad_nombre === est.modalidad);
      
      this.formulario = {
        escuela_id: this.escuelasLista.find(e => e.escuela_nombre === est.escuela)?.escuela_id || '',
        dni: est.dni || '',
        alumno: est.alumno || '',
        categoria_id: modEncontrada ? modEncontrada.categoria_id : '',
        modalidad_id: modEncontrada ? modEncontrada.modalidad_id : '',
        es_suplente: Boolean(est.es_suplente)
      };
    },

    onCategoriaChange() {
      this.formulario.modalidad_id = '';
    },

    async guardarEstudiante() {
      if (!this.esFormularioValido) {
        this.mostrarNotificacion('Debe completar todos los datos requeridos.', 'error');
        return;
      }

      this.guardando = true;

      const payload = {
        escuela_id: this.formulario.escuela_id,
        dni: this.formulario.dni.trim(),
        alumno: this.formulario.alumno.trim().toUpperCase(),
        modalidad_id: this.formulario.modalidad_id,
        es_suplente: this.formulario.es_suplente
      };

      try {
        let respuesta;
        if (this.esModoEdicion) {
          respuesta = await api.put(`/acreditaciones/inscriptos/${this.estudianteAEditar.inscripto_id}`, payload);
        } else {
          respuesta = await api.post('/acreditaciones/inscriptos-nuevo', payload);
        }
        
        if (respuesta.data && respuesta.data.exito) {
          this.mostrarNotificacion(
            this.esModoEdicion 
              ? `Estudiante ${payload.alumno} actualizado con éxito.` 
              : `Estudiante ${payload.alumno} registrado con éxito.`, 
            'exito'
          );
          this.$emit('estudiante-guardado', respuesta.data.inscripto_id);
          if (!this.esModoEdicion) {
            this.resetearFormulario();
          }
        }
      } catch (error) {
        console.error('Error al guardar estudiante:', error);
        const mensajeError = error.response?.data?.error || 'Error interno al procesar el estudiante.';
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
        categoria_id: '',
        modalidad_id: '',
        es_suplente: false
      };
    },

    volver() {
      this.$emit('volver');
    },

    mostrarNotificacion(texto, tipo) {
      this.notificacion = { texto, tipo };
      setTimeout(() => {
        if (this.notificacion.texto === texto) {
          this.notificacion.texto = '';
        }
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
.input-oscuro:focus {
  border-color: #3b82f6 !important;
  box-shadow: 0 0 0 0.125em rgba(59, 130, 246, 0.25) !important;
}
</style>