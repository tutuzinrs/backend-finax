import { Router } from 'express';
import { UploadController, upload } from '../controllers/UploadController';
import { ensureAuthenticated } from '../middlewares/ensureAuthenticated';

const router = Router();

// Upload avatar (requires authentication)
router.post('/avatar', ensureAuthenticated, upload.single('avatar'), UploadController.uploadAvatar);

export default router;
