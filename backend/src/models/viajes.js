import { pool } from '../config/db.js';

const seleccion = `SELECT v.*, ve.patente, ve.marca, ve.modelo,
    c.nombre AS conductor_nombre, c.apellido AS conductor_apellido
    FROM viajes v JOIN vehiculos ve ON ve.id=v.vehiculo_id
    JOIN conductores c ON c.id=v.conductor_id`;

export async function listar(filtros = {}) {
    const condiciones = [];
    const valores = [];
    if (filtros.vehiculo_id) { condiciones.push('v.vehiculo_id=?'); valores.push(filtros.vehiculo_id); }
    if (filtros.conductor_id) { condiciones.push('v.conductor_id=?'); valores.push(filtros.conductor_id); }
    const where = condiciones.length ? ` WHERE ${condiciones.join(' AND ')}` : '';
    const [filas] = await pool.execute(`${seleccion}${where} ORDER BY v.fecha_salida DESC, v.id DESC`, valores);
    return filas;
}

export async function obtener(id) {
    const [filas] = await pool.execute(`${seleccion} WHERE v.id=?`, [id]);
    return filas[0];
}

function valores(datos) {
    return [datos.vehiculo_id, datos.conductor_id,
        datos.fecha_salida.replace('T', ' '), datos.fecha_llegada.replace('T', ' '),
        datos.origen, datos.destino, datos.kilometros, datos.observaciones || ''];
}

export async function crear(datos) {
    const [resultado] = await pool.execute(
        `INSERT INTO viajes (vehiculo_id, conductor_id, fecha_salida, fecha_llegada, origen, destino, kilometros, observaciones)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, valores(datos));
    return obtener(resultado.insertId);
}

export async function actualizar(id, datos) {
    await pool.execute(
        `UPDATE viajes SET vehiculo_id=?, conductor_id=?, fecha_salida=?, fecha_llegada=?, origen=?, destino=?,
         kilometros=?, observaciones=? WHERE id=?`, [...valores(datos), id]);
    return obtener(id);
}

export async function eliminar(id) {
    const [resultado] = await pool.execute('DELETE FROM viajes WHERE id=?', [id]);
    return resultado.affectedRows;
}
