const logService = require('../services/logService.js');


const controller = {};

controller.fetchFilteredLogs = function(payloadData) {
    console.log(payloadData);
    return new Promise( async (resolve, reject) => {
        let criteria = {};
        let projection = {};
        let start = Number(payloadData._start);
        let end = Number(payloadData._end);
        if(payloadData.emailId) {
            criteria["meta.userId"] = payloadData.emailId
        }
        let options = {
            sort : {
                timestamp : 1
            },
            skip : start,
            limit : end-start
        }
        let logCount = 0;
        let logs = [];
        try {
            logCount = await logService.getLogsCount({});
            logs = await logService.getLogs(criteria, projection, options);
        }
        catch(e){
            console.log(e);
            throw e;
        }
        resolve({
            logs,
            logCount
        })
    })

}

module.exports = controller;
