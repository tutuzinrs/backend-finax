import { Router } from 'express';
import { CategoryController } from '../controllers/CategoryController';
import { ensureAuthenticated } from '../middlewares/ensureAuthenticated';

const routes = Router();

routes.use(ensureAuthenticated);

routes.post('/', CategoryController.create);
routes.get('/', CategoryController.list);

export { routes };
