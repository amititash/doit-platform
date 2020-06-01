import l from '../../common/logger';
import db from './companies.db.service';

class CompaniesService {
  

  updateCompany(criteria, projection, options) {
    return db.updateOne(criteria,projection, options);
  }

  getCompany(criteria, projection, options) {
    return db.findOne(criteria, projection, options);
  }

  getAllCompanies(criteria, projection, options) {
    return db.findMany(criteria, projection, options);
  }

  deleteCompany(criteria, projection, options) {
    return db.deleteOne(criteria, projection, options);
  }

  createCompany(objToSave) {
    return db.insertOne(objToSave);
  }
}

export default new CompaniesService();
