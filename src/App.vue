<template>
  <div class="contenedor-principal">
    
    <!-- ========================================== -->
    <!-- PANTALLA 1: ACCESO (AUTENTICACIÓN)         -->
    <!-- ========================================== -->
    <section v-if="vistaActual === 'login'" class="hero is-fullheight">
      <div class="hero-body">
        <div class="container">
          <div class="columns is-centered">
            <div class="column is-11-mobile is-8-tablet is-6-desktop">
              
              <div class="box caja-oscura has-text-centered p-6">
                <figure class="image mb-5 is-flex is-justify-content-center">
                  <img src="./assets/logoOPRIIET.jpg" alt="Logo OPRIIET 8va Edición" class="logo-img-grande" />
                </figure>
                
                <h1 class="title is-2 texto-blanco has-text-weight-bold mb-2">Sistema de Acreditaciones</h1>
                <p class="subtitle is-4 texto-claro has-text-weight-semibold mb-6">EET N° 24 «Simón de Iriondo»</p>

                <form @submit.prevent="validarAcceso">
                  <div class="field mb-5">
                    <label class="label text-left texto-blanco is-size-4">Clave de Acceso al Sistema</label>
                    <div class="control">
                      <input 
                        type="password" 
                        v-model="claveIngresada" 
                        class="input is-large input-oscuro has-text-weight-bold has-text-centered" 
                        placeholder="INGRESE LA CLAVE..." 
                        required 
                      />
                    </div>
                  </div>

                  <p v-if="errorCredenciales" class="help is-danger is-size-5 mb-4 has-text-weight-bold">
                    CLAVE INCORRECTA. INTENTE NUEVAMENTE.
                  </p>

                  <div class="field mt-6">
                    <button type="submit" class="button is-link is-large is-fullwidth btn-ingreso is-size-4" :class="{ 'is-loading': cargando }">
                      INGRESAR AL SISTEMA
                    </button>
                  </div>
                </form>
              </div>

            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ========================================== -->
    <!-- PANTALLA 2: DASHBOARD Y CONTENEDOR MÓDULOS -->
    <!-- ========================================== -->
    <div v-else class="dashboard-contenedor">
      
      <!-- Barra de Navegación Superior -->
      <nav class="navbar nav-oscura px-4 py-3" role="navigation" aria-label="main navigation">
        <div class="navbar-brand">
          <a class="navbar-item is-flex is-align-items-center" @click="volverAlMenu">
            <span class="is-size-4 has-text-weight-bold texto-blanco">OPRIIET - Panel de Control</span>
          </a>
        </div>
        <div class="navbar-end">
          <div class="navbar-item">
            <button @click="cerrarSesion" class="button is-danger is-medium has-text-weight-bold">
              Cerrar Sesión
            </button>
          </div>
        </div>
      </nav>

      <!-- Panel de Opciones y Vistas Dinámicas -->
      <section class="section is-medium">
        <div class="container">
          
          <!-- Encabezado con Logo Centrado (Solo visible en el menú principal) -->
          <div class="mb-6 has-text-centered" v-if="moduloSeleccionado === null">
            <figure class="image mb-4 is-flex is-justify-content-center">
              <img src="./assets/logoOPRIIET.jpg" alt="Logo OPRIIET" class="logo-dashboard-header" />
            </figure>
            <h2 class="title is-2 texto-blanco has-text-weight-bold">Panel General de Operaciones</h2>
            <p class="subtitle is-4 texto-claro has-text-weight-medium mt-3">Seleccione una opción para comenzar a operar</p>
          </div>

          <!-- Cuadrícula de Tarjetas del Dashboard -->
          <div class="columns is-multiline" v-if="moduloSeleccionado === null">
            
            <div class="column is-12-mobile is-6-tablet is-6-desktop">
              <div class="card tarjeta-opcion h-100 p-4" @click="abrirModulo('acreditar')">
                <div class="card-content has-text-centered py-6">
                  <p class="mb-4" style="font-size: 4rem;">✅</p>
                  <p class="title is-3 texto-blanco has-text-weight-bold">Acreditar Inscriptos</p>
                  <p class="subtitle is-5 texto-claro mt-3">Puesto de control de entrada y verificación de papeles.</p>
                </div>
              </div>
            </div>

            <div class="column is-12-mobile is-6-tablet is-6-desktop">
              <div class="card tarjeta-opcion h-100 p-4" @click="abrirModulo('asistencia')">
                <div class="card-content has-text-centered py-6">
                  <p class="mb-4" style="font-size: 4rem;">📊</p>
                  <p class="title is-3 texto-blanco has-text-weight-bold">Asistencia en Tiempo Real</p>
                  <p class="subtitle is-5 texto-claro mt-3">Listado general de acreditados y pendientes (pestañas).</p>
                </div>
              </div>
            </div>

            <div class="column is-12-mobile is-12-tablet is-4-desktop">
              <div class="card tarjeta-opcion h-100 p-4" @click="abrirModulo('equipos')">
                <div class="card-content has-text-centered py-5">
                  <p class="mb-3" style="font-size: 3rem;">👥</p>
                  <p class="title is-4 texto-blanco has-text-weight-bold">Equipos y Categorías</p>
                  <p class="subtitle is-5 texto-claro mt-2">Listado de participantes.</p>
                </div>
              </div>
            </div>

            <div class="column is-12-mobile is-6-tablet is-4-desktop">
              <div class="card tarjeta-opcion h-100 p-4" @click="abrirModulo('calificar')">
                <div class="card-content has-text-centered py-5">
                  <p class="mb-3" style="font-size: 3rem;">⚖</p>
                  <p class="title is-4 texto-blanco has-text-weight-bold">Calificación (Jueces)</p>
                  <p class="subtitle is-5 texto-claro mt-2">Evaluación de proyectos.</p>
                </div>
              </div>
            </div>

            <div class="column is-12-mobile is-6-tablet is-4-desktop">
              <div class="card tarjeta-opcion h-100 p-4" @click="abrirModulo('resultados')">
                <div class="card-content has-text-centered py-5">
                  <p class="mb-3" style="font-size: 3rem;">🏆</p>
                  <p class="title is-4 texto-blanco has-text-weight-bold">Resultados y Podio</p>
                  <p class="subtitle is-5 texto-claro mt-2">Orden de mérito final.</p>
                </div>
              </div>
            </div>

          </div>

          <!-- Contenedor Dinámico de Módulos Externos -->
          <div v-else>
            <button class="button is-medium is-light mb-5 has-text-weight-bold" @click="volverAlMenu">
              ← VOLVER AL PANEL
            </button>

            <!-- Carga modular correcta según el botón seleccionado -->
            <Acreditar v-if="moduloSeleccionado === 'acreditar'" />
            <Acreditaciones v-else-if="moduloSeleccionado === 'asistencia'" />
            <Equipos v-else-if="moduloSeleccionado === 'equipos'" />

            <!-- Placeholders temporales para los próximos componentes -->
            <div v-else class="box caja-oscura p-6">
              <h3 class="title is-2 texto-blanco has-text-weight-bold">Módulo: {{ moduloSeleccionado }}</h3>
              <p class="subtitle is-4 texto-claro">Componente en proceso de desarrollo modular.</p>
            </div>
          </div>

        </div>
      </section>

    </div>

  </div>
</template>

<script>
/**
 * Propósito: Actuar como componente raíz (Shell) de la aplicación, controlando la autenticación segura 
 *            vía backend y el enrutamiento dinámico hacia los componentes desacoplados del sistema.
 * A quién alimenta: Al DOM principal de la aplicación en el navegador del usuario.
 * Qué datos retorna: Estado reactivo de sesión y selector de submódulos.
 */
import Acreditar from './components/Acreditar.vue';
import Acreditaciones from './components/Acreditaciones.vue';
import Equipos from './components/Equipos.vue';
import api from './services/api';

export default {
  name: 'App',
  components: {
    Acreditar,
    Acreditaciones,
    Equipos
  },
  data() {
    return {
      vistaActual: 'login',
      claveIngresada: '',
      errorCredenciales: false,
      cargando: false,
      moduloSeleccionado: null
    };
  },
  methods: {
    /**
     * Propósito: Enviar la clave ingresada de forma segura al backend para su validación, 
     *            evitando exponer credenciales sensibles en el frontend.
     * A quién alimenta: Al formulario de autenticación en la vista de login.
     * Qué datos retorna: Modifica el estado reactivo vistaActual a 'dashboard' o activa errorCredenciales.
     */
    async validarAcceso() {
      if (!this.claveIngresada || !this.claveIngresada.trim()) {
        return;
      }
      this.cargando = true;
      this.errorCredenciales = false;
      try {
        const respuesta = await api.post('/acreditaciones/login', {
          clave: this.claveIngresada.trim()
        });

        if (respuesta.data && respuesta.data.exito) {
          this.vistaActual = 'dashboard';
          this.claveIngresada = '';
        } else {
          this.errorCredenciales = true;
        }
      } catch (error) {
        console.error('Error de autenticación:', error);
        this.errorCredenciales = true;
      } finally {
        this.cargando = false;
      }
    },

    /**
     * Propósito: Destruir la sesión activa del usuario y regresar a la pantalla inicial de acceso.
     * A quién alimenta: Al botón "Cerrar Sesión" ubicado en la barra de navegación superior.
     * Qué datos retorna: Restablece vistaActual a 'login' y limpia el módulo activo.
     */
    cerrarSesion() {
      this.vistaActual = 'login';
      this.moduloSeleccionado = null;
      this.claveIngresada = '';
      this.errorCredenciales = false;
    },

    /**
     * Propósito: Definir qué submódulo funcional debe renderizarse dinámicamente en el área de trabajo.
     * A quién alimenta: Al panel general y tarjetas de selección del dashboard.
     * Qué datos retorna: Actualiza la variable reactiva moduloSeleccionado con el identificador del módulo.
     * 
     * @param {string} modulo - Identificador técnico del módulo seleccionado.
     */
    abrirModulo(modulo) {
      this.moduloSeleccionado = modulo;
    },

    /**
     * Propósito: Ocultar el submódulo activo y retornar a la visualización de la cuadrícula general de opciones.
     * A quién alimenta: Al botón "VOLVER AL PANEL" dentro de los submódulos.
     * Qué datos retorna: Establece la variable moduloSeleccionado en null.
     */
    volverAlMenu() {
      this.moduloSeleccionado = null;
    }
  }
};
</script>

<style>
/* Estilos globales orientados a alto contraste y visibilidad en entornos iluminados */
html, body {
  background-color: #121b29;
  margin: 0;
  padding: 0;
  min-height: 100vh;
}

.contenedor-principal {
  background-color: #121b29;
  min-height: 100vh;
}

.texto-blanco { color: #ffffff !important; }
.texto-claro { color: #f1f5f9 !important; }

.caja-oscura {
  background-color: #1e293b !important;
  border: 2px solid #334155;
  border-radius: 16px;
  box-shadow: 0 15px 30px rgba(0,0,0,0.6);
}

.input-oscuro {
  background-color: #0f172a !important;
  border: 2px solid #475569 !important;
  color: #ffffff !important;
  letter-spacing: 1px;
}

.input-oscuro::placeholder { 
  color: #94a3b8 !important; 
  opacity: 1 !important;
  font-weight: 600;
}

.input-oscuro:focus { 
  border-color: #3b82f6 !important; 
  box-shadow: 0 0 0 0.25rem rgba(59, 130, 246, 0.4);
}

.btn-ingreso {
  background-color: #2563eb !important;
  letter-spacing: 2px;
  border: none;
}
.btn-ingreso:hover { 
  background-color: #1d4ed8 !important; 
  transform: scale(1.02);
  transition: transform 0.2s;
}

.nav-oscura,
.nav-oscura .navbar-brand,
.nav-oscura .navbar-item {
  background-color: #1e293b !important;
  color: #ffffff !important;
}

.nav-oscura {
  border-bottom: 2px solid #334155;
}

.tarjeta-opcion {
  background-color: #1e293b !important;
  border: 2px solid #475569;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}
.tarjeta-opcion:hover {
  transform: translateY(-6px);
  border-color: #60a5fa;
  box-shadow: 0 10px 25px rgba(96, 165, 250, 0.3);
  background-color: #233147 !important;
}

.logo-img-grande { 
  max-width: 320px; 
  border-radius: 8px; 
}

.logo-dashboard-header {
  max-width: 280px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.4);
}
</style>