import l from '../../../common/logger';
import db from './testResults.db.service.js';

class TestResultsService {
  getABTestResults() {
    return new Promise( async (resolve, reject) => {
        let criteria = {
          
        }  
        let options = {

        }
        let projection = {

        }
        try {
            let data = await db.all(criteria, projection, options);
            resolve(data);
        }
        catch(e) {
            console.log(e);
            reject(e);
        }
    })
  }

  byId(id) {
    l.info(`${this.constructor.name}.byId(${id})`);
    return db.byId(id);
  }

  create(name) {
    return db.insert(name);
  }
}

export default new TestResultsService();
