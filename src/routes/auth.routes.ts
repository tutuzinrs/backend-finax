import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { ensureAuthenticated } from '../middlewares/ensureAuthenticated';

const routes = Router();

// Public routes
routes.post('/register', AuthController.register);
routes.post('/login', AuthController.login);
routes.post('/forgot-password', AuthController.forgotPassword);
routes.post('/reset-password', AuthController.resetPassword);

// Protected routes
routes.get('/profile', ensureAuthenticated, AuthController.getProfile);
routes.put('/profile', ensureAuthenticated, AuthController.updateProfile);
routes.patch('/avatar', ensureAuthenticated, AuthController.updateAvatar);

export { routes };
