/**
 * Propósito: Configurar una instancia centralizada de Axios apuntando al backend local de OPRIIET.
 * A quién alimenta: A los componentes de Vue que necesiten consultar inscriptos o registrar acreditaciones.
 * Qué datos retorna: Instancia de Axios preconfigurada con la URL base del servidor.
 */

import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

export default api;