import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/IS219/',
  server: { port: 3000 },
  plugins: [react()],
});
