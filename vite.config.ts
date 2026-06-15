import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// GitHub Pages serves the site under /<repo-name>/.
// Change this if the repo is renamed.
export default defineConfig({
  base: '/flipbook-poem/',
  plugins: [react()],
});
