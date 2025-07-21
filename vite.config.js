import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // AÑADE ESTA SECCIÓN COMPLETA
  server: {
    proxy: {
      // Peticiones a '/api' serán redirigidas
      '/api': {
        // La URL base de la API de Wompi a la que quieres acceder
        target: 'https://api-sandbox.co.uat.wompi.dev',
        // Esto es CRUCIAL. Cambia el 'origen' de la petición al del 'target'
        changeOrigin: true,
        // Reescribe la ruta para quitar '/api' antes de enviarla al servidor de Wompi
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
});