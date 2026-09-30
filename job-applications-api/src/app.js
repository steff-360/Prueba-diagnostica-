import express from 'express';
import applicationRoutes from './routes/applicationRoutes.js';
import { notFoundHandler } from './middlewares/notFound.js';
import { errorHandler } from './middlewares/errorHandler.js';

const app = express();

app.disable('x-powered-by');
app.use(express.json({ limit: '100kb' }));

app.get('/health', (req, res) => {
  res.status(200).json({
    data: {
      status: 'ok'
    }
  });
});

app.use(applicationRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
