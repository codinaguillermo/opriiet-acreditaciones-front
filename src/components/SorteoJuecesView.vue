<template>
  <div class="box caja-oscura p-5">
    
    <!-- ENCABEZADO -->
    <div class="is-flex is-justify-content-space-between is-align-items-center mb-5 flex-wrap">
      <div>
        <h3 class="title is-3 texto-blanco has-text-weight-bold mb-2">Sorteo de Jurado (Robótica)</h3>
        <p class="subtitle is-5 texto-claro mb-0">Asignación aleatoria de 3 titulares y 2 suplentes.</p>
      </div>
      <div class="mt-3 mt-md-0 is-flex" style="gap: 10px;">
        <button type="button" @click="cargarJuradoActual" class="button is-dark is-medium has-text-weight-bold" :class="{ 'is-loading': cargando }">
          🔄 Ver Jurado Actual
        </button>
        <button type="button" @click="generarSorteo" class="button is-link is-medium has-text-weight-bold" :class="{ 'is-loading': sorteando }">
          🎲 Sortear Nuevos Jueces
        </button>
      </div>
    </div>

    <!-- NOTIFICACIÓN DE ESTADO -->
    <div v-if="notificacion.texto" :class="['notification', notificacion.tipo === 'exito' ? 'is-success' : 'is-danger', 'is-light', 'mb-5']">
      <button class="delete" @click="notificacion.texto = ''"></button>
      <span class="has-text-weight-semibold is-size-5">{{ notificacion.texto }}</span>
    </div>

    <!-- PANTALLA DE ESTADO VACÍO -->
    <div v-if="!juradoMostrado.length && !cargando && !sorteando" class="notification is-info is-light is-size-5 has-text-centered mt-5">
      No hay un jurado confirmado actualmente en la base de datos. Haga clic en "Sortear Nuevos Jueces" para comenzar.
    </div>

    <!-- TABLA DE JUECES (ACTUAL O PREVISUALIZACIÓN) -->
    <div v-if="juradoMostrado.length > 0" class="mt-5">
      <div class="is-flex is-justify-content-space-between is-align-items-center mb-3">
        <h4 class="title is-4 mb-0" :class="modoPrevisualizacion ? 'has-text-warning' : 'has-text-success'">
          {{ modoPrevisualizacion ? '⚠️ PREVISUALIZACIÓN DEL SORTEO (No guardado)' : '✅ JURADO OFICIAL CONFIRMADO' }}
        </h4>
        <button v-if="modoPrevisualizacion" @click="abrirModalConfirmacion" class="button is-success is-medium has-text-weight-bold">
          💾 Confirmar y Guardar Jurado
        </button>
      </div>

      <div class="table-container">
        <table class="table is-fullwidth is-bordered" style="background-color: #0f172a; border: 2px solid #475569;">
          <thead>
            <tr style="background-color: #1e293b;">
              <th class="has-text-white has-text-weight-bold is-size-5">Rol</th>
              <th class="has-text-white has-text-weight-bold is-size-5">Docente</th>
              <th class="has-text-white has-text-weight-bold is-size-5">Escuela</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="juez in juradoMostrado" :key="juez.id">
              <td class="has-text-centered is-vcentered">
                <span class="tag is-medium has-text-weight-bold" :class="juez.rol === 'titular' ? 'is-success' : 'is-warning'">
                  {{ juez.rol.toUpperCase() }}
                </span>
              </td>
              <td class="has-text-white has-text-weight-bold is-size-5 is-vcentered">{{ juez.nombre_completo }}</td>
              <td class="has-text-white is-size-5 is-vcentered">{{ juez.escuela || juez.escuela_id }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- MODAL DE CONFIRMACIÓN -->
    <div class="modal" :class="{ 'is-active': modalConfirmacion.mostrar }">
      <div class="modal-background" @click="cerrarModalConfirmacion"></div>
      <div class="modal-card" style="max-width: 500px;">
        <header class="modal-card-head" style="background-color: #065f46; border-bottom: 1px solid #047857;">
          <p class="modal-card-title has-text-white has-text-weight-bold">Confirmar Nuevo Jurado</p>
          <button class="delete" aria-label="close" @click="cerrarModalConfirmacion" :disabled="guardando"></button>
        </header>
        <section class="modal-card-body has-text-centered" style="background-color: #0f172a;">
          <p class="texto-blanco is-size-5 mb-4">¿Está seguro que desea establecer este nuevo jurado?</p>
          <p class="has-text-danger has-text-weight-bold is-size-6 mb-5">Atención: Esta acción reemplazará al jurado anterior en la base de datos.</p>
          
          <div class="columns is-mobile is-centered mt-4">
            <div class="column is-half">
              <button type="button" class="button is-dark is-fullwidth has-text-weight-bold is-medium" @click="cerrarModalConfirmacion" :disabled="guardando">
                Cancelar
              </button>
            </div>
            <div class="column is-half">
              <button type="button" class="button is-success is-fullwidth has-text-weight-bold is-medium" @click="guardarSorteo" :class="{ 'is-loading': guardando }">
                Sí, Confirmar
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
  name: 'SorteoJuecesView',
  data() {
    return {
      juradoMostrado: [],
      modoPrevisualizacion: false,
      cargando: false,
      sorteando: false,
      guardando: false,
      notificacion: { texto: '', tipo: 'exito' },
      modalConfirmacion: { mostrar: false }
    };
  },
  mounted() {
    this.cargarJuradoActual();
  },
  methods: {
    async cargarJuradoActual() {
      this.cargando = true;
      this.modoPrevisualizacion = false;
      try {
        const res = await api.get('/jueces/actual');
        if (res.data?.exito) {
          this.juradoMostrado = res.data.data;
        }
      } catch (error) {
        console.error('Error al cargar jurado actual:', error);
        this.mostrarNotificacion('Error al obtener el jurado vigente.', 'error');
      } finally {
        this.cargando = false;
      }
    },
    
    async generarSorteo() {
      this.sorteando = true;
      try {
        const res = await api.get('/jueces/sorteo/previsualizar');
        if (res.data?.exito) {
          this.juradoMostrado = res.data.data;
          this.modoPrevisualizacion = true;
          this.mostrarNotificacion('Sorteo generado. Revise la lista y confirme para guardar.', 'exito');
        }
      } catch (error) {
        console.error('Error al generar sorteo:', error);
        this.mostrarNotificacion(error.response?.data?.error || 'Error al generar el sorteo.', 'error');
      } finally {
        this.sorteando = false;
      }
    },

    abrirModalConfirmacion() {
      this.modalConfirmacion.mostrar = true;
    },

    cerrarModalConfirmacion() {
      this.modalConfirmacion.mostrar = false;
    },

    async guardarSorteo() {
      this.guardando = true;
      try {
        const payload = { jueces: this.juradoMostrado };
        const res = await api.post('/jueces/sorteo/confirmar', payload);
        
        if (res.data?.exito) {
          this.mostrarNotificacion('¡Jurado guardado exitosamente en la base de datos!', 'exito');
          this.cerrarModalConfirmacion();
          await this.cargarJuradoActual(); // Recargamos para salir del modo previsualización
        }
      } catch (error) {
        console.error('Error al guardar jurado:', error);
        this.mostrarNotificacion(error.response?.data?.error || 'Error al guardar el jurado.', 'error');
      } finally {
        this.guardando = false;
      }
    },

    mostrarNotificacion(texto, tipo) {
      this.notificacion = { texto, tipo };
      setTimeout(() => {
        if (this.notificacion.texto === texto) this.notificacion.texto = '';
      }, 6000);
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
</style>