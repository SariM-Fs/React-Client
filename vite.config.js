import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // The API's CORS policy only allows http://localhost:5173, so fail loudly
    // instead of silently moving to 5174 when the port is already taken.
    strictPort: true,
  },
})
