import { pool } from '../config/db.js';

export async function listar(buscar = '') {
    const termino = `%${buscar}%`;
    const [filas] = await pool.execute(
        'SELECT * FROM vehiculos WHERE marca LIKE ? OR modelo LIKE ? OR patente LIKE ? ORDER BY patente',
        [termino, termino, termino],
    );
    return filas;
}

export async function obtener(id) {
    const [filas] = await pool.execute('SELECT * FROM vehiculos WHERE id = ?', [id]);
    return filas[0];
}

export async function crear(datos) {
    const { marca, modelo, patente, anio, capacidad_carga } = datos;
    const [resultado] = await pool.execute(
        'INSERT INTO vehiculos (marca, modelo, patente, anio, capacidad_carga) VALUES (?, ?, ?, ?, ?)',
        [marca, modelo, patente, anio, capacidad_carga],
    );
    return obtener(resultado.insertId);
}

export async function actualizar(id, datos) {
    const { marca, modelo, patente, anio, capacidad_carga } = datos;
    await pool.execute('UPDATE vehiculos SET marca=?, modelo=?, patente=?, anio=?, capacidad_carga=? WHERE id=?',
        [marca, modelo, patente, anio, capacidad_carga, id]);
    return obtener(id);
}

export async function eliminar(id) {
    const [resultado] = await pool.execute('DELETE FROM vehiculos WHERE id=?', [id]);
    return resultado.affectedRows;
}
