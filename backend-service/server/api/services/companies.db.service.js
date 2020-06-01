const Companies = require('../models/company');




class CompaniesDatabase {
    constructor() {

    }

    updateOne(criteria, projection, options) {
      return Companies.findOneAndUpdate(criteria, projection, options);
    }  
  
    findOne(criteria, projection, options) {
      return Companies.findOne(criteria, projection, options);
    }

    findMany(criteria, projection, options) {
      return Companies.find(criteria,projection, options);
    }

    deleteOne(criteria, projection, options) {
      return Companies.findOneAndDelete(criteria, projection, options);
    }
  
    insertOne(objToSave) {
        let newCompany = new Companies(objToSave);
        return newCompany.save();
    }
  }
  
  export default new CompaniesDatabase();
  