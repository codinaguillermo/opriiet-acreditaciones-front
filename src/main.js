/**
 * Propósito: Punto de entrada principal de la aplicación Vue 3. 
 *            Inicializa la instancia de la app e importa los estilos globales de Bulma.
 * A quién alimenta: Al DOM del navegador (elemento con id #app).
 * Qué datos retorna: La aplicación Vue montada y lista para renderizar componentes.
 */

import { createApp } from 'vue';
import App from './App.vue';

// Importación del framework de estilos Bulma para diseño responsivo
import 'bulma/css/bulma.min.css';

createApp(App).mount('#app');