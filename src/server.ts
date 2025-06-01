import express, { NextFunction, Request, Response } from 'express';
import './models';
import { RegisterRoutes } from './routes/routes'; 
import { signInValidationRules } from './validations/auth.validation';
import { validateRequest } from './middlewares/validateRequest';
import swaggerUi from 'swagger-ui-express';
import swaggerDocument from '../dist/swagger.json'; 
import cors from 'cors';
import { testDbConnection } from './config/db';
import { config } from 'dotenv';
import passport from './config/passport';
import cookieParser from 'cookie-parser';
import { errorHandler } from './middlewares/errorHandler';
import { vehicleValidationRules } from './validations/vehicle.validation';
import { customerValidationRules } from './validations/customer.validation';
import authMiddleware from './middlewares/authMiddleware';
import { vinValidationRules } from './validations/vin.validation';

config();

const app = express();
const PORT = process.env.PORT || 3000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());

(async () => {
  await testDbConnection();
})();

app.post(
  '/auth/signin',
  signInValidationRules,
  validateRequest,
  (req: Request, res: Response, next: NextFunction) => {
    next();
  }
);

app.post(
  '/vehicles',
  vehicleValidationRules,
  validateRequest,
  (req: Request, res: Response, next: NextFunction) => {
    next();
  }
);

app.post(
  '/customers',
  customerValidationRules,
  validateRequest,
  (req: Request, res: Response, next: NextFunction) => {
    next();
  }
);

app.get(
  '/vin',
  vinValidationRules,
  validateRequest,
  (req: Request, res: Response, next: NextFunction) => {
    next();
  }
);

RegisterRoutes(app);

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get('/swagger.json', (_req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerDocument);
});

app.get('/', (req: Request, res: Response) => {
  res.send('Hello TypeScript with Express!');
});

app.get('/protected', passport.authenticate('jwt', { session: false }), (req, res) => {
  res.json({ message: 'You are authenticated', user: req.user });
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
  console.log(`Swagger docs at http://localhost:${PORT}/docs`);
});