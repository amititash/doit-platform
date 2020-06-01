import * as express from 'express';
import controller from './controller';

export default express
  .Router()
  .post('/', controller.createUser)
  .get('/', controller.getUser)
  .get('/allUsers', controller.getAllUsers)
  .delete('/', controller.deleteUser)
  .patch('/', controller.updateUserByEmail)
  .get('/byEmail', controller.getUserByEmail)
  .get('/all', controller.getAllUsers)
  .post('/founderquiz/creativityScore', controller.storeCreativityScore)
  .post('/setBotFlowMode', controller.setBotFlowMode)
  .get('/getBotFlowMode', controller.getBotFlowMode)
  .get('/assignRandomBotFlowMode', controller.assignRandomBotFlowMode)