import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: './',
  envPrefix: 'VITE_',
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        auth: resolve(__dirname, 'auth.html'),
        farmer: resolve(__dirname, 'farmer-dashboard.html'),
        buyer: resolve(__dirname, 'buyer-dashboard.html'),
        adminLogin: resolve(__dirname, 'admin-login.html'),
        admin: resolve(__dirname, 'admin.html'),
        listing: resolve(__dirname, 'listing.html'),
        checkout: resolve(__dirname, 'checkout.html'),
      },
    },
  },
});
