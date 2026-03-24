import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
    const env  = loadEnv(mode, process.cwd(), '');
    const port = parseInt(env.VITE_PORT) || 5173;

    return {
        plugins: [
            react(),
            VitePWA({
                registerType: 'autoUpdate',
                includeAssets: ['favicon.ico', 'icons/*.png'],
                manifest: {
                    name: 'RCEE RIMS',
                    short_name: 'RCEE RIMS',
                    description: 'Ramachandra College of Engineering — Research Information Management System',
                    start_url: '/',
                    display: 'standalone',
                    background_color: '#ffffff',
                    theme_color: '#ea580c',
                    orientation: 'portrait-primary',
                    icons: [
                        { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any maskable' },
                        { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
                    ],
                },
                workbox: {
                    /* Cache all built assets */
                    globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],

                    /*
                     * SPA navigation fallback — MUST be index.html so React Router
                     * can handle all routes. Do NOT use offline.html here or it
                     * will show on normal navigations too.
                     */
                    navigateFallback: '/index.html',

                    /* Don't intercept API or upload requests with navigateFallback */
                    navigateFallbackDenylist: [/^\/api/, /^\/uploads/, /\.json$/],

                    runtimeCaching: [
                        {
                            /* API — network first, cached copy on failure */
                            urlPattern: /^https?:\/\/.*\/api\/.*/i,
                            handler: 'NetworkFirst',
                            options: {
                                cacheName: 'rcee-api-cache',
                                expiration: { maxEntries: 100, maxAgeSeconds: 86400 },
                                networkTimeoutSeconds: 8,
                                fetchOptions: { credentials: 'include' },
                            },
                        },
                        {
                            /* Uploaded files — cache-first */
                            urlPattern: /^https?:\/\/.*\/uploads\/.*/i,
                            handler: 'CacheFirst',
                            options: {
                                cacheName: 'rcee-uploads-cache',
                                expiration: { maxEntries: 200, maxAgeSeconds: 604800 },
                            },
                        },
                    ],
                },
                /* ⚠️ Keep disabled in dev — SW intercepts Vite proxy and breaks hot reload */
                devOptions: { enabled: false },
            }),
        ],
        server: {
            port,
            host: '0.0.0.0',
            proxy: {
                '/api':     { target: 'http://localhost:5000', changeOrigin: true },
                '/uploads': { target: 'http://localhost:5000', changeOrigin: true },
            },
        },
    };
});
