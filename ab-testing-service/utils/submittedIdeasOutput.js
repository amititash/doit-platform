const axios = require('axios');
const { parse } = require('json2csv');
const fs = require('fs');




const sendMail = (csv, receiverEmail) => {
    return new Promise( async(resolve, reject) => {
        let base64csv = Buffer.from(csv).toString('base64');
        let mailUrl = `${process.env.NOTIFICATION_API_URL}/send-email`;
        let mailData = {
            to : [`${receiverEmail}`],
            from : "engineering@startiq.org",
            subject : "A/B Testing Report",
            templateId : "d-f8b5a2347aec48bebbb25cb224fd1e1f",
            content : base64csv
        }
        console.log(mailData);
        try {
            await axios.post(mailUrl, mailData);
            resolve(true);
        }
        catch(e) {
            console.log(e);
            reject(e);
        }
    })
}

const generateCsv = (jsonObj, receiverEmail) => {
    return new Promise( async(resolve, reject) => {
        const fields = ['UserID', 'Condition', 'SubmittedIdeaID' , 'Date' , 'SubmittedIdeaText_Name', 'SubmissionQ1', 'SubmissionQ2', 'SubmissionQ3' ,'SubmissionQ4' ];
        const opts = { fields };
        try {
            const csv = parse(jsonObj, opts);
            console.log(csv);
            await sendMail(csv, receiverEmail);
            // fs.writeFile("./output2.csv", csv, function(err) {
            //     if(err) {
            //         return console.log(err);
            //     }
            // }); 
        } catch (err) {
            console.error(err);
        }
    })
}

const generateJSONOutput = (submittedIdeas, receiverEmail) => {
    return new Promise( async (resolve, reject) => {
        let outputJSON = [];
        console.log(submittedIdeas);
        submittedIdeas.forEach((element) => {
            let condition = "";
            switch(element.submissionBotFlowMode) {
                case "both" : 
                    condition = "D";
                    break;
                case "deepdive":
                    condition = "B";
                    break;
                case "ideastorm":
                    condition = "C";
                    break;
                case "none":
                    condition = "A";
                    break;
                default : 
                    condition = "not assigned"
                    break;
            }
            let objToPush = {
                "UserID" : element.ideaOwner,
                "Condition" : condition,
                "SubmittedIdeaID" : element._id,
                "Date" : element.submissionDate,
                "SubmittedIdeaText_Name" : element.ideaName || element.ideaDescription,
                "SubmissionQ1" : element.bizcompApplication.q1,
                "SubmissionQ2" : element.bizcompApplication.q2,
                "SubmissionQ3" : element.bizcompApplication.q3,
                "SubmissionQ4" : element.bizcompApplication.q4
            }
            outputJSON.push(objToPush);
        })
        
        resolve(outputJSON);
        try {
            await generateCsv(outputJSON, receiverEmail);
        }
        catch(e){
            console.log(e);
        }
    })
}






module.exports = {
    generateJSONOutput
}