
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import process from 'node:process';

export default defineConfig(({ mode }) => {
  // Load env file from the current directory
  const env = loadEnv(mode, process.cwd(), '');
  
  // Clean the API key: remove quotes, double quotes, and whitespace
  const rawKey = env.VITE_API_KEY || "";
  const cleanKey = rawKey.replace(/['" ]+/g, '').trim();

  console.log('\n--- Agha-Voxify Build Status ---');
  if (cleanKey) {
    console.log('✅ API Key detected and cleaned.');
    console.log('   Prefix:', cleanKey.substring(0, 6) + '...');
  } else {
    console.log('❌ ERROR: VITE_API_KEY is missing in .env file!');
  }
  console.log('--------------------------------\n');

  return {
    plugins: [react()],
    base: './', 
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      assetsDir: 'assets',
    },
    define: {
      // Use cleanKey to ensure no quotes are double-wrapped
      'process.env.API_KEY': JSON.stringify(cleanKey),
    }
  };
});
