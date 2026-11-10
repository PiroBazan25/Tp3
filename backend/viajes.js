import { Router } from 'express';
import { pool } from './db.js';
import { ErrorHttp } from './errores.js';
import { idValido, filtroViajesValido, viajeValido, validar } from './validaciones.js';
import { buscarVehiculo } from './vehiculos.js';
import { buscarConductor } from './conductores.js';

const seleccion = `SELECT v.*, ve.patente, ve.marca, ve.modelo,
    c.nombre AS conductor_nombre, c.apellido AS conductor_apellido
    FROM viajes v JOIN vehiculos ve ON ve.id=v.vehiculo_id
    JOIN conductores c ON c.id=v.conductor_id`;

async function listarViajes(filtros = {}) {
    const condiciones = [];
    const valores = [];
    if (filtros.vehiculo_id) { condiciones.push('v.vehiculo_id=?'); valores.push(filtros.vehiculo_id); }
    if (filtros.conductor_id) { condiciones.push('v.conductor_id=?'); valores.push(filtros.conductor_id); }
    const where = condiciones.length ? ` WHERE ${condiciones.join(' AND ')}` : '';
    const [filas] = await pool.execute(`${seleccion}${where} ORDER BY v.fecha_salida DESC, v.id DESC`, valores);
    return filas;
}

async function buscarViaje(id) {
    const [filas] = await pool.execute(`${seleccion} WHERE v.id=?`, [id]);
    return filas[0];
}

function valores(datos) {
    return [datos.vehiculo_id, datos.conductor_id,
        datos.fecha_salida.replace('T', ' '), datos.fecha_llegada.replace('T', ' '),
        datos.origen, datos.destino, datos.kilometros, datos.observaciones || ''];
}

async function insertarViaje(datos) {
    const [resultado] = await pool.execute(
        `INSERT INTO viajes (vehiculo_id, conductor_id, fecha_salida, fecha_llegada, origen, destino, kilometros, observaciones)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, valores(datos));
    return buscarViaje(resultado.insertId);
}

async function modificarViaje(id, datos) {
    await pool.execute(
        `UPDATE viajes SET vehiculo_id=?, conductor_id=?, fecha_salida=?, fecha_llegada=?, origen=?, destino=?,
         kilometros=?, observaciones=? WHERE id=?`, [...valores(datos), id]);
    return buscarViaje(id);
}

async function borrarViaje(id) {
    const [resultado] = await pool.execute('DELETE FROM viajes WHERE id=?', [id]);
    return resultado.affectedRows;
}

async function comprobarRelacion(datos) {
    if (!await buscarVehiculo(datos.vehiculo_id)) throw new ErrorHttp(400, 'El vehículo no existe.');
    const conductor = await buscarConductor(datos.conductor_id);
    if (!conductor) throw new ErrorHttp(400, 'El conductor no existe.');
    // La licencia tiene que cubrir tanto la salida como la llegada.
    const salida = datos.fecha_salida.slice(0, 10);
    const llegada = datos.fecha_llegada.slice(0, 10);
    if (salida < conductor.fecha_alta_licencia || llegada > conductor.fecha_vencimiento_licencia) {
        throw new ErrorHttp(400, 'La licencia debe estar vigente durante todo el viaje.');
    }
}

async function listar(req, res) {
    if (req.query.vehiculo_id && !await buscarVehiculo(req.query.vehiculo_id)) {
        throw new ErrorHttp(404, 'Vehículo no encontrado.');
    }
    if (req.query.conductor_id && !await buscarConductor(req.query.conductor_id)) {
        throw new ErrorHttp(404, 'Conductor no encontrado.');
    }
    const filas = await listarViajes(req.query);
    res.json({ viajes: filas, total_kilometros: Number(filas.reduce((suma, viaje) => suma + viaje.kilometros, 0).toFixed(2)) });
}

async function obtener(req, res) {
    const viaje = await buscarViaje(req.params.id);
    if (!viaje) throw new ErrorHttp(404, 'Viaje no encontrado.');
    res.json(viaje);
}

async function crear(req, res) {
    await comprobarRelacion(req.body);
    res.status(201).json(await insertarViaje(req.body));
}

async function actualizar(req, res) {
    if (!await buscarViaje(req.params.id)) throw new ErrorHttp(404, 'Viaje no encontrado.');
    await comprobarRelacion(req.body);
    res.json(await modificarViaje(req.params.id, req.body));
}

async function eliminar(req, res) {
    if (!await borrarViaje(req.params.id)) throw new ErrorHttp(404, 'Viaje no encontrado.');
    res.status(204).end();
}

const router = Router();
router.get('/', filtroViajesValido(), validar, listar);
router.get('/:id', idValido(), validar, obtener);
router.post('/', viajeValido(), validar, crear);
router.put('/:id', idValido(), viajeValido(), validar, actualizar);
router.delete('/:id', idValido(), validar, eliminar);
export default router;
