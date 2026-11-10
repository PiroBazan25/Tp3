export class ErrorHttp extends Error {
    constructor(estado, mensaje) {
        super(mensaje);
        this.estado = estado;
    }
}

export function manejarErrores(error, req, res, next) {
    if (res.headersSent) return next(error);
    if (error.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ mensaje: 'Ya existe un registro con esos datos únicos.' });
    }
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
        return res.status(400).json({ mensaje: 'No se puede eliminar: tiene viajes asociados.' });
    }
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
        return res.status(400).json({ mensaje: 'El vehículo o conductor seleccionado ya no existe.' });
    }
    if (error.type === 'entity.parse.failed') {
        return res.status(400).json({ mensaje: 'El cuerpo debe contener JSON válido.' });
    }
    if (error.type === 'entity.too.large') {
        return res.status(400).json({ mensaje: 'La solicitud es demasiado grande.' });
    }
    if (error.estado) return res.status(error.estado).json({ mensaje: error.message });
    console.error('Error de la API:', error.code || error.name);
    return res.status(500).json({ mensaje: 'Error interno del servidor. Intentá nuevamente.' });
}
