console.log('🚀 Vite config loaded');

import { defineConfig } from 'vite';

export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production';

  return {
    base: isProduction ? '/fruchtkasten-coming-soon/' : '/',
    build: {
      outDir: 'dist',
      sourcemap: false
    },
    optimizeDeps: {
      include: ['pathseg']
    }
  };
});