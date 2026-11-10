import * as viajes from '../models/viajes.js';
import * as vehiculos from '../models/vehiculos.js';
import * as conductores from '../models/conductores.js';
import { ErrorHttp } from '../middlewares/errores.js';

async function comprobarRelacion(datos) {
    if (!await vehiculos.obtener(datos.vehiculo_id)) throw new ErrorHttp(400, 'El vehículo no existe.');
    const conductor = await conductores.obtener(datos.conductor_id);
    if (!conductor) throw new ErrorHttp(400, 'El conductor no existe.');
    // La licencia tiene que cubrir tanto la salida como la llegada.
    const salida = datos.fecha_salida.slice(0, 10);
    const llegada = datos.fecha_llegada.slice(0, 10);
    if (salida < conductor.fecha_alta_licencia || llegada > conductor.fecha_vencimiento_licencia) {
        throw new ErrorHttp(400, 'La licencia debe estar vigente durante todo el viaje.');
    }
}

export async function listar(req, res) {
    if (req.query.vehiculo_id && !await vehiculos.obtener(req.query.vehiculo_id)) {
        throw new ErrorHttp(404, 'Vehículo no encontrado.');
    }
    if (req.query.conductor_id && !await conductores.obtener(req.query.conductor_id)) {
        throw new ErrorHttp(404, 'Conductor no encontrado.');
    }
    const filas = await viajes.listar(req.query);
    res.json({ viajes: filas, total_kilometros: Number(filas.reduce((suma, viaje) => suma + viaje.kilometros, 0).toFixed(2)) });
}

export async function obtener(req, res) {
    const viaje = await viajes.obtener(req.params.id);
    if (!viaje) throw new ErrorHttp(404, 'Viaje no encontrado.');
    res.json(viaje);
}

export async function crear(req, res) {
    await comprobarRelacion(req.body);
    res.status(201).json(await viajes.crear(req.body));
}

export async function actualizar(req, res) {
    if (!await viajes.obtener(req.params.id)) throw new ErrorHttp(404, 'Viaje no encontrado.');
    await comprobarRelacion(req.body);
    res.json(await viajes.actualizar(req.params.id, req.body));
}

export async function eliminar(req, res) {
    if (!await viajes.eliminar(req.params.id)) throw new ErrorHttp(404, 'Viaje no encontrado.');
    res.status(204).end();
}
