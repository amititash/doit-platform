const axios = require('axios');
require('dotenv').config();
const store = require('../store/store');





const sendMail = (idea_name, userEmailId, receiverEmail) => {
    return new Promise( async(resolve, reject) => {
        let mailUrl = `${process.env.NOTIFICATION_API_URL}/send-email`;
        let mailData = {
            to : [`${receiverEmail}`],
            from : "engineering@startiq.org",
            subject : "Idea Report",
            body : `You can check out the idea report here : ${process.env.FRONTEND_API_URL}/report?idea=${idea_name}&email=${userEmailId}`,
            // templateId : "d-f8b5a2347aec48bebbb25cb224fd1e1f",
            // dynamic_template_data : {
            //     name : ''
            // }
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


const generateReport = (ko_id, receiverEmailId) => {
    // return new Promise( async(resolve, reject) => {
    //     let user = {};
    //     let ko = {};
    //     let base64pdf = ``;
    //     let userUrl = `${process.env.BACKEND_API_URL}/api/v1/users/byEmail?emailId=${userEmailId}`
    //     let KoUrl = `${process.env.BACKEND_API_URL}/api/v1/kos/ko?id=${koId}`;
    //     let reportApiUrl = `${process.env.REPORT_API_URL}/report`;
    //     try {
    //         let userResponse = await axios.get(userUrl);
    //         let koResponse = await axios.get(KoUrl);
    //         user = userResponse.data[0];
    //         ko = koResponse.data;
    //         let reportApiData = {
    //             receiverEmail : receiverEmailId,
    //             user : user,
    //             ko : ko,
    //             processedKo
    //         }
    //         let reportApiResponse = await axios.post(reportApiUrl, reportApiData);
    //         base64pdf = reportApiResponse.data.base64pdf;
    //     }
    //     catch(e){
    //         reject(e);
    //     }
    //     resolve({base64pdf});
    // })
}

module.exports = {
    generateReport,
    sendMail
}
