import { readFileSync } from 'node:fs';

export function leerTls() {
    try {
        return {
            key: readFileSync(process.env.TLS_KEY_PATH || new URL('../../../certs/localhost-key.pem', import.meta.url)),
            cert: readFileSync(process.env.TLS_CERT_PATH || new URL('../../../certs/localhost.pem', import.meta.url)),
            minVersion: 'TLSv1.2',
        };
    } catch {
        throw new Error('No se pudo leer el certificado HTTPS. Ejecutá npm run cert:crear en backend o configurá TLS_KEY_PATH y TLS_CERT_PATH.');
    }
}
