import { Router } from 'express';
import { WealthboxController } from '../controllers/wealthbox.controller';

const router = Router();
const controller = new WealthboxController();

// Contacts routes
router.get('/contacts', controller.getContacts.bind(controller));
router.get('/contacts/all', controller.getAllContacts.bind(controller));

export default router; 