import { Router } from 'express';
import * as controller from '../controllers/vehiculos.js';
import { idValido, listaValida, vehiculoValido, validar } from '../middlewares/validaciones.js';

const router = Router();
router.get('/', listaValida(), validar, controller.listar);
router.get('/:id', idValido(), validar, controller.obtener);
router.post('/', vehiculoValido(), validar, controller.crear);
router.put('/:id', idValido(), vehiculoValido(), validar, controller.actualizar);
router.delete('/:id', idValido(), validar, controller.eliminar);
export default router;
