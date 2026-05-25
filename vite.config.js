import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: './',
  plugins: [
    react(),
    tailwindcss(),
 
  ],
  build: {
    target: 'es2015', // Eski nesil cihazlar ve kararlı WebView uyumluluğu için
    
    chunkSizeWarningLimit: 5000,
  rollupOptions:{
  output:{
      format:'es'
  }
  }
  }
})
