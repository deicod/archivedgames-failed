import { defineConfig } from 'vite'
import path from 'path'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react({ babel: { plugins: ['babel-plugin-relay'] } })],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
})
