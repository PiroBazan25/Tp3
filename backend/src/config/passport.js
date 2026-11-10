import passport from 'passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { config } from './env.js';
import { buscarPorId } from '../models/usuarios.js';

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

export default passport;
