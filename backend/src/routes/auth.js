import { Router } from 'express';
import { registrar, ingresar } from '../controllers/auth.js';
import { usuarioValido, loginValido, validar } from '../middlewares/validaciones.js';
import { autenticar } from '../middlewares/autenticacion.js';

const router = Router();
router.post('/registro', usuarioValido(), validar, registrar);
router.post('/login', loginValido(), validar, ingresar);
router.get('/yo', autenticar, (req, res) => res.json(req.user));
export default router;
