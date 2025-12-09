import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // Use GitHub Pages subpath in CI; keep root for local dev
  base: process.env.GITHUB_ACTIONS ? '/ToDo/' : '/',
  plugins: [react()],
})
