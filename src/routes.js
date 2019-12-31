import { Router } from 'express';
import multer from 'multer';

import multerConfig from './config/multer';

import authMiddleware from './app/middlewares/auth';

import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';
import StudentController from './app/controllers/StudentController';
import PlanController from './app/controllers/PlanController';
import FileController from './app/controllers/FileController';
import RegistrationController from './app/controllers/RegistrationController';
import HelpOrderController from './app/controllers/HelpOrderController';
import AnswerController from './app/controllers/AnswerController';
import NotificationController from './app/controllers/NotificationController';
import CheckinController from './app/controllers/CheckinController';

const routes = new Router();
const upload = multer(multerConfig);

routes.post('/users', UserController.store);
routes.post('/sessions', SessionController.store);

routes.get('/students/:id/help-orders', HelpOrderController.show);
routes.post('/students/:id/help-orders', HelpOrderController.store);
routes.post('/students/:id/checkins', CheckinController.store);
routes.get('/students/:id/checkins', CheckinController.index);

routes.use(authMiddleware);

routes.post('/files', upload.single('file'), FileController.store);
routes.put('/users', UserController.update);

routes.get('/students', StudentController.index);
routes.post('/students', StudentController.store);
routes.get('/students/:id', StudentController.show);
routes.put('/students/:id', StudentController.update);
routes.delete('/students/:id', StudentController.delete);

routes.get('/help-orders', HelpOrderController.index);
routes.post('/help-orders/:id/answer', AnswerController.store);

routes.get('/registrations', RegistrationController.index);
routes.post('/registrations', RegistrationController.store);
routes.get('/registrations/:id', RegistrationController.show);
routes.put('/registrations/:id', RegistrationController.update);
routes.delete('/registrations/:id', RegistrationController.delete);

routes.get('/plans', PlanController.index);
routes.post('/plans', PlanController.store);
routes.get('/plans/:id', PlanController.show);
routes.put('/plans/:id', PlanController.update);
routes.delete('/plans/:id', PlanController.delete);

routes.get('/notifications', NotificationController.index);
routes.put('/notifications/:id', NotificationController.update);

export default routes;
