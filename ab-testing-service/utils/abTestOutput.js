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
        const fields = ['UserID', 'Randomly Assigned Condition', 'FounderQuiz Score' , 'Deepdive' , 'Ideastorm', 'Full (Deepdive*Ideastorm)', 'Number of Ideas Submitted' ];
        const opts = { fields };
        try {
            const csv = parse(jsonObj, opts);
            console.log(csv);
            await sendMail(csv , receiverEmail);
            // fs.writeFile("./output.csv", csv, function(err) {
            //     if(err) {
            //         return console.log(err);
            //     }
            // }); 
        } catch (err) {
            console.error(err);
        }
    })
}

const generateJSONOutput = (users, receiverEmail) => {
    return new Promise( async (resolve, reject) => {
        let axiosPromises = [];
        users.forEach( (element) => {
            let url = `${process.env.BACKEND_API_URL}/api/v1/kos/numberOfSubmittedIdeas?emailId=${element.email}`
            axiosPromises.push(axios.get(url));
        });
        let responseArray = [];
        try {
            responseArray = await Promise.all(axiosPromises);
        }
        catch(e){
            console.log(e);
            return reject(e);
        }
        let outputJSON = [];
        responseArray.forEach((element , index)=> {
            let user1 = users[index];
            let user = user1.toObject();
            let randomlyAssignedCondition = "";
            let deepdive = 0 , ideastorm = 0;
            let numberOfIdeasSubmitted =  0;
            numberOfIdeasSubmitted = element.data.numberOfSubmittedIdeas;
            switch(user.botFlowMode) {
                case "both" : 
                    randomlyAssignedCondition = "D";
                    deepdive = 1;
                    ideastorm = 1;
                    break;
                case "deepdive":
                    randomlyAssignedCondition = "B";
                    deepdive = 1;
                    break;
                case "ideastorm":
                    randomlyAssignedCondition = "C";
                    ideastorm = 1;
                    break;
                case "none":
                    randomlyAssignedCondition = "A";
                    break;
                default : 
                    randomlyAssignedCondition = "not assigned"
                    deepdive = "NA";
                    ideastorm = "NA";
                    break;
            }
      
            let objToPush = {
                "UserID" : user.email,
                "Randomly Assigned Condition" : randomlyAssignedCondition,
                "FounderQuiz Score" : user.creativityScore,
                "Deepdive" : deepdive,
                "Ideastorm" : ideastorm,
                "Full (Deepdive*Ideastorm)" : deepdive * ideastorm,
                "Number of Ideas Submitted" : numberOfIdeasSubmitted 
            } 
            outputJSON.push(objToPush);  
        });
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