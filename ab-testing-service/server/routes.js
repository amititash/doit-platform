import examplesRouter from './api/controllers/examples/router';
import testResultsRouter from './api/controllers/testResults/router';

export default function routes(app) {
  app.use('/api/v1/examples', examplesRouter);
  app.use('/api/v1/', testResultsRouter)
}
