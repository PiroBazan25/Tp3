import { Router } from 'express';
import { pool } from './db.js';
import { ErrorHttp } from './errores.js';
import { idValido, listaValida, vehiculoValido, validar } from './validaciones.js';

async function listarVehiculos(buscar = '') {
    const termino = `%${buscar}%`;
    const [filas] = await pool.execute(
        'SELECT * FROM vehiculos WHERE marca LIKE ? OR modelo LIKE ? OR patente LIKE ? ORDER BY patente',
        [termino, termino, termino],
    );
    return filas;
}

export async function buscarVehiculo(id) {
    const [filas] = await pool.execute('SELECT * FROM vehiculos WHERE id = ?', [id]);
    return filas[0];
}

async function insertarVehiculo(datos) {
    const { marca, modelo, patente, anio, capacidad_carga } = datos;
    const [resultado] = await pool.execute(
        'INSERT INTO vehiculos (marca, modelo, patente, anio, capacidad_carga) VALUES (?, ?, ?, ?, ?)',
        [marca, modelo, patente, anio, capacidad_carga],
    );
    return buscarVehiculo(resultado.insertId);
}

async function modificarVehiculo(id, datos) {
    const { marca, modelo, patente, anio, capacidad_carga } = datos;
    await pool.execute('UPDATE vehiculos SET marca=?, modelo=?, patente=?, anio=?, capacidad_carga=? WHERE id=?',
        [marca, modelo, patente, anio, capacidad_carga, id]);
    return buscarVehiculo(id);
}

async function borrarVehiculo(id) {
    const [resultado] = await pool.execute('DELETE FROM vehiculos WHERE id=?', [id]);
    return resultado.affectedRows;
}

async function listar(req, res) {
    res.json(await listarVehiculos(req.query.buscar));
}

async function obtener(req, res) {
    const vehiculo = await buscarVehiculo(req.params.id);
    if (!vehiculo) throw new ErrorHttp(404, 'Vehículo no encontrado.');
    res.json(vehiculo);
}

async function crear(req, res) {
    res.status(201).json(await insertarVehiculo(req.body));
}

async function actualizar(req, res) {
    if (!await buscarVehiculo(req.params.id)) throw new ErrorHttp(404, 'Vehículo no encontrado.');
    res.json(await modificarVehiculo(req.params.id, req.body));
}

async function eliminar(req, res) {
    if (!await borrarVehiculo(req.params.id)) throw new ErrorHttp(404, 'Vehículo no encontrado.');
    res.status(204).end();
}

const router = Router();
router.get('/', listaValida(), validar, listar);
router.get('/:id', idValido(), validar, obtener);
router.post('/', vehiculoValido(), validar, crear);
router.put('/:id', idValido(), vehiculoValido(), validar, actualizar);
router.delete('/:id', idValido(), validar, eliminar);
export default router;
