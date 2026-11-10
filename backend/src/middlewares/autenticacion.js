import passport from '../config/passport.js';

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
