import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { viteSingleFile } from "vite-plugin-singlefile"
import inlineSource from "vite-plugin-inline-source"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    viteSingleFile(),
    inlineSource({
      optimizeJs: true
    })
  ],
  build: {
    assetsInlineLimit: 2.097e+8,
  },
})
