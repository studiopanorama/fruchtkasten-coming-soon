console.log('🚀 Vite config loaded');

import { defineConfig } from 'vite';

export default ({ command }) => ({
  base: command === 'build' ? '/fruchtkasten-coming-soon/' : './',
  optimizeDeps: {
    include: ['pathseg'] // nur für dev
  }
});

