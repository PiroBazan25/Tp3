import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import passport from 'passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { config } from './env.js';
import { crearUsuario, buscarPorEmail, buscarPorId } from './usuarios.js';
import { ErrorHttp } from './errores.js';
import { usuarioValido, loginValido, validar } from './validaciones.js';

passport.use(new Strategy({
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: config.jwtSecret,
    algorithms: ['HS256'],
    issuer: 'tp3-transporte',
    audience: 'tp3-frontend',
}, async (payload, done) => {
    try {
        if (!/^\d+$/.test(String(payload.sub))) return done(null, false);
        const usuario = await buscarPorId(payload.sub);
        if (!usuario) return done(null, false, { estado: 403 });
        return done(null, usuario);
    } catch (error) {
        return done(error);
    }
}));



export function autenticar(req, res, next) {
    passport.authenticate('jwt', { session: false }, (error, usuario, info) => {
        if (error) return next(error);
        if (!usuario) {
            const estado = info?.estado === 403 ? 403 : 401;
            return res.status(estado).json({ mensaje: estado === 403
                ? 'Tu cuenta ya no tiene acceso.' : 'Iniciá sesión. El token falta, venció o no es válido.' });
        }
        req.user = usuario;
        next();
    })(req, res, next);
}

function sesion(usuario) {
    const token = jwt.sign({}, config.jwtSecret, {
        subject: String(usuario.id), expiresIn: '4h', algorithm: 'HS256',
        issuer: 'tp3-transporte', audience: 'tp3-frontend',
    });
    return { token, usuario: { id: usuario.id, nombre: usuario.nombre, email: usuario.email } };
}

async function registrar(req, res) {
    const { nombre, email, contrasena } = req.body;
    const hash = await bcrypt.hash(contrasena, 12);
    const usuario = await crearUsuario(nombre, email, hash);
    res.status(201).json(sesion(usuario));
}

async function ingresar(req, res) {
    const usuario = await buscarPorEmail(req.body.email);
    const coincide = usuario && await bcrypt.compare(req.body.contrasena, usuario.contrasena);
    if (!coincide) throw new ErrorHttp(401, 'Email o contraseña incorrectos.');
    res.json(sesion(usuario));
}

const router = Router();
router.post('/registro', usuarioValido(), validar, registrar);
router.post('/login', loginValido(), validar, ingresar);
router.get('/yo', autenticar, (req, res) => res.json(req.user));
export default router;

export { passport };
