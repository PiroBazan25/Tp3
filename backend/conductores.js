import { Router } from 'express';
import { pool } from './db.js';
import { ErrorHttp } from './errores.js';
import { idValido, listaValida, conductorValido, validar } from './validaciones.js';

async function listarConductores(buscar = '') {
    const termino = `%${buscar}%`;
    const [filas] = await pool.execute(
        'SELECT * FROM conductores WHERE nombre LIKE ? OR apellido LIKE ? OR documento LIKE ? ORDER BY apellido, nombre',
        [termino, termino, termino],
    );
    return filas;
}

export async function buscarConductor(id) {
    const [filas] = await pool.execute('SELECT * FROM conductores WHERE id=?', [id]);
    return filas[0];
}

async function insertarConductor(datos) {
    const { nombre, apellido, documento, numero_licencia, fecha_alta_licencia, fecha_vencimiento_licencia } = datos;
    const [resultado] = await pool.execute(
        `INSERT INTO conductores (nombre, apellido, documento, numero_licencia, fecha_alta_licencia, fecha_vencimiento_licencia)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [nombre, apellido, documento, numero_licencia, fecha_alta_licencia, fecha_vencimiento_licencia],
    );
    return buscarConductor(resultado.insertId);
}

async function modificarConductor(id, datos) {
    const { nombre, apellido, documento, numero_licencia, fecha_alta_licencia, fecha_vencimiento_licencia } = datos;
    await pool.execute(
        `UPDATE conductores SET nombre=?, apellido=?, documento=?, numero_licencia=?,
         fecha_alta_licencia=?, fecha_vencimiento_licencia=? WHERE id=?`,
        [nombre, apellido, documento, numero_licencia, fecha_alta_licencia, fecha_vencimiento_licencia, id],
    );
    return buscarConductor(id);
}

async function borrarConductor(id) {
    const [resultado] = await pool.execute('DELETE FROM conductores WHERE id=?', [id]);
    return resultado.affectedRows;
}

async function listar(req, res) {
    res.json(await listarConductores(req.query.buscar));
}

async function obtener(req, res) {
    const conductor = await buscarConductor(req.params.id);
    if (!conductor) throw new ErrorHttp(404, 'Conductor no encontrado.');
    res.json(conductor);
}

async function crear(req, res) {
    res.status(201).json(await insertarConductor(req.body));
}

async function actualizar(req, res) {
    if (!await buscarConductor(req.params.id)) throw new ErrorHttp(404, 'Conductor no encontrado.');
    res.json(await modificarConductor(req.params.id, req.body));
}

async function eliminar(req, res) {
    if (!await borrarConductor(req.params.id)) throw new ErrorHttp(404, 'Conductor no encontrado.');
    res.status(204).end();
}

const router = Router();
router.get('/', listaValida(), validar, listar);
router.get('/:id', idValido(), validar, obtener);
router.post('/', conductorValido(), validar, crear);
router.put('/:id', idValido(), conductorValido(), validar, actualizar);
router.delete('/:id', idValido(), validar, eliminar);
export default router;
