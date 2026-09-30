<template>
  <div class="container">
    
    <!-- ENCABEZADO DE SECCIÓN -->
    <div class="box caja-oscura p-5 mb-5">
      <div class="is-flex is-justify-content-space-between is-align-items-center flex-wrap">
        <div>
          <h3 class="title is-3 texto-blanco has-text-weight-bold mb-2">Monitoreo de Asistencia y Acreditados</h3>
          <p class="subtitle is-5 texto-claro mb-0">Listado general de solo lectura, diferenciando asistentes y pendientes en tiempo real.</p>
        </div>
        <div class="mt-3 mt-md-0">
          <button @click="cargarReporte" class="button is-dark is-medium has-text-weight-bold">
            🔄 Actualizar Listado
          </button>
        </div>
      </div>
    </div>

    <!-- NOTIFICACIONES VISUALES -->
    <div v-if="mensajeError" class="notification is-danger is-light mb-5">
      <button class="delete" @click="mensajeError = ''"></button>
      <span class="has-text-weight-semibold is-size-5">{{ mensajeError }}</span>
    </div>

    <!-- PESTAÑAS DE NAVEGACIÓN (Acreditados vs Pendientes) -->
    <div class="tabs is-boxed is-medium mb-4">
      <ul>
        <li :class="{ 'is-active': pestañaActiva === 'acreditados' }">
          <a @click="pestañaActiva = 'acreditados'" class="has-text-weight-bold">
            ✅ Ya Acreditados ({{ listaAcreditados.length }})
          </a>
        </li>
        <li :class="{ 'is-active': pestañaActiva === 'pendientes' }">
          <a @click="pestañaActiva = 'pendientes'" class="has-text-weight-bold">
            ⏳ Pendientes / Ausentes ({{ listaPendientes.length }})
          </a>
        </li>
      </ul>
    </div>

    <!-- CUADRO DE BÚSQUEDA Y FILTRADO -->
    <div class="box caja-oscura p-4 mb-5">
      <div class="field">
        <label class="label texto-claro is-size-6">Buscador Rápido (Filtra la pestaña actual por DNI, Alumno o Escuela)</label>
        <div class="control">
          <input 
            type="text" 
            v-model="filtroTexto" 
            class="input is-medium input-oscuro has-text-weight-bold" 
            placeholder="🔍 Ingrese DNI, Apellido del alumno o Escuela..." 
          />
        </div>
      </div>
    </div>

    <!-- CONTENEDOR DE LA TABLA -->
    <div class="box caja-oscura p-5">
      
      <p v-if="cargando" class="texto-claro is-size-5">Cargando registros de asistencia...</p>

      <div v-else-if="elementosFiltrados.length === 0" class="notification is-info is-light is-size-5">
        No se encontraron registros coincidentes en esta sección.
      </div>

      <div v-else class="table-container">
        <table class="table is-fullwidth is-hoverable tabla-custom">
          <thead>
            <tr>
              <th class="texto-blanco">DNI</th>
              <th class="texto-blanco">Apellidos y Nombres</th>
              <th class="texto-blanco">Escuela</th>
              <th class="texto-blanco">Modalidad</th>
              <th class="texto-blanco" v-if="pestañaActiva === 'acreditados'">Fecha y Hora de Ingreso</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in elementosFiltrados" :key="item.inscripto_id">
              
              <!-- DNI -->
              <td class="texto-claro has-text-weight-bold is-vcentered">
                {{ item.dni }}
              </td>

              <!-- Alumno -->
              <td class="texto-blanco has-text-weight-bold is-vcentered">
                {{ item.alumno }}
                <span v-if="item.es_suplente" class="tag is-warning is-small ml-2">Suplente</span>
              </td>

              <!-- Escuela -->
              <td class="texto-claro is-vcentered">
                {{ item.escuela }}
              </td>

              <!-- Modalidad -->
              <td class="is-vcentered">
                <span class="tag is-link is-medium has-text-weight-bold">
                  {{ item.modalidad }}
                </span>
              </td>

              <!-- Fecha y Hora (Solo visible en pestaña de acreditados) -->
              <td class="texto-gris is-vcentered" v-if="pestañaActiva === 'acreditados'">
                {{ formatearFecha(item.fecha_hora) }}
              </td>

            </tr>
          </tbody>
        </table>
      </div>

    </div>

  </div>
</template>

<script>
/**
 * Propósito: Proveer una vista de solo lectura para el monitoreo de asistencia, mostrando separados 
 *            por pestañas los alumnos ya acreditados y los pendientes (diferencia por DNI/ID).
 * A quién alimenta: Al componente principal App.vue.
 * Qué datos retorna: Peticiones HTTP vía Axios para obtener el reporte optimizado desde el backend.
 */
import api from '../services/api';

export default {
  name: 'Acreditaciones',
  data() {
    return {
      pestañaActiva: 'acreditados',
      cargando: false,
      listaAcreditados: [],
      listaPendientes: [],
      filtroTexto: '',
      mensajeError: ''
    };
  },
  computed: {
    /**
     * Propósito: Filtrar en tiempo real los elementos de la pestaña activa según el término de búsqueda.
     */
    elementosFiltrados() {
      const base = this.pestañaActiva === 'acreditados' ? this.listaAcreditados : this.listaPendientes;
      
      if (!this.filtroTexto || !this.filtroTexto.trim()) {
        return base;
      }

      const termino = this.filtroTexto.toLowerCase().trim();
      return base.filter(i => 
        i.dni.toLowerCase().includes(termino) ||
        i.alumno.toLowerCase().includes(termino) ||
        i.escuela.toLowerCase().includes(termino) ||
        i.modalidad.toLowerCase().includes(termino)
      );
    }
  },
  mounted() {
    this.cargarReporte();
  },
  methods: {
    /**
     * Propósito: Obtener el reporte separado de acreditados y pendientes desde el nuevo endpoint del backend.
     */
    async cargarReporte() {
      this.cargando = true;
      this.mensajeError = '';
      try {
        const respuesta = await api.get('/acreditaciones/reporte');
        if (respuesta.data && respuesta.data.exito) {
          this.listaAcreditados = respuesta.data.acreditados;
          this.listaPendientes = respuesta.data.pendientes;
        }
      } catch (error) {
        console.error('Error al cargar el reporte de asistencia:', error);
        this.mensajeError = 'No se pudo obtener el reporte de asistencia del servidor.';
      } finally {
        this.cargando = false;
      }
    },

    /**
     * Propósito: Formatear de manera legible la fecha y hora del registro de ingreso.
     */
    formatearFecha(fechaStr) {
      if (!fechaStr) return '-';
      const fecha = new Date(fechaStr);
      return fecha.toLocaleString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
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

/* Estilo para las pestañas de Bulma en modo oscuro */
.tabs.is-boxed li.is-active a {
  background-color: #1e293b !important;
  border-color: #475569 !important;
  color: #ffffff !important;
}
.tabs a {
  color: #94a3b8;
  background-color: #0f172a;
  border-color: #334155;
}
.tabs a:hover {
  color: #ffffff;
  background-color: #1e293b;
}
</style>