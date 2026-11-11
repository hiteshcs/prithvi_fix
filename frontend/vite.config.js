import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function spaFallbackPlugin() {
  const routes = [
    'services',
    'find-worker',
    'book-service',
    'about',
    'help',
    'login',
    'register',
    'rate-card',
    'society/register',
    'society/timeline',
    'customer/bookings',
    'customer/addresses',
    'profile',
    'worker/dashboard',
    'worker/welfare',
    'apex/dashboard',
    'society/dashboard',
    'federation/portal',
    'federation/tenders',
    'institutional-tenders',
    'admin/dashboard',
    'dco/dashboard',
    'dco/portal',
    'admin/dco-approvals',
  ];

  return {
    name: 'spa-fallback-plugin',
    closeBundle() {
      const distDir = path.resolve(__dirname, 'dist');
      const indexPath = path.join(distDir, 'index.html');
      const notFoundPath = path.join(distDir, '404.html');

      if (fs.existsSync(indexPath)) {
        // 1. Generate 404.html for any unlisted route
        fs.copyFileSync(indexPath, notFoundPath);

        // 2. Pre-generate physical index.html for all known application routes
        for (const route of routes) {
          const targetDir = path.join(distDir, ...route.split('/'));
          fs.mkdirSync(targetDir, { recursive: true });
          fs.copyFileSync(indexPath, path.join(targetDir, 'index.html'));
        }

        console.log(`✅ Pre-generated ${routes.length} static route endpoints & 404.html for Vercel SPA resilience`);
      }
    }
  };
}

export default defineConfig({
  plugins: [react(), spaFallbackPlugin()],
  server: {
    host: true, // Listen on all network interfaces (0.0.0.0)
    port: 5173,
    allowedHosts: true, // Allow ngrok and remote host headers
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    }
  }
});

