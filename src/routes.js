import { Router } from 'express';
import multer from 'multer';

import multerConfig from './config/multer';

import authMiddleware from './app/middlewares/auth';

import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';
import StudentsController from './app/controllers/StudentController';
import PlanController from './app/controllers/PlanController';
import FileController from './app/controllers/FileController';
import HelpOrderController from './app/controllers/HelpOrderController';
import AnswerController from './app/controllers/AnswerController';

const routes = new Router();
const upload = multer(multerConfig);

routes.post('/users', UserController.store);
routes.post('/sessions', SessionController.store);

routes.get('/students/:id/help-orders', HelpOrderController.show);
routes.post('/students/:id/help-orders', HelpOrderController.store);

routes.use(authMiddleware);

routes.post('/files', upload.single('file'), FileController.store);
routes.put('/users', UserController.update);
routes.post('/students', StudentsController.store);
routes.put('/students/:id', StudentsController.update);

routes.get('/help-orders', HelpOrderController.index);
routes.post('/help-orders/:id/answer', AnswerController.store);

routes.get('/plans', PlanController.index);
routes.post('/plans', PlanController.store);
routes.put('/plans/:id', PlanController.update);
routes.delete('/plans/:id', PlanController.delete);

export default routes;
