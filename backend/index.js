import app from './app.js';
import { pool } from './db.js';
import { config } from './env.js';
import { createServer } from 'node:https';
import { leerTls } from './tls.js';

try {
    const tls = leerTls();
    await pool.query('SELECT 1');
    const server = createServer(tls, app).listen(config.port, config.host, () => {
        console.log(`Backend disponible en https://${config.host}:${config.port}`);
    });
    server.on('error', async error => {
        console.error('No se pudo abrir el servidor:', error.code);
        await pool.end();
        process.exitCode = 1;
    });
    for (const signal of ['SIGINT', 'SIGTERM']) {
        process.once(signal, () => server.close(async () => { await pool.end(); process.exit(0); }));
    }
} catch (error) {
    console.error(error.code ? `No se pudo iniciar el backend (${error.code}). Revisá MySQL y .env.` : error.message);
    await pool.end();
    process.exitCode = 1;
}
