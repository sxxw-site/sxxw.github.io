import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { appearanceHeadScript } from './src/lib/appearance-head';
import { searchVerificationHead } from './scripts/search-verification.mjs';

export default defineConfig({
  plugins: [react(), {
    name: 'site-appearance-head',
    transformIndexHtml: (html) => html.replace('<!--site-appearance-->', `<script>${appearanceHeadScript}</script>${searchVerificationHead()}`),
  }],
  build: {
    outDir: 'docs',
    assetsDir: 'react-assets',
    emptyOutDir: true,
    manifest: true,
  },
});
