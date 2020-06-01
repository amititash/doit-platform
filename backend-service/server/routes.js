import examplesRouter from './api/controllers/examples/router';
import usersRouter from './api/controllers/users/router';
import storiesRouter from './api/controllers/kos/router';
import adminRouter from './api/controllers/admin/router';

export default function routes(app) {
  app.get('/ping', (req, res) => {
    res.status(200).send({
      reply : "pong"
    })
  })
  app.use('/api/v1/examples' , examplesRouter);
  app.use('/api/v1/users', usersRouter);
  app.use('/api/v1/kos', storiesRouter);
  app.use('/api/v1/admin' , adminRouter)
}
