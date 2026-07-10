import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: './', // Electron(file://)에서도 에셋 경로가 동작하도록 상대 경로
  server: { host: true },
})
