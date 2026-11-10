import app from './app.js';
import { pool } from './config/db.js';
import { config } from './config/env.js';

try {
    await pool.query('SELECT 1');
    const server = app.listen(config.port, config.host, () => {
        console.log(`Backend disponible en http://${config.host}:${config.port}`);
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
    console.error('No se pudo conectar a MySQL. Revisá .env y ejecutá npm run db:init.', error.code);
    await pool.end();
    process.exitCode = 1;
}
