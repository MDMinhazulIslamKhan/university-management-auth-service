import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import globalErrorHandler from './app/middleware/globalErrorHandler';
import ApplicationRoutes from './app/routes';

const app: Application = express();

app.use(cors());

// cookie parser
app.use(cookieParser());

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
app.use('/api/v1', ApplicationRoutes);

app.use(globalErrorHandler);

// No routes
app.use((req, res) => {
  return res.status(404).json({
    success: false,

    message: 'Not found.',
    errorMessage: {
      path: req.originalUrl,
      message: 'Api not found!!! Wrong url, there is no route in this url.',
    },
  });
});

export default app;
