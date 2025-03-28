import { Router } from 'express';
import { organizationController } from '../controllers/organization.controller';

const router = Router();

router.get('/', organizationController.getAllOrganizations);
router.get('/:id/users', organizationController.getOrganizationUsers);
router.get('/:id/stats', organizationController.getOrganizationStats);

export default router; 