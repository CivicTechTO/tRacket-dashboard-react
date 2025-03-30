/// <reference types="vitest/config" />

import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    // dataLoading tests can take > 5s
    testTimeout: 10_000,
  },
});
