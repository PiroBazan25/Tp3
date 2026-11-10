import * as conductores from '../models/conductores.js';
import { ErrorHttp } from '../middlewares/errores.js';

export async function listar(req, res) {
    res.json(await conductores.listar(req.query.buscar));
}

export async function obtener(req, res) {
    const conductor = await conductores.obtener(req.params.id);
    if (!conductor) throw new ErrorHttp(404, 'Conductor no encontrado.');
    res.json(conductor);
}

export async function crear(req, res) {
    res.status(201).json(await conductores.crear(req.body));
}

export async function actualizar(req, res) {
    if (!await conductores.obtener(req.params.id)) throw new ErrorHttp(404, 'Conductor no encontrado.');
    res.json(await conductores.actualizar(req.params.id, req.body));
}

export async function eliminar(req, res) {
    if (!await conductores.eliminar(req.params.id)) throw new ErrorHttp(404, 'Conductor no encontrado.');
    res.status(204).end();
}
