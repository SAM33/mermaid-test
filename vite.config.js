import { defineConfig } from 'vite';

// GitHub Pages project sites are served under /<repository>/; Docker is served at /.
export default defineConfig({
  base: process.env.BASE_PATH || '/'
});
