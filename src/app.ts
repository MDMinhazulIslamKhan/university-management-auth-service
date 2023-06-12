import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import { UserRouters } from './app/modules/users/user.route';
import globalErrorHandler from './app/middleware/globalErrorHandler';

const app: Application = express();

app.use(cors());

// parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Testing
app.get('/', (req: Request, res: Response) => {
  // throw new ApiError(400, 'Throwing error');
  // Promise.reject(new Error('Rejection check'));
  res.send('Working Successfully');
});

// application routes
app.use('/api/v1/users/', UserRouters);

app.use(globalErrorHandler);

export default app;
