<template>
  <div class="container">
    
    <!-- ENCABEZADO DE SECCIÓN -->
    <div class="box caja-oscura p-5 mb-5">
      <div class="is-flex is-justify-content-space-between is-align-items-center flex-wrap">
        <div>
          <h3 class="title is-3 texto-blanco has-text-weight-bold mb-2">Gestión de Equipos y Categorías</h3>
          <p class="subtitle is-5 texto-claro mb-0">Formación, edición y listado general de equipos por modalidad.</p>
        </div>
        <div class="mt-3 mt-md-0">
          <button @click="cambiarVista('crear')" :class="['button', vistaActiva === 'crear' ? 'is-link' : 'is-dark', 'is-medium', 'has-text-weight-bold', 'mr-2']">
            ➕ Nuevo Equipo
          </button>
          <button @click="cambiarVista('listar')" :class="['button', vistaActiva === 'listar' ? 'is-link' : 'is-dark', 'is-medium', 'has-text-weight-bold']">
            📋 Ver Listado General
          </button>
        </div>
      </div>
    </div>

    <!-- NOTIFICACIONES VISUALES -->
    <div v-if="mensajeModal.texto" :class="['notification', mensajeModal.tipo === 'exito' ? 'is-success' : 'is-danger', 'is-light', 'mb-5']">
      <button class="delete" @click="mensajeModal.texto = ''"></button>
      <span class="has-text-weight-semibold is-size-5">{{ mensajeModal.texto }}</span>
    </div>

    <!-- ========================================== -->
    <!-- VISTA 1: CREAR / EDITAR EQUIPO             -->
    <!-- ========================================== -->
    <div v-if="vistaActiva === 'crear'" class="box caja-oscura p-5">
      <h4 class="title is-4 texto-blanco has-text-weight-bold mb-4">
        {{ modoEdicion ? 'Editar Equipo Existente' : 'Armado de Nuevo Equipo' }}
      </h4>

      <form @submit.prevent="guardarEquipo">
        <!-- Campos Principales -->
        <div class="columns is-multiline">
          
          <!-- Nombre del Equipo -->
          <div class="column is-12-mobile is-4-desktop">
            <div class="field">
              <label class="label texto-blanco is-size-5">Nombre del Equipo</label>
              <div class="control">
                <input 
                  type="text" 
                  v-model="formulario.nombre_equipo" 
                  class="input is-large input-oscuro has-text-weight-bold" 
                  placeholder="EJ: LOS PROGRAMADORES" 
                  required 
                />
              </div>
            </div>
          </div>

          <!-- Selector 1: Categoría -->
          <div class="column is-12-mobile is-4-desktop">
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

          <!-- Selector 2: Modalidad (Dependiente de Categoría) -->
          <div class="column is-12-mobile is-4-desktop">
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
                    <option disabled value="">{{ formulario.categoria_id ? 'Seleccione modalidad...' : 'Primero seleccione categoría' }}</option>
                    <option v-for="mod in modalidadesFiltradasPorCategoria(formulario.categoria_id)" :key="mod.modalidad_id" :value="mod.modalidad_id">
                      {{ mod.modalidad_nombre }}
                    </option>
                  </select>
                </div>
              </div>
            </div>
          </div>

        </div>

        <hr style="background-color: #334155; height: 2px;" class="my-5" />

        <!-- Buscador de Alumnos para Agregar -->
        <h5 class="title is-5 texto-blanco has-text-weight-bold mb-3">Buscar y Agregar Integrantes</h5>
        <div class="field has-addons mb-4">
          <div class="control is-expanded">
            <input 
              type="text" 
              v-model="terminoBusqueda" 
              @keyup.enter="buscarAlumnos"
              class="input is-medium input-oscuro has-text-weight-bold" 
              placeholder="INGRESE DNI O APELLIDO DEL ALUMNO..." 
            />
          </div>
          <div class="control">
            <button type="button" @click="buscarAlumnos" class="button is-link is-medium has-text-weight-bold">
              BUSCAR ALUMNO
            </button>
          </div>
        </div>

        <!-- Resultados de la Búsqueda (Pre-selección) -->
        <div v-if="terminoBusqueda && alumnosRaw.length === 0" class="notification is-warning is-light mb-5">
          <span class="has-text-weight-bold">Estudiante incorrecto o no inscripto en esta modalidad.</span> Verifique el DNI o apellido ingresado.
        </div>
        
        <!-- Resultados de la Búsqueda (Pre-selección) -->
        <div v-if="alumnosRaw.length > 0" class="box mb-5" style="background-color: #0f172a; border: 1px solid #475569;">
          <p class="texto-claro is-size-6 has-text-weight-semibold mb-3">Resultados coincidentes (Haga clic en agregar):</p>
          <div class="table-container">
            <table class="table is-fullwidth is-hoverable tabla-custom">
              <thead>
                <tr>
                  <th class="texto-blanco">DNI</th>
                  <th class="texto-blanco">Apellidos y Nombres</th>
                  <th class="texto-blanco">Escuela</th>
                  <th class="texto-blanco has-text-centered">Acción</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="alumno in alumnosUnicos" :key="alumno.dni">
                  <td class="texto-claro has-text-weight-bold">{{ alumno.dni }}</td>
                  <td class="texto-claro has-text-weight-bold">{{ alumno.alumno }}</td>
                  <td class="texto-claro">{{ alumno.escuela }}</td>
                  <td class="has-text-centered">
                    <button type="button" @click="agregarIntegrante(alumno)" class="button is-small is-success has-text-weight-bold">
                      ➕ AGREGAR AL EQUIPO
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- LISTA TEMPORAL DE INTEGRANTES SELECCIONADOS -->
        <h5 class="title is-5 texto-blanco has-text-weight-bold mt-5 mb-3">
          Integrantes del Equipo Seleccionados ({{ integrantesSeleccionados.length }})
        </h5>
        
        <div v-if="integrantesSeleccionados.length === 0" class="notification is-warning is-light is-size-6 mb-5">
          Aún no ha agregado integrantes al equipo. Utilice el buscador superior para sumarlos.
        </div>

        <div v-else class="table-container mb-5">
          <table class="table is-fullwidth is-hoverable tabla-custom">
            <thead>
              <tr>
                <th class="texto-blanco">DNI</th>
                <th class="texto-blanco">Apellidos y Nombres</th>
                <th class="texto-blanco">Escuela</th>
                <th class="texto-blanco has-text-centered">Acción</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(integrante, index) in integrantesSeleccionados" :key="integrante.inscripto_id">
                <td class="texto-claro has-text-weight-bold">{{ integrante.dni }}</td>
                <td class="texto-claro has-text-weight-bold">{{ integrante.alumno }}</td>
                <td class="texto-claro">{{ integrante.escuela }}</td>
                <td class="has-text-centered">
                  <button type="button" @click="quitarIntegrante(index)" class="button is-small is-danger has-text-weight-bold">
                    🗑️ QUITAR
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Botones de Acción Final -->
        <div class="field is-grouped mt-6">
          <div class="control">
            <button 
              type="submit" 
              class="button is-link is-large has-text-weight-bold" 
              :class="{ 'is-loading': guardando }"
              :disabled="!esFormularioValido"
            >
              {{ modoEdicion ? 'GUARDAR CAMBIOS' : 'CREAR EQUIPO' }}
            </button>
          </div>
          <div class="control">
            <button type="button" @click="cancelarEdicion" class="button is-dark is-large has-text-weight-bold">
              CANCELAR
            </button>
          </div>
        </div>
      </form>
    </div>

    <!-- ========================================== -->
    <!-- VISTA 2: LISTADO GENERAL CON FILTROS       -->
    <!-- ========================================== -->
    <div v-else class="box caja-oscura p-5">
      
      <div class="is-flex is-justify-content-space-between is-align-items-center flex-wrap mb-4">
        <h4 class="title is-4 texto-blanco has-text-weight-bold mb-0">Listado General de Equipos ({{ equiposFiltrados.length }})</h4>
      </div>

      <!-- Barra de Filtros Avanzada (Selectores y Buscador) -->
      <div class="box mb-5 p-4" style="background-color: #0f172a; border: 1px solid #334155;">
        <div class="columns is-multiline">
          
          <!-- Filtro por Categoría -->
          <div class="column is-12-mobile is-4-desktop">
            <div class="field">
              <label class="label texto-claro is-size-6">Filtrar por Categoría</label>
              <div class="control">
                <div class="select is-fullwidth">
                  <select 
                    v-model="filtroCategoriaId" 
                    @change="onFiltroCategoriaChange"
                    class="has-text-weight-bold" 
                    style="background-color: #1e293b; color: white; border: 2px solid #475569;"
                  >
                    <option value="">Todas las categorías</option>
                    <option v-for="cat in categoriasLista" :key="cat.categoria_id" :value="cat.categoria_id">
                      {{ cat.categoria_nombre }}
                    </option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <!-- Filtro por Modalidad (Dependiente de Categoría seleccionada) -->
          <div class="column is-12-mobile is-4-desktop">
            <div class="field">
              <label class="label texto-claro is-size-6">Filtrar por Modalidad</label>
              <div class="control">
                <div class="select is-fullwidth">
                  <select 
                    v-model="filtroModalidadId" 
                    class="has-text-weight-bold" 
                    style="background-color: #1e293b; color: white; border: 2px solid #475569;"
                  >
                    <option value="">Todas las modalidades</option>
                    <option v-for="mod in modalidadesFiltradasParaFiltro" :key="mod.modalidad_id" :value="mod.modalidad_id">
                      {{ mod.modalidad_nombre }}
                    </option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <!-- Buscador de Texto (Equipo / Escuela) -->
          <div class="column is-12-mobile is-4-desktop">
            <div class="field">
              <label class="label texto-claro is-size-6">Búsqueda rápida</label>
              <div class="control">
                <input 
                  type="text" 
                  v-model="filtroTexto" 
                  class="input input-oscuro has-text-weight-bold" 
                  placeholder="🔍 Equipo o Escuela..." 
                />
              </div>
            </div>
          </div>

        </div>
      </div>

      <p v-if="cargandoListado" class="texto-claro is-size-5">Cargando equipos...</p>

      <div v-else-if="equiposLista.length === 0" class="notification is-info is-light is-size-5">
        No hay equipos registrados en el sistema todavía. Utilice el botón "Nuevo Equipo" para comenzar.
      </div>

      <div v-else-if="equiposFiltrados.length === 0" class="notification is-warning is-light is-size-5">
        No se encontraron equipos que coincidan con los filtros seleccionados.
      </div>

      <div v-else class="table-container">
        <table class="table is-fullwidth is-hoverable tabla-custom">
          <thead>
            <tr>
              <th class="texto-blanco">Equipo</th>
              <th class="texto-blanco">Escuela</th>
              <th class="texto-blanco">Categoría / Modalidad</th>
              <th class="texto-blanco">Integrantes</th>
              <th class="texto-blanco has-text-centered">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="equipo in equiposFiltrados" :key="equipo.equipo_id">
              
              <!-- Nombre del Equipo -->
              <td class="texto-blanco has-text-weight-bold is-vcentered">
                {{ equipo.nombre_equipo }}
              </td>

              <!-- Escuela -->
              <td class="texto-claro is-vcentered">
                {{ equipo.escuela }}
              </td>

              <!-- Categoría y Modalidad -->
              <td class="is-vcentered">
                <span class="tag is-link is-medium has-text-weight-bold">
                  {{ equipo.categoria }} ➔ {{ equipo.modalidad }}
                </span>
              </td>

              <!-- Integrantes (Compactos con opción de desplegar) -->
              <td class="is-vcentered">
                <div class="is-flex is-align-items-center">
                  <span class="tag is-dark is-medium mr-2 has-text-weight-bold" style="background-color: #1e293b; color: #f1f5f9; border: 1px solid #475569;">
                    👥 {{ equipo.integrantes.length }} integrante(s)
                  </span>
                  <button @click="toggleDetalleEquipo(equipo.equipo_id)" class="button is-small is-dark has-text-weight-bold">
                    {{ equipoExpandidoId === equipo.equipo_id ? '▲ Ocultar' : '▼ Ver' }}
                  </button>
                </div>

                <!-- Panel desplegable individual con letras grandes y de alto contraste -->
                <div v-if="equipoExpandidoId === equipo.equipo_id" class="mt-2 p-3" style="background-color: #090d16; border: 2px solid #3b82f6; border-radius: 8px;">
                  <p v-for="ing in equipo.integrantes" :key="ing.inscripto_id" class="is-size-5 mb-2 has-text-weight-bold" style="color: #fbbf24;">
                    👤 <span style="color: #ffffff;">{{ ing.alumno }}</span> <span style="color: #94a3b8; font-size: 0.9rem;">(DNI: {{ ing.dni }})</span>
                  </p>
                </div>
              </td>

              <!-- Acciones (Edición y Eliminación Inline) -->
              <td class="has-text-centered is-vcentered">
                <div v-if="equipoAEliminarId === equipo.equipo_id">
                  <span class="tag is-danger is-small has-text-weight-bold mb-1">¿Eliminar?</span><br/>
                  <button @click="ejecutarEliminacionEquipo(equipo.equipo_id)" class="button is-danger is-small has-text-weight-bold mr-1">Sí</button>
                  <button @click="equipoAEliminarId = null" class="button is-dark is-small has-text-weight-bold">No</button>
                </div>
                <div v-else>
                  <button @click="cargarEquipoParaEditar(equipo)" class="button is-warning is-small has-text-weight-bold mr-1" title="Editar equipo">
                    ✏️
                  </button>
                  <button @click="equipoAEliminarId = equipo.equipo_id" class="button is-danger is-small has-text-weight-bold" title="Eliminar equipo">
                    🗑️
                  </button>
                </div>
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
 * Propósito: Proveer la interfaz completa para la gestión, armado, edición y listado general compacto de equipos,
 *            con selectores avanzados de filtrado por categoría y modalidad, buscador y panel desplegable de alto contraste.
 * A quién alimenta: Al componente principal App.vue cuando se selecciona el módulo de equipos.
 * Qué datos retorna: Peticiones HTTP vía Axios para gestionar equipos y estados reactivos validados.
 */
import api from '../services/api';

export default {
  name: 'Equipos',
  data() {
    return {
      vistaActiva: 'listar',
      modoEdicion: false,
      equipoIdEditando: null,
      cargandoListado: false,
      guardando: false,
      
      formulario: {
        nombre_equipo: '',
        categoria_id: '',
        modalidad_id: ''
      },
      modalidadesLista: [],
      equiposLista: [],

      terminoBusqueda: '',
      alumnosRaw: [],
      integrantesSeleccionados: [],
      
      // Controles de filtrado y visualización del listado
      filtroTexto: '',
      filtroCategoriaId: '',
      filtroModalidadId: '',
      equipoExpandidoId: null,
      equipoAEliminarId: null,

      mensajeModal: {
        texto: '',
        tipo: 'exito'
      }
    };
  },
  computed: {
    /**
     * Propósito: Extraer la lista única de categorías disponibles a partir del listado bruto de modalidades.
     */
    categoriasLista() {
      const mapa = new Map();
      for (const item of this.modalidadesLista) {
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
     * Propósito: Filtrar las modalidades disponibles para el panel de filtros según la categoría seleccionada en el filtro.
     */
    modalidadesFiltradasParaFiltro() {
      if (!this.filtroCategoriaId) return this.modalidadesLista;
      return this.modalidadesLista.filter(m => m.categoria_id === Number(this.filtroCategoriaId));
    },

    /**
     * Propósito: Agrupar los resultados de la búsqueda de alumnos por DNI único para evitar duplicados en la tabla.
     */
    alumnosUnicos() {
      const mapa = new Map();
      for (const item of this.alumnosRaw) {
        if (!mapa.has(item.dni)) {
          mapa.set(item.dni, {
            inscripto_id: item.inscripto_id,
            dni: item.dni,
            alumno: item.alumno,
            escuela: item.escuela
          });
        }
      }
      return Array.from(mapa.values());
    },

    /**
     * Propósito: Filtrar el listado general de equipos combinando selectores de categoría, modalidad y texto libre.
     */
    equiposFiltrados() {
      return this.equiposLista.filter(eq => {
        // Filtro por Categoría
        if (this.filtroCategoriaId && eq.categoria_id !== Number(this.filtroCategoriaId)) {
          return false;
        }
        // Filtro por Modalidad
        if (this.filtroModalidadId && eq.modalidad_id !== Number(this.filtroModalidadId)) {
          return false;
        }
        // Filtro por Texto libre (Equipo o Escuela)
        if (this.filtroTexto && this.filtroTexto.trim() !== '') {
          const termino = this.filtroTexto.toLowerCase().trim();
          const coincideTexto = eq.nombre_equipo.toLowerCase().includes(termino) ||
                                eq.escuela.toLowerCase().includes(termino);
          if (!coincideTexto) return false;
        }
        return true;
      });
    },

    /**
     * Propósito: Validar de manera estricta que todos los campos obligatorios del equipo estén completos.
     */
    esFormularioValido() {
      const nombreValido = this.formulario.nombre_equipo && this.formulario.nombre_equipo.trim() !== '';
      const categoriaValida = this.formulario.categoria_id !== '' && this.formulario.categoria_id !== null;
      const modalidadValida = this.formulario.modalidad_id !== '' && this.formulario.modalidad_id !== null;
      const tieneIntegrantes = this.integrantesSeleccionados && this.integrantesSeleccionados.length > 0;

      return Boolean(nombreValido && categoriaValida && modalidadValida && tieneIntegrantes);
    }
  },
  mounted() {
    this.obtenerModalidades();
    this.obtenerEquipos();
  },
  methods: {
    /**
     * Propósito: Filtrar las modalidades en el formulario principal de alta/edición según la categoría seleccionada.
     */
    modalidadesFiltradasPorCategoria(categoriaId) {
      if (!categoriaId) return [];
      return this.modalidadesLista.filter(m => m.categoria_id === Number(categoriaId));
    },

    /**
     * Propósito: Controlar la visualización desplegable de los integrantes de un equipo específico en la tabla.
     */
    toggleDetalleEquipo(equipoId) {
      if (this.equipoExpandidoId === equipoId) {
        this.equipoExpandidoId = null;
      } else {
        this.equipoExpandidoId = equipoId;
      }
    },

    /**
     * Propósito: Manejar el evento de cambio en el selector de categoría del formulario principal.
     */
    onCategoriaChange() {
      this.formulario.modalidad_id = '';
    },

    /**
     * Propósito: Manejar el cambio en el selector de categoría de los filtros generales, reseteando la modalidad seleccionada en el filtro.
     */
    onFiltroCategoriaChange() {
      this.filtroModalidadId = '';
    },

    /**
     * Propósito: Alternar entre la vista de creación/edición y el listado general de equipos.
     */
    cambiarVista(vista) {
      this.vistaActiva = vista;
      if (vista === 'listar') {
        this.obtenerEquipos();
        this.resetearFormulario();
      }
    },

    /**
     * Propósito: Obtener el listado de categorías y modalidades desde el backend para los selectores.
     */
    async obtenerModalidades() {
      try {
        const respuesta = await api.get('/equipos/categorias-modalidades');
        if (respuesta.data && respuesta.data.exito) {
          this.modalidadesLista = respuesta.data.data;
        }
      } catch (error) {
        console.error('Error al obtener modalidades:', error);
      }
    },

    /**
     * Propósito: Obtener el listado completo de equipos registrados con sus escuelas y alumnos integrantes.
     */
    async obtenerEquipos() {
      this.cargandoListado = true;
      try {
        const respuesta = await api.get('/equipos');
        if (respuesta.data && respuesta.data.exito) {
          this.equiposLista = respuesta.data.data;
        }
      } catch (error) {
        console.error('Error al obtener equipos:', error);
        this.mostrarMensaje('Error al cargar el listado de equipos.', 'error');
      } finally {
        this.cargandoListado = false;
      }
    },

    /**
     * Propósito: Buscar inscriptos en la base de datos filtrados estrictamente por la modalidad seleccionada y el término de búsqueda.
     */
    async buscarAlumnos() {
      // Regla de negocio: Obligatorio seleccionar modalidad antes de buscar
      if (!this.formulario.modalidad_id) {
        this.mostrarMensaje('Debe seleccionar una categoría y una modalidad antes de buscar integrantes.', 'error');
        return;
      }

      if (!this.terminoBusqueda || !this.terminoBusqueda.trim()) {
        this.alumnosRaw = [];
        return;
      }

      try {
        const respuesta = await api.get(`/equipos/buscar-alumnos`, {
          params: {
            modalidad_id: this.formulario.modalidad_id,
            termino: this.terminoBusqueda.trim()
          }
        });

        if (respuesta.data && respuesta.data.exito) {
          this.alumnosRaw = respuesta.data.data;
        }
      } catch (error) {
        console.error('Error al buscar alumnos por modalidad:', error);
        this.alumnosRaw = [];
        const errorMsg = error.response?.data?.error || 'No se pudieron buscar los alumnos.';
        this.mostrarMensaje(errorMsg, 'error');
      }
    },

    /**
     * Propósito: Agregar un alumno seleccionado a la lista temporal de integrantes validando que no esté duplicado.
     */
    agregarIntegrante(alumno) {
      const existe = this.integrantesSeleccionados.some(i => i.inscripto_id === alumno.inscripto_id);
      if (existe) {
        this.mostrarMensaje('Este alumno ya fue agregado al equipo.', 'error');
        return;
      }
      this.integrantesSeleccionados.push(alumno);
      this.mostrarMensaje(`Alumno ${alumno.alumno} agregado correctamente.`, 'exito');
    },

    /**
     * Propósito: Quitar un integrante de la lista temporal de formación del equipo.
     */
    quitarIntegrante(index) {
      this.integrantesSeleccionados.splice(index, 1);
    },

    /**
     * Propósito: Enviar los datos validados del formulario al backend para su almacenamiento.
     */
    async guardarEquipo() {
      if (!this.esFormularioValido) {
        this.mostrarMensaje('Complete todos los campos obligatorios y agregue al menos un integrante.', 'error');
        return;
      }

      this.guardando = true;
      const payload = {
        nombre_equipo: this.formulario.nombre_equipo.trim(),
        modalidad_id: this.formulario.modalidad_id,
        integrantes: this.integrantesSeleccionados.map(i => i.inscripto_id)
      };

      try {
        if (this.modoEdicion) {
          await api.put(`/equipos/${this.equipoIdEditando}`, payload);
          this.mostrarMensaje('Equipo actualizado correctamente.', 'exito');
        } else {
          await api.post('/equipos', payload);
          this.mostrarMensaje('Equipo creado exitosamente.', 'exito');
        }
        this.resetearFormulario();
        this.cambiarVista('listar');
      } catch (error) {
        console.error('Error al guardar equipo:', error);
        const errorMsg = error.response?.data?.error || 'No se pudo guardar el equipo.';
        this.mostrarMensaje(errorMsg, 'error');
      } finally {
        this.guardando = false;
      }
    },

    /**
     * Propósito: Cargar los datos de un equipo existente en el formulario para su edición.
     */
    cargarEquipoParaEditar(equipo) {
      this.modoEdicion = true;
      this.equipoIdEditando = equipo.equipo_id;
      this.formulario.nombre_equipo = equipo.nombre_equipo;
      this.formulario.modalidad_id = equipo.modalidad_id;
      
      const modalidadEncontrada = this.modalidadesLista.find(m => m.modalidad_id === equipo.modalidad_id);
      if (modalidadEncontrada) {
        this.formulario.categoria_id = modalidadEncontrada.categoria_id;
      }
      
      this.integrantesSeleccionados = equipo.integrantes.map(ing => ({
        inscripto_id: ing.inscripto_id,
        dni: ing.dni,
        alumno: ing.alumno,
        escuela: equipo.escuela
      }));

      this.vistaActiva = 'crear';
    },

    /**
     * Propósito: Ejecutar la eliminación física de un equipo en el backend tras la confirmación inline.
     */
    async ejecutarEliminacionEquipo(equipoId) {
      try {
        await api.delete(`/equipos/${equipoId}`);
        this.mostrarMensaje('Equipo eliminado correctamente.', 'exito');
        this.equipoIdEditando = null;
        this.equipoAEliminarId = null;
        this.obtenerEquipos();
      } catch (error) {
        console.error('Error al eliminar equipo:', error);
        this.mostrarMensaje('No se pudo eliminar el equipo.', 'error');
      }
    },

    /**
     * Propósito: Cancelar el proceso de creación o edición, retornando al listado general.
     */
    cancelarEdicion() {
      this.resetearFormulario();
      this.cambiarVista('listar');
    },

    /**
     * Propósito: Restablecer todos los campos del formulario y estados reactivos.
     */
    resetearFormulario() {
      this.formulario.nombre_equipo = '';
      this.formulario.categoria_id = '';
      this.formulario.modalidad_id = '';
      this.terminoBusqueda = '';
      this.alumnosRaw = [];
      this.integrantesSeleccionados = [];
      this.modoEdicion = false;
      this.equipoIdEditando = null;
      this.equipoAEliminarId = null;
      this.filtroTexto = '';
      this.filtroCategoriaId = '';
      this.filtroModalidadId = '';
      this.equipoExpandidoId = null;
    },

    /**
     * Propósito: Mostrar notificaciones visuales temporales de éxito o error en la interfaz.
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