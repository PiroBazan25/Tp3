import * as vehiculos from '../models/vehiculos.js';
import { ErrorHttp } from '../middlewares/errores.js';

export async function listar(req, res) {
    res.json(await vehiculos.listar(req.query.buscar));
}

export async function obtener(req, res) {
    const vehiculo = await vehiculos.obtener(req.params.id);
    if (!vehiculo) throw new ErrorHttp(404, 'Vehículo no encontrado.');
    res.json(vehiculo);
}

export async function crear(req, res) {
    res.status(201).json(await vehiculos.crear(req.body));
}

export async function actualizar(req, res) {
    if (!await vehiculos.obtener(req.params.id)) throw new ErrorHttp(404, 'Vehículo no encontrado.');
    res.json(await vehiculos.actualizar(req.params.id, req.body));
}

export async function eliminar(req, res) {
    if (!await vehiculos.eliminar(req.params.id)) throw new ErrorHttp(404, 'Vehículo no encontrado.');
    res.status(204).end();
}
