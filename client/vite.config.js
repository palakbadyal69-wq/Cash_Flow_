import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const proxyOptions = {
  target: 'http://localhost:5000',
  changeOrigin: true,
  secure: false,
  configure: (proxy, _options) => {
    proxy.on('error', (err, _req, res) => {
      if (res && !res.headersSent) {
        res.writeHead(503, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Backend server is not running on port 5000' }));
      }
    });
  }
};

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': proxyOptions
    }
  },
  preview: {
    port: 4173,
    proxy: {
      '/api': proxyOptions
    }
  }
});
