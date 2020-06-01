import * as express from 'express';
import controller from './controller';

export default express
  .Router()
//   .post('/', controller.create)
  .get('/getABTestOutput', controller.getABTestResults)
  .get('/getSubmittedIdeaOutput' , controller.getSubmittedIdeaOutput)
//   .get('/:id', controller.byId);
