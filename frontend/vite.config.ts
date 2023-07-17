import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill';
import { NodeModulesPolyfillPlugin } from '@esbuild-plugins/node-modules-polyfill'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    optimizeDeps: {
        disabled: false,
        include: ['@safe-global/protocol-kit', '@safe-global/api-kit'],
        esbuildOptions: {
            define: {
                global: 'globalThis'
            },
            plugins: [
                NodeGlobalsPolyfillPlugin({
                    buffer: true,
                    process: true
                }),
                NodeModulesPolyfillPlugin()
            ]
        }
    },
    define: {
        'process.env': {},
        global: {}
    }
});
