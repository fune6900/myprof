import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: '/myprof/',
  resolve: {
    alias: {
      /*
       * 外から取り込んだコンポーネントは "@/..." で書かれている。
       * 相対パスに書き換えると上流との差分が追えなくなるので、
       * エイリアスのほうを用意して原文のまま置けるようにする。
       */
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
