import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // 新增的server配置：让服务监听所有网卡地址
  server: {
    host: '0.0.0.0', // 关键配置，替换默认的localhost
    port: 5173, // 端口保持5173不变（可选，不写也会默认用5173）
    open: false, // 可选：设为true则启动时自动打开浏览器
    allowedHosts: ['gymnospermic-adoptive-hyun.ngrok-free.dev'],
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true
      }
    }
  }
})