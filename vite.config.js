import { fileURLToPath, URL } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  // 加载环境变量
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    // 设置静态资源基础路径
    base: env.VITE_BASE_URL || '/clmap/',
    plugins: [
      vue(),
      vueDevTools(),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      },
    },
    // 开发服务器配置
    server: {
      host: '0.0.0.0',
      port: 5173,
      open: false,
      cors: true,
      // 反向代理配置
      proxy: {
        '/clapi': {
          target: 'http://192.168.3.249/', // 后端服务地址
          changeOrigin: true,
        },
        // 天地图API代理（解决跨域问题）
        '/tianditu': {
          target: 'http://api.tianditu.gov.cn',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/tianditu/, '')
        }
      }
    },
    // 构建配置
    build: {
      target: 'es2015',
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: env.NODE_ENV === 'development',
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: env.VITE_DROP_CONSOLE === 'true',
          drop_debugger: env.VITE_DROP_DEBUGGER === 'true'
        }
      },
      rollupOptions: {
        output: {
          chunkFileNames: 'assets/js/[name]-[hash].js',
          entryFileNames: 'assets/js/[name]-[hash].js',
          assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
          manualChunks: {
            vue: ['vue', 'vue-router', 'pinia'],
            utils: ['axios', 'jsencrypt']
          }
        }
      }
    },
    // 环境变量配置
    define: {
      __APP_VERSION__: JSON.stringify(env.VITE_APP_VERSION || '1.0.0'),
      __BUILD_TIME__: JSON.stringify(new Date().toISOString())
    },
    // CSS配置
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `@import "@/assets/styles/variables.scss";`
        }
      }
    }
  }
})
