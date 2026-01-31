import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { ensureAuthenticated } from '../middlewares/ensureAuthenticated';

const routes = Router();

routes.post('/register', AuthController.register);
routes.post('/login', AuthController.login);

// Protected routes
routes.get('/profile', ensureAuthenticated, AuthController.getProfile);
routes.patch('/avatar', ensureAuthenticated, AuthController.updateAvatar);

export { routes };
