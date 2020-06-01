const Users = require('../models/user');




class UsersDatabase {
    constructor() {

    }

    updateOne(criteria, projection, options) {
      return Users.findOneAndUpdate(criteria, projection, options);
    }  
  
    findOne(criteria, projection, options) {
      return Users.findOne(criteria, projection, options);
    }

    findMany(criteria, projection, options) {
      return Users.find(criteria,projection, options);
    }

    deleteOne(criteria, projection, options) {
      return Users.findOneAndDelete(criteria, projection, options);
    }
  
    insertOne(objToSave) {
        let newUser = new Users(objToSave);
        return newUser.save();
    }
  }
  
  export default new UsersDatabase();
  