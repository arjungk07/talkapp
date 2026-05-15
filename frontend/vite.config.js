import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'


export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173, // Your frontend port
    proxy: {
      // Standard API proxy
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      // Socket.io proxy
      '/socket.io': {
        target: 'http://localhost:5000',
        ws: true, // Crucial for WebSockets
        changeOrigin: true
      }
    }
  },
  base: "/talkapp/",
})

//Think of a proxy as a "middleman" or a delivery service that sits between you (the Client) and the person you want to talk to (the Server).
