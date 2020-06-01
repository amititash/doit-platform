import l from '../../common/logger';
import db from './users.db.service';
import usersDbService from './users.db.service';
const RandomBotFlowSetter = require('../../utils/randomBotFlow');


class UsersService {


  assignRandomBotFlowMode(payload){
    return new Promise( async(resolve, reject) => {
      let botFlowMode = "";
      try {
        botFlowMode = RandomBotFlowSetter();
      }
      catch(e){
        console.log(e);
        reject(e);
      }
      resolve(botFlowMode);
    })
  }


  getBotFlowMode(payload) {
    return new Promise( async(resolve, reject) => {
      let botFlowMode = "";
      let criteria = {
        email : payload.emailId
      }
      let projection = {

      }
      let options = {

      }
      try {
        let user = await usersDbService.findOne(criteria, projection, options);
        if(!user){
          throw new Error("No such user exists");
        }
        botFlowMode = user.botFlowMode;
      }
      catch(e) {
        console.log(e);
        reject(e);
      }
      resolve({botFlowMode : botFlowMode});
    })
  }


  setBotFlowMode(payload) {
    // if no botflowmode is sent , this sets it randomly
    return new Promise( async(resolve, reject) => {
      let botFlowMode = "";
      let criteria = {
        email : payload.emailId
      }
      let updateObj = {};
      if(payload.botFlowMode){
        botFlowMode = payload.botFlowMode;
      }
      else {
        botFlowMode = RandomBotFlowSetter();
      }
      updateObj = {
        "$set" : {
          botFlowMode
        }
      }
      let options = {
        new : true
      }
      let updatedUser = {};
      try {
        updatedUser = await usersDbService.updateOne(criteria, updateObj, options);
      }
      catch(e){
        console.log(e);
        reject(e);
      }
      resolve(updatedUser);
    })
  }
  

  updateUser(criteria, projection, options) {
    return db.updateOne(criteria,projection, options);
  }

  getUser(criteria, projection, options) {
    return db.findOne(criteria, projection, options);
  }

  getAllUsers(criteria, projection, options) {
    // return db.findMany(criteria, projection).skip(options.page_size * (options.page_num - 1)).limit(options.page_size)
    return db.findMany(criteria, projection, options);
  }

  deleteUser(criteria, projection, options) {
    return db.deleteOne(criteria, projection, options);
  }

  createUser(objToSave) {
    return new Promise( async(resolve, reject) => {
      let data = {};
      let criteria = {
        email : objToSave.email
      }
      let projection = {

      }
      let options = {

      }
      try {
        let user = await db.findOne(criteria, projection, options);
        if(user){
          reject(new Error("user already exists in the database"));
        }
        else {
          data = await db.insertOne(objToSave)
        }
      }
      catch(e){
        console.log(e);
        reject(e);
      }
      resolve(data);
    })
  }

  storeCreativityScore(payload) {
    return new Promise( async (resolve, reject) => {
      let scoresArray = payload.creativityScores;
      let numberOfData = scoresArray.length;
      try {
        let sum = scoresArray.reduce( (a,b) => a+b, 0);
        let average = sum/numberOfData;
        average = (average ? average.toFixed(2) : 0 );
        let criteria = {
          email : payload.emailId
        }
        let update = {
          $set : {
            creativityScore : average
          }
        }
        let options = {
          new : true,
          // upsert : true
        }
        let updatedUserObj = await db.updateOne(criteria, update, options);
        resolve({
          average ,
          updatedUserObj
        });
      } 
      catch(e) {
        console.log(e);
        reject(e);
      }
    })
  }
}

export default new UsersService();
