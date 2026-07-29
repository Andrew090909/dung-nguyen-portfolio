import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';

export default defineConfig({
  plugins: [
    laravel({
      input: [
        'resources/scss/app.scss',
        'resources/scss/admin.scss',
        'resources/js/app.js',
        'resources/js/admin.js',
      ],
      refresh: true,
    }),
  ],
  build: {
    sourcemap: false,
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks: {
          three: ['three'],
          motion: ['gsap'],
        },
      },
    },
  },
});
