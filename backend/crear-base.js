import 'dotenv/config';
import mysql from 'mysql2/promise';
import { readFile } from 'node:fs/promises';

const nombre = process.env.DB_NAME || 'tp3_transporte';
if (!/^[a-zA-Z0-9_]+$/.test(nombre)) throw new Error('Nombre de base de datos inválido.');

const conexion = await mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
});

try {
    await conexion.query(`CREATE DATABASE IF NOT EXISTS \`${nombre}\` CHARACTER SET utf8mb4`);
    await conexion.changeUser({ database: nombre });
    const sql = await readFile(new URL('./tablas.sql', import.meta.url), 'utf8');
    for (const sentencia of sql.split(';').map(s => s.trim()).filter(Boolean)) {
        await conexion.query(sentencia);
    }
    console.log(`Base ${nombre} preparada. No se borraron datos existentes.`);
} finally {
    await conexion.end();
}
