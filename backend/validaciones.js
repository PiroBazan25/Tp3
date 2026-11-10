import { body, param, query, validationResult } from 'express-validator';

export function validar(req, res, next) {
    const resultado = validationResult(req);
    if (!resultado.isEmpty()) {
        const errores = resultado.array({ onlyFirstError: true }).map(e => ({
            campo: e.path, mensaje: e.msg,
        }));
        return res.status(400).json({ mensaje: 'Revisá los datos ingresados.', errores });
    }
    next();
}

const texto = (campo, maximo) => body(campo).isString().withMessage('Debe ser texto.').bail()
    .trim().isLength({ min: 1, max: maximo }).withMessage(`Debe tener entre 1 y ${maximo} caracteres.`);
const fecha = campo => body(campo).matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage('Usá una fecha válida.').bail().isISO8601({ strict: true }).withMessage('Fecha inválida.');
const fechaHora = campo => body(campo).matches(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/)
    .withMessage('Usá una fecha y hora válidas.').bail().isISO8601({ strict: true }).withMessage('Fecha inválida.');

export const idValido = () => [param('id').isInt({ min: 1, max: 4294967295 }).withMessage('ID inválido.').toInt()];
export const listaValida = () => [
    query('buscar').optional().isString().bail().trim().isLength({ max: 100 }).withMessage('Búsqueda demasiado larga.'),
];
export const usuarioValido = () => [
    texto('nombre', 100),
    body('email').isString().bail().trim().isLength({ max: 254 }).isEmail().withMessage('Email inválido.').toLowerCase(),
    body('contrasena').isString().withMessage('Ingresá una contraseña.').bail()
        .isLength({ min: 8 }).withMessage('Usá al menos 8 caracteres.')
        .custom(v => Buffer.byteLength(v, 'utf8') <= 72).withMessage('La contraseña supera el límite de 72 bytes.'),
];
export const loginValido = () => [
    body('email').isString().bail().trim().isLength({ max: 254 }).isEmail().withMessage('Email inválido.').toLowerCase(),
    body('contrasena').isString().bail().isLength({ min: 1, max: 200 }).withMessage('Ingresá una contraseña.'),
];
export const vehiculoValido = () => [
    texto('marca', 80), texto('modelo', 80),
    texto('patente', 15).toUpperCase().matches(/^[A-Z0-9 -]{3,15}$/).withMessage('Patente inválida.'),
    body('anio').isInt({ min: 1900, max: new Date().getFullYear() + 1 }).withMessage('Año inválido.').toInt(),
    body('capacidad_carga').isFloat({ gt: 0, max: 9999999999.99 }).withMessage('Ingresá una capacidad positiva.').toFloat(),
];
export const conductorValido = () => [
    texto('nombre', 80), texto('apellido', 80),
    texto('documento', 20).matches(/^\d{6,20}$/).withMessage('El documento debe contener entre 6 y 20 dígitos.'),
    texto('numero_licencia', 30).toUpperCase(),
    fecha('fecha_alta_licencia'), fecha('fecha_vencimiento_licencia'),
    body('fecha_vencimiento_licencia').custom((v, { req }) => v > req.body.fecha_alta_licencia)
        .withMessage('El vencimiento debe ser posterior al alta.'),
];
export const viajeValido = () => [
    body('vehiculo_id').isInt({ min: 1, max: 4294967295 }).withMessage('Seleccioná un vehículo.').toInt(),
    body('conductor_id').isInt({ min: 1, max: 4294967295 }).withMessage('Seleccioná un conductor.').toInt(),
    fechaHora('fecha_salida'), fechaHora('fecha_llegada'),
    body('fecha_llegada').custom((v, { req }) => Number.isFinite(Date.parse(v)) && Date.parse(v) >= Date.parse(req.body.fecha_salida))
        .withMessage('La llegada no puede ser anterior a la salida.'),
    texto('origen', 120), texto('destino', 120),
    body('kilometros').isFloat({ gt: 0, max: 9999999999.99 }).withMessage('Ingresá kilómetros positivos.').toFloat(),
    body('observaciones').optional().isString().bail().trim().isLength({ max: 1000 }).withMessage('Máximo 1000 caracteres.'),
];
export const filtroViajesValido = () => [
    query('vehiculo_id').optional().isInt({ min: 1, max: 4294967295 }).withMessage('Vehículo inválido.').toInt(),
    query('conductor_id').optional().isInt({ min: 1, max: 4294967295 }).withMessage('Conductor inválido.').toInt(),
];
