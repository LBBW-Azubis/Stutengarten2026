import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',   // auf allen Netzwerk-Interfaces lauschen
    port: 5173,
    strictPort: true,  // wenn Port belegt, Fehler statt auf anderem Port starten
  },
})
