import { Router } from 'express';
import { TransactionController } from '../controllers/TransactionController';
import { ensureAuthenticated } from '../middlewares/ensureAuthenticated';

const routes = Router();

routes.use(ensureAuthenticated);

routes.post('/', TransactionController.create);
routes.get('/', TransactionController.list);
routes.get('/dashboard', TransactionController.getDashboard);

export { routes };
