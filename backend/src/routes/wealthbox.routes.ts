import { Router } from 'express';
import { wealthboxController } from '../controllers/wealthbox.controller';

const router = Router();

router.get('/contacts', wealthboxController.getContacts);
router.get('/contacts/all', wealthboxController.getAllContacts);
router.get('/tasks/:id', wealthboxController.getTask);

export default router; 