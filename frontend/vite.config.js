import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { readFileSync } from 'node:fs';
import https from 'node:https';

export default defineConfig(({ command }) => {
    if (command === 'build') return { plugins: [react()] };
    let key, cert;
    try {
        key = readFileSync(new URL('../certs/localhost-key.pem', import.meta.url));
        cert = readFileSync(new URL('../certs/localhost.pem', import.meta.url));
    } catch {
        throw new Error('Falta el certificado HTTPS. Ejecutá npm run cert:crear en la carpeta backend.');
    }
    const opciones = {
        https: { key, cert, minVersion: 'TLSv1.2' },
        proxy: {
            '/api': {
                target: 'https://127.0.0.1:3000',
                // Confiar solo en nuestro certificado local, sin desactivar la verificación TLS.
                agent: new https.Agent({ ca: cert }),
            },
        },
    };
    return { plugins: [react()], server: { port: 5173, ...opciones }, preview: opciones };
});
