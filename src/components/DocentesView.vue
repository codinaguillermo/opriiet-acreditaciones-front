<template>
  <div class="box caja-oscura p-5">
    
    <!-- ENCABEZADO Y BUSCADOR -->
    <div class="is-flex is-justify-content-space-between is-align-items-center mb-5 flex-wrap">
      <div>
        <h3 class="title is-3 texto-blanco has-text-weight-bold mb-2">Docentes Referentes</h3>
        <p class="subtitle is-5 texto-claro mb-0">Gestión, filtros y actualización de docentes.</p>
      </div>
      <div class="mt-3 mt-md-0">
        <button type="button" @click="abrirModalAlta" class="button is-link is-medium has-text-weight-bold">
          ➕ Nuevo Docente
        </button>
      </div>
    </div>

    <!-- BARRA DE FILTRO / BÚSQUEDA -->
    <div class="field mb-5">
      <div class="control has-icons-left">
        <input 
          type="text" 
          v-model="filtroBusqueda" 
          class="input input-oscuro has-text-weight-semibold is-medium" 
          placeholder="🔍 Filtrar por nombre, DNI o escuela..." 
        />
        <span class="icon is-left texto-claro">
          🔎
        </span>
      </div>
    </div>

    <!-- NOTIFICACIÓN DE ESTADO -->
    <div v-if="notificacion.texto" :class="['notification', notificacion.tipo === 'exito' ? 'is-success' : 'is-danger', 'is-light', 'mb-5']">
      <button class="delete" @click="notificacion.texto = ''"></button>
      <span class="has-text-weight-semibold is-size-5">{{ notificacion.texto }}</span>
    </div>

    <!-- TABLA DE DOCENTES -->
    <div class="table-container mt-4">
      <table class="table is-fullwidth is-bordered" style="background-color: #0f172a; border: 2px solid #475569;">
        <thead>
          <tr style="background-color: #1e293b;">
            <th class="has-text-white has-text-weight-bold is-size-5">DNI</th>
            <th class="has-text-white has-text-weight-bold is-size-5">Docente</th>
            <th class="has-text-white has-text-weight-bold is-size-5">Escuela</th>
            <th class="has-text-white has-text-weight-bold is-size-5">Categoría</th>
            <th class="has-text-white has-text-weight-bold is-size-5">Modalidad</th>
            <th class="has-text-centered has-text-white has-text-weight-bold is-size-5" style="width: 180px;">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="docente in docentesFiltrados" :key="docente.id">
            <td class="has-text-white is-size-5 is-vcentered">{{ docente.dni || '---' }}</td>
            <td class="has-text-white has-text-weight-bold is-size-5 is-vcentered">{{ docente.nombre_completo }}</td>
            <td class="has-text-white is-size-5 is-vcentered">{{ docente.escuela }}</td>
            <td class="has-text-white is-size-5 is-vcentered">{{ docente.categoria }}</td>
            <td class="has-text-warning has-text-weight-bold is-size-5 is-vcentered">{{ docente.modalidad }}</td>
            <td class="has-text-centered is-vcentered">
               <div class="is-flex is-justify-content-center" style="gap: 8px;">
                 <button type="button" @click="abrirModalEdicion(docente)" class="button is-warning is-small has-text-weight-bold">
                   ✏️ Editar
                 </button>
                 <button type="button" @click="prepararEliminar(docente)" class="button is-danger is-small has-text-weight-bold" :class="{ 'is-loading': eliminando === docente.id }">
                   🗑️ Eliminar
                 </button>
               </div>
            </td>
          </tr>
          <tr v-if="docentesFiltrados.length === 0">
            <td colspan="6" class="has-text-centered has-text-white is-size-5">No se encontraron docentes con ese criterio de búsqueda.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- MODAL DE ALTA / EDICIÓN -->
    <div class="modal" :class="{ 'is-active': mostrarModal }">
      <div class="modal-background" @click="cerrarModal"></div>
      <div class="modal-card">
        <header class="modal-card-head" style="background-color: #1e293b; border-bottom: 1px solid #334155;">
          <p class="modal-card-title has-text-white has-text-weight-bold">
            {{ editandoId ? '✏️ Editar Docente Referente' : '➕ Alta de Docente Referente' }}
          </p>
          <button class="delete" aria-label="close" @click="cerrarModal"></button>
        </header>
        <section class="modal-card-body" style="background-color: #0f172a;">
          
          <form @submit.prevent="guardarDocente">
            <div class="field">
              <label class="label texto-blanco">DNI <span class="has-text-weight-light is-size-7 texto-claro">(Opcional)</span></label>
              <div class="control">
                <input type="text" v-model="formulario.dni" class="input input-oscuro has-text-weight-bold" placeholder="EJ: 30123456" />
              </div>
            </div>

            <div class="field">
              <label class="label texto-blanco">Apellidos y Nombres</label>
              <div class="control">
                <input type="text" v-model="formulario.nombre_completo" class="input input-oscuro has-text-weight-bold" placeholder="EJ: PÉREZ, JUAN" required />
              </div>
            </div>

            <div class="field">
              <label class="label texto-blanco">Escuela</label>
              <div class="control">
                <div class="select is-fullwidth">
                  <select v-model="formulario.escuela_id" required class="has-text-weight-bold input-oscuro">
                    <option disabled value="">Seleccione escuela...</option>
                    <option v-for="escuela in escuelasLista" :key="escuela.escuela_id" :value="escuela.escuela_id">
                      {{ escuela.escuela_nombre }}
                    </option>
                  </select>
                </div>
              </div>
            </div>

            <div class="field">
              <label class="label texto-blanco">Categoría</label>
              <div class="control">
                <div class="select is-fullwidth">
                  <select v-model="formulario.categoria_id" @change="onCategoriaChange" required class="has-text-weight-bold input-oscuro">
                    <option disabled value="">Seleccione categoría...</option>
                    <option v-for="cat in categoriasLista" :key="cat.categoria_id" :value="cat.categoria_id">
                      {{ cat.categoria_nombre }}
                    </option>
                  </select>
                </div>
              </div>
            </div>

            <div class="field mb-5">
              <label class="label texto-blanco">Modalidad</label>
              <div class="control">
                <div class="select is-fullwidth">
                  <select v-model="formulario.modalidad_id" :disabled="!formulario.categoria_id" required class="has-text-weight-bold input-oscuro">
                     <option disabled value="">{{ formulario.categoria_id ? 'Seleccione modalidad...' : 'Primero seleccione categoría' }}</option>
                    <option v-for="mod in modalidadesFiltradas" :key="mod.modalidad_id" :value="mod.modalidad_id">
                      {{ mod.modalidad_nombre }}
                    </option>
                  </select>
                </div>
              </div>
            </div>

            <div class="field is-grouped is-grouped-right mt-5">
              <div class="control">
                <button type="button" class="button is-dark has-text-weight-bold" @click="cerrarModal">Cancelar</button>
              </div>
              <div class="control">
                <button type="submit" class="button is-link has-text-weight-bold" :class="{ 'is-loading': guardando }" :disabled="!esFormularioValido">
                  {{ editandoId ? 'Actualizar Cambios' : 'Guardar Docente' }}
                </button>
              </div>
            </div>
          </form>
        </section>
      </div>
    </div>

    <!-- MODAL DE CONFIRMACIÓN DE ELIMINACIÓN -->
    <div class="modal" :class="{ 'is-active': modalEliminar.mostrar }">
      <div class="modal-background" @click="cancelarEliminar"></div>
      <div class="modal-card" style="max-width: 450px;">
        <header class="modal-card-head" style="background-color: #7f1d1d; border-bottom: 1px solid #991b1b;">
          <p class="modal-card-title has-text-white has-text-weight-bold">⚠️ Confirmar Eliminación</p>
          <button class="delete" aria-label="close" @click="cancelarEliminar" :disabled="eliminando !== null"></button>
        </header>
        <section class="modal-card-body has-text-centered" style="background-color: #0f172a;">
          <p class="texto-blanco is-size-5 mb-4">¿Está seguro que desea eliminar a este docente?</p>
          <p class="has-text-warning has-text-weight-bold is-size-4 mb-5">{{ modalEliminar.docenteNombre }}</p>
          
          <div class="columns is-mobile is-centered mt-4">
            <div class="column is-half">
              <button type="button" class="button is-dark is-fullwidth has-text-weight-bold is-medium" @click="cancelarEliminar" :disabled="eliminando !== null">
                Cancelar
              </button>
            </div>
            <div class="column is-half">
              <button type="button" class="button is-danger is-fullwidth has-text-weight-bold is-medium" @click="confirmarEliminar" :class="{ 'is-loading': eliminando !== null }">
                Sí, Eliminar
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>

  </div>
</template>

<script>
import api from '../services/api';

export default {
  name: 'DocentesView',
  data() {
    return {
      docentes: [],
      escuelasLista: [],
      modalidadesBrutas: [],
      filtroBusqueda: '', 
      mostrarModal: false,
      editandoId: null, 
      guardando: false,
      eliminando: null,
      notificacion: { texto: '', tipo: 'exito' },
      formulario: { dni: '', nombre_completo: '', escuela_id: '', categoria_id: '', modalidad_id: '' },
      modalEliminar: {
        mostrar: false,
        docenteId: null,
        docenteNombre: ''
      }
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
      if (!this.formulario.categoria_id) return [];
      return this.modalidadesBrutas.filter(
        m => m.categoria_id === Number(this.formulario.categoria_id)
      );
    },
    esFormularioValido() {
      return Boolean(
        this.formulario.nombre_completo.trim() !== '' &&
        this.formulario.escuela_id &&
        this.formulario.categoria_id &&
        this.formulario.modalidad_id
      );
    },
    // Filtro ampliado para que también busque por DNI si se desea
    docentesFiltrados() {
      if (!this.filtroBusqueda || !this.filtroBusqueda.trim()) {
        return this.docentes;
      }
      const busqueda = this.filtroBusqueda.toLowerCase().trim();
      return this.docentes.filter(d => {
        const dni = (d.dni || '').toLowerCase();
        const nombre = (d.nombre_completo || '').toLowerCase();
        const escuela = (d.escuela || '').toLowerCase();
        return dni.includes(busqueda) || nombre.includes(busqueda) || escuela.includes(busqueda);
      });
    }
  },
  mounted() {
    this.cargarDatosEstaticos();
    this.cargarDocentes();
  },
  methods: {
    async cargarDatosEstaticos() {
      try {
        const [resEscuelas, resModalidades] = await Promise.all([
          api.get('/acreditaciones/escuelas'),
          api.get('/equipos/categorias-modalidades')
        ]);
        if (resEscuelas.data?.exito) this.escuelasLista = resEscuelas.data.data;
        if (resModalidades.data?.exito) this.modalidadesBrutas = resModalidades.data.data;
      } catch (error) {
        console.error('Error al cargar catálogos:', error);
      }
    },
    async cargarDocentes() {
      try {
        const res = await api.get('/docentes');
        if (res.data?.exito) {
          this.docentes = res.data.data;
        }
      } catch (error) {
        console.error('Error al cargar docentes:', error);
        this.mostrarNotificacion('Error al obtener la lista de docentes.', 'error');
      }
    },
    onCategoriaChange() {
      this.formulario.modalidad_id = '';
    },
    abrirModalAlta() {
      this.editandoId = null;
      this.formulario = { dni: '', nombre_completo: '', escuela_id: '', categoria_id: '', modalidad_id: '' };
      this.mostrarModal = true;
    },
    abrirModalEdicion(docente) {
      this.editandoId = docente.id;
      this.formulario = {
        dni: docente.dni || '',
        nombre_completo: docente.nombre_completo,
        escuela_id: docente.escuela_id,
        categoria_id: docente.categoria_id,
        modalidad_id: docente.modalidad_id
      };
      this.mostrarModal = true;
    },
    cerrarModal() {
      this.mostrarModal = false;
      this.editandoId = null;
    },
    async guardarDocente() {
      if (!this.esFormularioValido) return;
      this.guardando = true;
      const payload = {
        dni: this.formulario.dni ? this.formulario.dni.trim() : null,
        nombre_completo: this.formulario.nombre_completo.trim(),
        escuela_id: this.formulario.escuela_id,
        categoria_id: this.formulario.categoria_id,
        modalidad_id: this.formulario.modalidad_id
      };
      try {
        let res;
        if (this.editandoId) {
          res = await api.put(`/docentes/${this.editandoId}`, payload);
        } else {
          res = await api.post('/docentes/nuevo', payload);
        }

        if (res.data?.exito) {
          const mensajeExito = this.editandoId ? 'Docente actualizado correctamente.' : 'Docente registrado correctamente.';
          this.mostrarNotificacion(mensajeExito, 'exito');
          this.cerrarModal();
          await this.cargarDocentes();
        }
      } catch (error) {
        console.error('Error guardando/actualizando docente:', error);
        this.mostrarNotificacion(error.response?.data?.error || 'Error al procesar la operación.', 'error');
      } finally {
        this.guardando = false;
      }
    },
    prepararEliminar(docente) {
      this.modalEliminar.docenteId = docente.id;
      this.modalEliminar.docenteNombre = docente.nombre_completo;
      this.modalEliminar.mostrar = true;
    },
    cancelarEliminar() {
      this.modalEliminar.mostrar = false;
      this.modalEliminar.docenteId = null;
      this.modalEliminar.docenteNombre = '';
    },
    async confirmarEliminar() {
      const id = this.modalEliminar.docenteId;
      this.eliminando = id;
      try {
        const res = await api.delete(`/docentes/${id}`);
        if (res.data?.exito) {
          this.mostrarNotificacion('Docente eliminado.', 'exito');
          await this.cargarDocentes();
        }
      } catch (error) {
        console.error('Error eliminando docente:', error);
        this.mostrarNotificacion('Error al eliminar el docente.', 'error');
      } finally {
        this.eliminando = null;
        this.cancelarEliminar();
      }
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