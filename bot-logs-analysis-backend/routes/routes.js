const express = require("express");
const router = express.Router();
const LogController = require('../controllers/logController');


router
    .get('/logs', async (req, res) => {
        let data = {}
        try {
            data = await LogController.fetchFilteredLogs(req.query);
        }
        catch(e){
            console.log(e.message);
            res.send({
                error : e.message
            })
        }
        let logs = data.logs;
        let logCount = data.logCount;
        res.set('X-Total-Count', logCount);
        res.set('Access-Control-Expose-Headers' , 'X-Total-Count')
        res.send(logs);
    })


module.exports = router;
