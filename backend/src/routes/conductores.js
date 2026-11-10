import { Router } from 'express';
import * as controller from '../controllers/conductores.js';
import { idValido, listaValida, conductorValido, validar } from '../middlewares/validaciones.js';

const router = Router();
router.get('/', listaValida(), validar, controller.listar);
router.get('/:id', idValido(), validar, controller.obtener);
router.post('/', conductorValido(), validar, controller.crear);
router.put('/:id', idValido(), conductorValido(), validar, controller.actualizar);
router.delete('/:id', idValido(), validar, controller.eliminar);
export default router;
