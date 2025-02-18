import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// Get the directory name from the current module URL
const __dirname = path.dirname(new URL(import.meta.url).pathname);

export default defineConfig({
  plugins: [react()],
  assetsInclude: ['**/*.PNG'],
<<<<<<< HEAD
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'), // Correct usage of __dirname
    },
  },
 
  build: {
    outDir: 'build', // Change this to 'build' if you want the output here
=======
  base: 'https://dev.earlyagedevelopment.com/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'build',
>>>>>>> origin/main
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        assetFileNames: 'assets/[name][extname]'
      }
    }
<<<<<<< HEAD
=======
  },
  server: {
    port: 3000,
    historyApiFallback: true
>>>>>>> origin/main
  }
})