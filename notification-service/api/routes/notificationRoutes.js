const express = require("express");
const router = express.Router();
const validate = require('express-validation');
const validations = require('./notificationValidation');
const NotificationController = require('../controllers/notificationController');

router.post('/send-email', validate(validations.verifySendEmail), async(req, res) => {
    NotificationController.sendMail(req.body)
        .then ( response => {
            console.log("success");
            res.status(200).send({
                success : "mail was sent"
            })
        })
        .catch(err => {
            console.log(err);
            res.status(500).send({
                error : err.message
            })
        })
})


router.post('/send-pdf-email',  async(req, res) => {
    NotificationController.sendPdfMail(req.body)
        .then ( response => {
            console.log("success");
            res.status(200).send({
                success : "mail was sent"
            })
        })
        .catch(err => {
            console.log(err);
            res.status(500).send({
                error : err.message
            })
        })
})




module.exports = router;