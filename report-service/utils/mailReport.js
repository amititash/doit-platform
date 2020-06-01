const axios = require('axios');

const sendPdfMail = (base64attachment, receiverEmail) => {
    return new Promise( async(resolve, reject) => {
        let mailUrl = `${process.env.NOTIFICATION_API_URL}/send-pdf-email`;
        let mailData = {
            to : [`${receiverEmail}`],
            from : "engineering@startiq.org",
            subject : "A/B Testing Report",
            templateId : "d-f8b5a2347aec48bebbb25cb224fd1e1f",
            content : base64attachment
        }
        try {
            await axios.post(mailUrl, mailData);
            resolve(true);
        }
        catch(e) {
            reject(e);
        }
    })
}


module.exports = {
    sendPdfMail
}