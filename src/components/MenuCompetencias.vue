<template>
  <div class="box caja-oscura p-6">
    <h2 class="title is-2 texto-blanco has-text-weight-bold mb-2">Selección de Competencias</h2>
    <p class="subtitle is-4 texto-claro mb-6">Elija el área y modalidad correspondiente para operar.</p>

    <!-- ÁREA 1: ROBÓTICA -->
    <div class="mb-6">
      <h3 class="title is-4 has-text-info has-text-weight-bold mb-4">🤖 Robótica</h3>
      <div class="columns is-multiline">
        <div class="column is-12-tablet is-4-desktop">
          <div class="card tarjeta-competencia p-4" @click="seleccionar('Sumo Inicial', 'sumo')">
            <div class="card-content has-text-centered py-4">
              <p class="title is-4 texto-blanco has-text-weight-bold">Sumo Inicial</p>
              <p class="subtitle is-6 texto-claro mt-2">Doble eliminación (Debutantes)</p>
            </div>
          </div>
        </div>
        <div class="column is-12-tablet is-4-desktop">
          <div class="card tarjeta-competencia p-4" @click="seleccionar('Sumo Avanzado', 'sumo')">
            <div class="card-content has-text-centered py-4">
              <p class="title is-4 texto-blanco has-text-weight-bold">Sumo Avanzado</p>
              <p class="subtitle is-6 texto-claro mt-2">Doble eliminación (Libre)</p>
            </div>
          </div>
        </div>
        <div class="column is-12-tablet is-4-desktop">
          <div class="card tarjeta-competencia p-4" @click="seleccionar('Competencia de Rescate', 'rescate')">
            <div class="card-content has-text-centered py-4">
              <p class="title is-4 texto-blanco has-text-weight-bold">Competencia de Rescate</p>
              <p class="subtitle is-6 texto-claro mt-2">Línea y evacuación</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ÁREA 2: INFORMÁTICA -->
    <div class="mb-6">
      <h3 class="title is-4 has-text-success has-text-weight-bold mb-4">💻 Informática</h3>
      <div class="columns is-multiline">
        <div class="column is-12-tablet is-4-desktop">
          <div class="card tarjeta-competencia p-4" @click="seleccionar('Full Game', 'informatica')">
            <div class="card-content has-text-centered py-4">
              <p class="title is-4 texto-blanco has-text-weight-bold">Full Game</p>
            </div>
          </div>
        </div>
        <div class="column is-12-tablet is-4-desktop">
          <div class="card tarjeta-competencia p-4" @click="seleccionar('One-Day Video Game', 'informatica')">
            <div class="card-content has-text-centered py-4">
              <p class="title is-4 texto-blanco has-text-weight-bold">One-Day Video Game</p>
            </div>
          </div>
        </div>
        <div class="column is-12-tablet is-4-desktop">
          <div class="card tarjeta-competencia p-4" @click="seleccionar('SysApp', 'informatica')">
            <div class="card-content has-text-centered py-4">
              <p class="title is-4 texto-blanco has-text-weight-bold">SysApp</p>
            </div>
          </div>
        </div>
        <div class="column is-12-tablet is-6-desktop">
          <div class="card tarjeta-competencia p-4" @click="seleccionar('Desarrollo de Sistemas', 'informatica')">
            <div class="card-content has-text-centered py-4">
              <p class="title is-4 texto-blanco has-text-weight-bold">Desarrollo de Sistemas</p>
            </div>
          </div>
        </div>
        <div class="column is-12-tablet is-6-desktop">
          <div class="card tarjeta-competencia p-4" @click="seleccionar('Resolución de Problemas', 'informatica')">
            <div class="card-content has-text-centered py-4">
              <p class="title is-4 texto-blanco has-text-weight-bold">Resolución de Problemas</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ÁREA 3: FERIA DE CIENCIAS -->
    <div class="mb-6">
      <h3 class="title is-4 has-text-warning has-text-weight-bold mb-4">🔬 Feria de Ciencias</h3>
      <div class="columns is-multiline">
        <div class="column is-12-tablet is-4-desktop">
          <div class="card tarjeta-competencia p-4" @click="seleccionar('Robots Autónomos', 'feria')">
            <div class="card-content has-text-centered py-4">
              <p class="title is-4 texto-blanco has-text-weight-bold">Robots Autónomos</p>
            </div>
          </div>
        </div>
        <div class="column is-12-tablet is-4-desktop">
          <div class="card tarjeta-competencia p-4" @click="seleccionar('Control Automatizado', 'feria')">
            <div class="card-content has-text-centered py-4">
              <p class="title is-4 texto-blanco has-text-weight-bold">Control Automatizado</p>
            </div>
          </div>
        </div>
        <div class="column is-12-tablet is-4-desktop">
          <div class="card tarjeta-competencia p-4" @click="seleccionar('Prototipo', 'feria')">
            <div class="card-content has-text-centered py-4">
              <p class="title is-4 texto-blanco has-text-weight-bold">Prototipo</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ÁREA 4: EMPRENDEDURISMO -->
    <div>
      <h3 class="title is-4 has-text-danger has-text-weight-bold mb-4">💡 Emprendedurismo</h3>
      <div class="columns is-multiline">
        <div class="column is-12-tablet is-6-desktop">
          <div class="card tarjeta-competencia p-4" @click="seleccionar('Emprendimiento 1', 'emprendimiento')">
            <div class="card-content has-text-centered py-4">
              <p class="title is-4 texto-blanco has-text-weight-bold">Emprendimiento 1</p>
            </div>
          </div>
        </div>
        <div class="column is-12-tablet is-6-desktop">
          <div class="card tarjeta-competencia p-4" @click="seleccionar('Emprendimiento 2', 'emprendimiento')">
            <div class="card-content has-text-centered py-4">
              <p class="title is-4 texto-blanco has-text-weight-bold">Emprendimiento 2</p>
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
import api from '../services/api';

export default {
  name: 'MenuCompetencias',
  data() {
    return {
      modalidadesBD: []
    };
  },
  mounted() {
    this.cargarModalidades();
  },
  methods: {
    async cargarModalidades() {
      try {
        const respuesta = await api.get('/equipos/categorias-modalidades');
        if (respuesta.data && respuesta.data.exito) {
          this.modalidadesBD = respuesta.data.data;
        }
      } catch (error) {
        console.error('Error al cargar modalidades desde la BD:', error);
      }
    },

    seleccionar(nombreModalidad, tipo) {
      // Buscar en la BD la modalidad que coincida con el nombre para obtener su ID real
      const encontrada = this.modalidadesBD.find(m => 
        m.modalidad_nombre.toLowerCase().includes(nombreModalidad.toLowerCase()) ||
        nombreModalidad.toLowerCase().includes(m.modalidad_nombre.toLowerCase())
      );

      const modalidadId = encontrada ? encontrada.modalidad_id : null;

      // Emitimos el objeto hacia App.vue
      this.$emit('seleccionar-modalidad', {
        id: modalidadId,
        nombre: nombreModalidad,
        tipo: tipo
      });
    }
  }
};
</script>

<style scoped>
.tarjeta-competencia {
  background-color: #0f172a !important;
  border: 2px solid #334155;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}
.tarjeta-competencia:hover {
  transform: translateY(-4px);
  border-color: #3b82f6;
  background-color: #1e293b !important;
  box-shadow: 0 8px 20px rgba(59, 130, 246, 0.25);
}
</style>