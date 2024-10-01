import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
// Note: no import for vite-plugin-static-copy here

export default defineConfig(async () => {
    const { viteStaticCopy } = await import('vite-plugin-static-copy');

    return {
        plugins: [
            vue(),
            viteStaticCopy({
                targets: [
                    {
                        src: 'manifest.json',
                        dest: '.'
                    },
                    {
                        src: 'content.js',
                        dest: '.'
                    }
                ]
            })
        ],
        build: {
            outDir: 'dist',
            rollupOptions: {
                input: {
                    popup: 'src/popup.html'
                }
            }
        }
    };
});
