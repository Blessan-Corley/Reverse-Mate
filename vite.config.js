// Vite configuration for the ChessPursuit client
/** @type {import('vite').UserConfig} */
module.exports = {
    root: 'src',
    publicDir: 'public',
    server: {
        open: 'index.html',
        proxy: {
            '/api': {
                target: 'http://localhost:5000',
                changeOrigin: true,
            },
        },
    },
    build: { outDir: '../dist', emptyOutDir: true },
};
