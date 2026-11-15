<template>
  <div class="box caja-oscura p-6 sorteo-container">
    
    <!-- ENCABEZADO Y BOTÓN DE RETORNO -->
    <div class="is-flex is-justify-content-space-between is-align-items-center mb-5 flex-wrap">
      <button type="button" @click="$emit('volver')" class="button is-dark is-medium has-text-weight-bold">
        ⬅ Volver al Panel
      </button>
      <span class="tag is-link is-medium has-text-weight-bold p-3">Sorteo para premios OPRIIET 2026</span>
    </div>

    <div class="has-text-centered mb-4">
      <h2 class="title is-2 texto-blanco has-text-weight-bold">Sorteo en Directo</h2>
      <p class="subtitle is-5 texto-claro">
        Alumnos con asistencia confirmada (presentes): <strong class="numero-presentes-destacado">{{ participantes.length }}</strong>
      </p>
    </div>

    <!-- PANTALLA / VISOR DEL BOLILLERO -->
    <div class="box p-6 my-4 visor-bolillero" :class="{ 'animando-giro': girando }">
      <div v-if="!ganadorActual && !girando">
        <p class="is-size-1 mb-3">🎲</p>
        <p class="title is-1 texto-blanco has-text-weight-bold" style="letter-spacing: 3px;">LISTOS PARA SORTEAR</p>
        <p class="is-size-4 texto-claro">Presione el botón para buscar un ganador al azar</p>
      </div>

      <div v-else>
        <p class="is-size-3 has-text-warning has-text-weight-bold mb-2">
          {{ girando ? '🔄 SELECCIONANDO GANADOR...' : '🎉 ¡GANADOR SELECCIONADO! 🎉' }}
        </p>
        
        <!-- VISUALIZADOR DE DNI EN FORMATO RULETA -->
        <div class="dni-display my-4">
          <span class="has-text-weight-bold" :class="girando ? 'texto-aleatorio' : 'texto-ganador'">
            {{ dniVisualizador }}
          </span>
        </div>

        <!-- DATOS INSTITUCIONALES DEL GANADOR ÚNICO -->
        <div v-if="!girando && ganadorActual" class="mt-4 ganador-card p-5 animate-pop">
          <h3 class="is-size-2 has-text-weight-bold text-nombre mb-3">
            👤 {{ ganadorActual.nombre_completo }}
          </h3>
          <p class="is-size-3 has-text-weight-semibold texto-blanco mb-2">
            🏫 Escuela: <span class="has-text-info">{{ ganadorActual.escuela_nombre }}</span>
          </p>
          <p class="is-size-4 has-text-weight-medium texto-claro">
            📄 DNI: {{ ganadorActual.dni }}
          </p>
        </div>
      </div>
    </div>

    <!-- BOTONERA DE ACCIÓN INFERIOR -->
    <div class="field mt-5 has-text-centered">
      <button 
        type="button"
        class="button is-primary is-large has-text-weight-bold btn-sortear px-6 py-5" 
        @click="iniciarSorteo"
        :disabled="girando || participantes.length === 0"
        style="font-size: 1.8rem; height: auto;"
      >
        {{ girando ? '⏳ GIRANDO...' : (ganadorActual ? '🔄 ¡GENERAR NUEVO SORTEO!' : '🚀 ¡INICIAR SORTEO!') }}
      </button>
    </div>

    <p v-if="mensajeError" class="notification is-danger is-light mt-4 is-size-4 has-text-weight-bold">
      {{ mensajeError }}
    </p>

  </div>
</template>

<script>
/**
 * Propósito: Renderizar la ruleta/bolillero electrónico, consumir la API de presentes 
 *            y seleccionar un único alumno ganador por sorteo.
 * A quién alimenta: Al panel general de operaciones (App.vue).
 * Qué datos retorna: Visualización interactiva y gestión de estado local de ganadores.
 */
import api from '../services/api';

export default {
  name: 'SorteoPremiosView',
  emits: ['volver'],
  data() {
    return {
      participantes: [],
      girando: false,
      dniVisualizador: '00.000.000',
      ganadorActual: null,
      mensajeError: '',
      intervaloGiro: null
    };
  },
  mounted() {
    this.cargarParticipantesPresentes();
  },
  methods: {
    /**
     * Propósito: Consultar al backend los alumnos con asistencia confirmada (presente = 1).
     * A quién alimenta: Al array reactivo 'participantes'.
     */
    async cargarParticipantesPresentes() {
        try {
            const respuesta = await api.get('/acreditaciones/presentes-sorteo'); 
            console.log('Datos recibidos del backend:', respuesta.data);
            if (respuesta.data && respuesta.data.exito) {
            this.participantes = respuesta.data.data;
            }
        } catch (error) {
            console.error('Error al cargar participantes para sorteo:', error);
        }
    },
    /**
     * Propósito: Iniciar la animación de la ruleta/bolillero rotando DNIs aleatorios.
     * A quién alimenta: Al visor visual en pantalla.
     */
    iniciarSorteo() {
      if (this.participantes.length === 0) {
        this.mensajeError = 'No hay participantes con asistencia confirmada en este momento.';
        return;
      }

      this.mensajeError = '';
      this.ganadorActual = null;
      this.girando = true;

      let contador = 0;
      const totalPasos = 25; // Duración de la animación en pasos

      this.intervaloGiro = setInterval(() => {
        const randomIndex = Math.floor(Math.random() * this.participantes.length);
        this.dniVisualizador = this.formatearDNI(this.participantes[randomIndex].dni);
        contador++;

        if (contador >= totalPasos) {
          clearInterval(this.intervaloGiro);
          this.finalizarSorteo();
        }
      }, 90);
    },
    /**
     * Propósito: Seleccionar de forma definitiva un único ganador al finalizar la animación.
     * A quién alimenta: A las variables 'ganadorActual' y 'dniVisualizador'.
     */
    finalizarSorteo() {
      const ganadorIndex = Math.floor(Math.random() * this.participantes.length);
      const ganador = this.participantes[ganadorIndex];

      this.ganadorActual = ganador;
      this.dniVisualizador = this.formatearDNI(ganador.dni);
      this.girando = false;
    },
    /**
     * Propósito: Formatear el número de DNI con puntos para mejor lectura.
     * A quién alimenta: A las vistas del visor y tarjeta de ganador.
     */
    formatearDNI(dni) {
      if (!dni) return 'Sin DNI';
      let limpio = dni.toString().replace(/\D/g, '');
      if (limpio.length === 8) {
        return `${limpio.slice(0, 2)}.${limpio.slice(2, 5)}.${limpio.slice(5, 8)}`;
      } else if (limpio.length === 7) {
        return `${limpio.slice(0, 1)}.${limpio.slice(1, 4)}.${limpio.slice(4, 7)}`;
      }
      return dni;
    }
  }
};
</script>

<style scoped>
.sorteo-container {
  min-height: 80vh;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

/* Estilo para que el número de presentes resalta a distancia */
.numero-presentes-destacado {
  color: #4ade80 !important;
  font-size: 1.3rem;
  font-weight: 700;
}

.visor-bolillero {
  background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%);
  border: 4px solid #3b82f6;
  border-radius: 20px;
  box-shadow: 0 0 35px rgba(59, 130, 246, 0.5);
  min-height: 280px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.animando-giro {
  border-color: #fbbf24;
  box-shadow: 0 0 40px rgba(251, 191, 36, 0.7);
}

.dni-display {
  background-color: rgba(0, 0, 0, 0.6);
  padding: 12px 35px;
  border-radius: 12px;
  border: 2px solid #475569;
}

.texto-aleatorio {
  font-size: 3.5rem;
  color: #94a3b8;
  font-family: monospace;
}

.texto-ganador {
  font-size: 4rem;
  color: #4ade80;
  font-family: monospace;
  text-shadow: 0 0 20px rgba(74, 222, 128, 0.6);
}

.ganador-card {
  background-color: rgba(30, 41, 59, 0.95);
  border: 3px solid #4ade80;
  border-radius: 16px;
  width: 100%;
  max-width: 750px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.8);
}

.text-nombre {
  color: #f8fafc !important;
  font-size: 2.2rem !important;
}

.btn-sortear {
  background-color: #2563eb !important;
  transition: transform 0.2s;
}

.btn-sortear:hover {
  background-color: #1d4ed8 !important;
  transform: scale(1.05);
}

@keyframes popIn {
  0% { transform: scale(0.8); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}

.animate-pop {
  animation: popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
}
</style>