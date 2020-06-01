const winston = require('winston');
require('winston-mongodb');

const Logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
      winston.format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss'
      }),
      winston.format.json(),
    ),
    defaultMeta: { service: 'bot-service' },
    transports: [
      //
      // - Write to all logs with level `info` and below to `combined.log` 
      // - Write all logs error (and below) to `error.log`.
      //
      new winston.transports.MongoDB({ db : `${process.env.LOGGER_MONGOURI}` , collection : 'errors', level: 'error' }),
      new winston.transports.MongoDB({ db : `${process.env.LOGGER_MONGOURI}` , collection : 'logs'})
    ]
  });
   



module.exports = Logger;