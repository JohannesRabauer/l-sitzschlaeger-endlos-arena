import { defineConfig } from 'vite';

export default defineConfig({
  base: '/l-sitzschlaeger-endlos-arena/',
  build: {
    outDir: 'dist',
    rollupOptions: {
      output: {
        manualChunks: { phaser: ['phaser'] }
      }
    }
  },
  server: { port: 3000 }
});
