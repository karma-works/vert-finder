import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: process.env.GITHUB_ACTIONS ? '/utm-height-training/' : '/',
  server: {
    allowedHosts: ['flywheel1', '100.86.249.92'],
  },
})
