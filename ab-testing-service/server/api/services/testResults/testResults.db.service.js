const Users = require('../../models/user');
class TestResultsDatabase {
  
    all(criteria, projection, options) {
        return Users.find(criteria, projection, options);
    }
  
    byId(id) {
      return Promise.resolve(this._data[id]);
    }

    insert(name) {
      const record = {
        id: this._counter,
        name,
      };
  
      this._counter += 1;
      this._data.push(record);
  
      return Promise.resolve(record);
    }
  }
  
  export default new TestResultsDatabase();