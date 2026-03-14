import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
<<<<<<< HEAD
=======
  base: './',
>>>>>>> istiaq-code
  build: {
    rollupOptions: {
      input: {
        popup: 'popup.html'
      }
    },
    outDir: 'dist',
    emptyOutDir: true
  }
})
