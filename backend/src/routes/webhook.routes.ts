import { Router } from 'express';
import { webhookController } from '../controllers/webhook.controller';

const router = Router();

router.post('/wealthbox', webhookController.handleWebhook);

export default router; 