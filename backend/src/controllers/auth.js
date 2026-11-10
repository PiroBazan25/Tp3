import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import { crearUsuario, buscarPorEmail } from '../models/usuarios.js';
import { ErrorHttp } from '../middlewares/errores.js';

function sesion(usuario) {
    const token = jwt.sign({}, config.jwtSecret, {
        subject: String(usuario.id), expiresIn: '4h', algorithm: 'HS256',
        issuer: 'tp3-transporte', audience: 'tp3-frontend',
    });
    return { token, usuario: { id: usuario.id, nombre: usuario.nombre, email: usuario.email } };
}

export async function registrar(req, res) {
    const { nombre, email, contrasena } = req.body;
    const hash = await bcrypt.hash(contrasena, 12);
    const usuario = await crearUsuario(nombre, email, hash);
    res.status(201).json(sesion(usuario));
}

export async function ingresar(req, res) {
    const usuario = await buscarPorEmail(req.body.email);
    const coincide = usuario && await bcrypt.compare(req.body.contrasena, usuario.contrasena);
    if (!coincide) throw new ErrorHttp(401, 'Email o contraseña incorrectos.');
    res.json(sesion(usuario));
}
