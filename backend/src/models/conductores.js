import { pool } from '../config/db.js';

export async function listar(buscar = '') {
    const termino = `%${buscar}%`;
    const [filas] = await pool.execute(
        'SELECT * FROM conductores WHERE nombre LIKE ? OR apellido LIKE ? OR documento LIKE ? ORDER BY apellido, nombre',
        [termino, termino, termino],
    );
    return filas;
}

export async function obtener(id) {
    const [filas] = await pool.execute('SELECT * FROM conductores WHERE id=?', [id]);
    return filas[0];
}

export async function crear(datos) {
    const { nombre, apellido, documento, numero_licencia, fecha_alta_licencia, fecha_vencimiento_licencia } = datos;
    const [resultado] = await pool.execute(
        `INSERT INTO conductores (nombre, apellido, documento, numero_licencia, fecha_alta_licencia, fecha_vencimiento_licencia)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [nombre, apellido, documento, numero_licencia, fecha_alta_licencia, fecha_vencimiento_licencia],
    );
    return obtener(resultado.insertId);
}

export async function actualizar(id, datos) {
    const { nombre, apellido, documento, numero_licencia, fecha_alta_licencia, fecha_vencimiento_licencia } = datos;
    await pool.execute(
        `UPDATE conductores SET nombre=?, apellido=?, documento=?, numero_licencia=?,
         fecha_alta_licencia=?, fecha_vencimiento_licencia=? WHERE id=?`,
        [nombre, apellido, documento, numero_licencia, fecha_alta_licencia, fecha_vencimiento_licencia, id],
    );
    return obtener(id);
}

export async function eliminar(id) {
    const [resultado] = await pool.execute('DELETE FROM conductores WHERE id=?', [id]);
    return resultado.affectedRows;
}
