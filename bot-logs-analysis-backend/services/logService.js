const Log = require('../models/log');

const service = {};

service.getLogs = function(criteria, projection, options) {
    return Log.find(criteria, projection, options);
}

service.getLogsCount = function(criteria, projection, options) {
    return Log.count(criteria, projection, options);
}



module.exports = service;
