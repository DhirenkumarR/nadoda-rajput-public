import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const BASE = '/nadoda-rajput-public/';

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'dev-base-redirect',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          const url = req.url || '/';
          if (
            !url.startsWith(BASE) &&
            !url.startsWith('/api') &&
            !url.startsWith('/@') &&
            !url.startsWith('/src') &&
            !url.startsWith('/node_modules')
          ) {
            const clean = url.replace(/^\/+/, '');
            res.writeHead(302, { Location: `${BASE}${clean}` });
            return res.end();
          }
          next();
        });
      }
    }
  ],
  base: BASE,
  server: {
    port: 5175,
    proxy: {
      '/api': {
        target: 'https://nadoda-connect-backend.onrender.com',
        changeOrigin: true
      }
    }
  }
});
