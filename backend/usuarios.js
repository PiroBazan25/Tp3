import { pool } from './db.js';

export async function buscarPorEmail(email) {
    const [filas] = await pool.execute('SELECT id, nombre, email, contrasena FROM usuarios WHERE email = ?', [email]);
    return filas[0];
}

export async function buscarPorId(id) {
    const [filas] = await pool.execute('SELECT id, nombre, email FROM usuarios WHERE id = ?', [id]);
    return filas[0];
}

export async function crearUsuario(nombre, email, hash) {
    const [resultado] = await pool.execute('INSERT INTO usuarios (nombre, email, contrasena) VALUES (?, ?, ?)', [nombre, email, hash]);
    return { id: resultado.insertId, nombre, email };
}
