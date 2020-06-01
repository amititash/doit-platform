const sgMail = require('@sendgrid/mail');
const dotenv = require('dotenv');
dotenv.config();
sgMail.setApiKey(process.env.SENDGRID_API_KEY);


const sendPdfMail = (payload)=> {
    return new Promise( async (resolve, reject) => {
        let msg = {};
        console.log("xxxxxxx", payload);
        if(payload.content){
            msg = { 
                to: payload.to,
                from: payload.from,
                subject: payload.subject,
                templateId: payload.templateId,
                dynamic_template_data: payload.dynamic_template_data ,
                attachments : [
                    {
                        content : payload.content,
                        filename : "deepdive_report.pdf",
                        type : "application/pdf",
                        dispostition : "attachment",
                        contentId : "mypdf"
                    }
                ]
            }
        }
        let res = null;
        console.log("msg to be sent: \n", msg);
        try {
            res = await sgMail.send(msg);
        }
        catch(e){
            console.log("Error occurred");
            reject(e);
        }
        resolve(res);
    })
}

const sendMail = (payload) => {
    return new Promise( async (resolve, reject) => {
        let msg = {};
        console.log("xxxxxxx", payload);
        if(payload.content){
            msg = { 
                to: payload.to,
                from: payload.from,
                subject: payload.subject,
                templateId: payload.templateId,
                dynamic_template_data: payload.dynamic_template_data ,
                attachments : [
                    {
                        content : payload.content,
                        filename : "report.csv",
                        type : "text/csv",
                        dispostition : "attachment",
                        contentId : "mycsv"
                    }
                ]
            }
        }
        else if(payload.templateId) {
            msg = {
                to : payload.to,
                from : payload.from,
                subject : payload.subject,
                templateId : payload.templateId,
                dynamic_template_data : payload.dynamic_template_data
            }
        }
        else {
            msg = {
                to : payload.to,
                from : payload.from,
                subject : payload.subject,
                text : payload.body
            }
        }
        let res = null;
        console.log("msg to be sent: \n", msg);
        try {
            res = await sgMail.send(msg);
        }
        catch(e){
            console.log("Error occurred");
            reject(e);
        }
        resolve(res);
    })
}

module.exports = {
    sendMail,
    sendPdfMail
}
