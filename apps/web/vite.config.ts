/// <reference types="vitest/config" />
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      // Registrado à mão em src/pwa/UpdateNotifier.tsx (virtual:pwa-register/react), não pelo script
      // auto-injetado — assim dá pra mostrar um Toast (F1-E02) quando há dado novo em vez de recarregar sem avisar.
      injectRegister: false,
      registerType: 'autoUpdate',
      manifest: {
        // Fallback genérico (antes de qualquer academia carregar); sobrescrito em runtime por
        // src/pwa/apply-pwa-manifest.ts com nome/ícone/cores da academia ativa (docs/WHITELABEL.md#pwa-por-academia).
        id: '/',
        name: 'Academia Whitelabel',
        short_name: 'Academia',
        description: 'Treino e dieta da sua academia, em um só app.',
        lang: 'pt-BR',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        background_color: '#0a0b0a',
        theme_color: '#e4022e',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: '/icons/icon-512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // App shell (JS/CSS/HTML/fontes/ícones) — todo dado real mora em localStorage, não numa API,
        // então "offline completo" aqui é só o shell disponível sem rede (ARCHITECTURE.md#pwa).
        globPatterns: ['**/*.{js,css,html,woff2,woff,png,ico}'],
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/icons\//],
        cleanupOutdatedCaches: true,
      },
      devOptions: {
        enabled: false,
      },
    }),
  ],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
  },
});
