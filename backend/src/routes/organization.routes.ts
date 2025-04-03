import { Router } from 'express';
import { organizationController } from '../controllers/organization.controller';

const router = Router();

router.get('/', organizationController.getAllOrganizations);
router.post('/', organizationController.createOrganization);
router.put('/:id', organizationController.updateOrganization);
router.delete('/:id', organizationController.deleteOrganization);
router.get('/:id/users', organizationController.getOrganizationUsers);
router.get('/:id/stats', organizationController.getOrganizationStats);

export default router; 