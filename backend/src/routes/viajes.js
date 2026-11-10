import { Router } from 'express';
import * as controller from '../controllers/viajes.js';
import { idValido, filtroViajesValido, viajeValido, validar } from '../middlewares/validaciones.js';

const router = Router();
router.get('/', filtroViajesValido(), validar, controller.listar);
router.get('/:id', idValido(), validar, controller.obtener);
router.post('/', viajeValido(), validar, controller.crear);
router.put('/:id', idValido(), viajeValido(), validar, controller.actualizar);
router.delete('/:id', idValido(), validar, controller.eliminar);
export default router;
