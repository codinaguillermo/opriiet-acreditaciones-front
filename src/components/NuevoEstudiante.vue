<template>
  <div class="box caja-oscura p-5">
    
    <!-- ENCABEZADO -->
    <div class="is-flex is-justify-content-space-between is-align-items-center mb-5 flex-wrap">
      <div>
        <h3 class="title is-3 texto-blanco has-text-weight-bold mb-2">Alta de Estudiante Reemplazante</h3>
        <p class="subtitle is-5 texto-claro mb-0">
          Registro individual de alumnos con documentación aprobada. Solo escuelas, categorías y modalidades preexistentes.
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

        <!-- 5. Modalidad (Filtrada estrictamente por la categoría) -->
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
            💾 REGISTRAR ALUMNO
          </button>
        </div>
        <div class="control">
          <button type="button" @click="resetearFormulario" class="button is-dark is-large has-text-weight-bold">
            LIMPIAR
          </button>
        </div>
      </div>
    </form>

  </div>
</template>

<script>
/**
 * Propósito: Componente independiente para gestionar el alta manual de estudiantes reemplazantes,
 *            asegurando el enlace con escuelas, categorías y modalidades preexistentes.
 * A quién alimenta: A la vista principal o al contenedor de módulos cuando se solicita nuevo estudiante.
 * Qué datos retorna: Envía la petición POST al backend con el nuevo registro de inscripto.
 */
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
    /**
     * Propósito: Extraer el catálogo único de categorías existentes a partir de las modalidades.
     * A quién alimenta: Al selector desplegable de categorías en el template.
     * Qué datos retorna: Array de objetos con categoria_id y categoria_nombre.
     */
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

    /**
     * Propósito: Filtrar estrictamente las modalidades pertenecientes a la categoría seleccionada,
     *            impidiendo combinaciones incoherentes de modalidades.
     * A quién alimenta: Al selector desplegable de modalidades en el template.
     * Qué datos retorna: Array de modalidades hijas de la categoría activa.
     */
    modalidadesFiltradas() {
      if (!this.formulario.categoria_id) return [];
      return this.modalidadesBrutas.filter(
        m => m.categoria_id === Number(this.formulario.categoria_id)
      );
    },

    /**
     * Propósito: Validar que todos los campos requeridos tengan un valor cargado antes de permitir el envío.
     * A quién alimenta: A la propiedad :disabled del botón de submit.
     * Qué datos retorna: Boolean (true si es válido, false si falta algún dato).
     */
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
  mounted() {
    this.cargarCatalogos();
  },
  methods: {
    /**
     * Propósito: Consultar al backend las escuelas existentes y la estructura de categorías/modalidades.
     * A quién alimenta: Al hook mounted() en el ciclo de vida inicial del componente.
     * Qué datos retorna: Llena las variables reactivas escuelasLista y modalidadesBrutas.
     */
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

    /**
     * Propósito: Reiniciar la modalidad al cambiar la categoría para no dejar opciones incoherentes seleccionadas.
     * A quién alimenta: Al evento @change del select de categoría.
     * Qué datos retorna: Asigna valor vacío a formulario.modalidad_id.
     */
    onCategoriaChange() {
      this.formulario.modalidad_id = '';
    },

    /**
     * Propósito: Enviar el registro del nuevo alumno reemplazante al backend.
     * A quién alimenta: Al evento @submit.prevent del formulario principal.
     * Qué datos retorna: Notificación de confirmación o error y emisión de evento.
     */
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
        const respuesta = await api.post('/acreditaciones/inscriptos-nuevo', payload);
        
        if (respuesta.data && respuesta.data.exito) {
          this.mostrarNotificacion(
            `Estudiante ${payload.alumno} registrado con éxito (ID: ${respuesta.data.inscripto_id}).`, 
            'exito'
          );
          this.$emit('estudiante-creado', respuesta.data.inscripto_id);
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

    /**
     * Propósito: Restablecer todos los campos del formulario a sus valores iniciales en blanco.
     * A quién alimenta: Al botón "LIMPIAR" y a guardarEstudiante tras un alta exitosa.
     * Qué datos retorna: Limpia el objeto reactivo formulario.
     */
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

    /**
     * Propósito: Emitir el evento hacia el componente contenedor para regresar a la vista anterior.
     * A quién alimenta: Al botón "⬅ Volver a Acreditaciones".
     * Qué datos retorna: Emite el evento personalizado 'volver'.
     */
    volver() {
      this.$emit('volver');
    },

    /**
     * Propósito: Mostrar avisos de éxito o error al usuario que se desvanecen automáticamente tras unos segundos.
     * A quién alimenta: A las funciones guardarEstudiante y cargarCatalogos.
     * Qué datos retorna: Asigna valores a notificacion y programa el timeout de limpieza.
     */
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