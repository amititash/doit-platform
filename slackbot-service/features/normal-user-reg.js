const store = require('../store/store');
const axios = require('axios');
const userProfile = require('../utils/userProfile');
const Logger = require('../utils/Logger');
const { BotkitConversation } = require('botkit');



// USER REGISTRATION HAPPENS HERE

module.exports = function(controller) {
    let userInfo = {};
    let slackInfo = {};

    const DIALOG_ID = 'user-reg-dialog';
    let convo = new BotkitConversation(DIALOG_ID, controller);


    convo.before("default", async(convo, bot) => {
        // Set enforceFounderquiz to true. This will allow us to distinguish between founderquiz flow for new user vs. founderquiz update for old user
        convo.setVar("enforceFounderquiz" , true); 
        let slackUserId = convo.step.values.user;
        Logger.log({
            level : "info",
            message : "START of conversation : USER REGISTRATION",
            metadata : {
                convo : true,
                userId : store.get(slackUserId)
            }
        });

      
        convo.setVar("slack_user_id", convo.step.values.user);
        try {
            slackInfo = await userProfile.slackUserProfile(slackUserId);
            userInfo.username = (slackInfo.userRealName ? slackInfo.userRealName : slackInfo.userDisplayName );
            userInfo.email = slackInfo.userEmail;
            store.set(slackUserId, userInfo.email);
            convo.setVar("user_name", userInfo.username);
            convo.setVar("user_email", userInfo.email);
        }
        catch(e){
            console.log("error fetching slack data", e);
            Logger.log({
                level : "error",
                message : e.message,
                metadata : {
                    userId : store.get(convo.vars.slack_user_id),
                    location : "user registration"
                }
            })
            return await convo.gotoThread("error_thread");
        }

    })

    convo.addMessage({
        text : "Hello there! I am here to help you develop your business ideas. 🤖",
        action : "mail_thread"
    },"default");




    
    

    convo.before("mail_thread", async (convo, bot) => {
        let slackUserId = convo.step.values.user;
        let mailUrl = `${process.env.NOTIFICATION_API_URL}/send-email`;
        let mailData = {
            to : [store.get(slackUserId)],
            from : "engineering@startiq.org",
            subject : "StartiQ",
            templateId : "d-3f394acc5fa64c64bc11f11cc9213427",
            dynamic_template_data : {
                name : userInfo.username
            }
        }
        try {
            await axios.post(mailUrl, mailData);
        }
        catch(e){
            console.log("email not sent");
            Logger.log({
                level : "error",
                message : e.message,
                metadata : {
                    userId : store.get(convo.vars.slack_user_id),
                    location : "user registration"
                }
            })
            console.log(e);
        }
    })

    convo.addAction("user_reg_complete_thread" , "mail_thread");




    convo.before("user_reg_complete_thread", async (convo, bot) => {
        let url = `${process.env.BACKEND_API_URL}/api/v1/users`;
        let data = userInfo;
        try {
            await axios.post(url, data);
        }
        catch(e) {
            console.log("user not saved in the database" , e.message);
            Logger.log({
                level : "error",
                message : e.message,
                metadata : {
                    userId : store.get(convo.vars.slack_user_id),
                    location : "user registration"
                }
            })
        }
    });





    convo.addChildDialog("founderquiz-dialog", '', "user_reg_complete_thread");


    convo.addAction("complete", "user_reg_complete_thread");


    convo.addMessage({
        text : "Some error occurred in registration. Try again later."
    },"error_thread");

    convo.after(async (results, bot) => {
        Logger.log({
            level : "info",
            message : "END of conversation : USER REGISTRATION",
            metadata : {
                convo : false,
                userId : store.get(results.user)
            }
        });

    })

    controller.addDialog(convo);

    

    controller.on('message, direct_message', async (bot, message) => {
        if(!store.get(message.user)){
            //This dialog will only run when user not present in users.json. That is signup flow. 
            Logger.log({
                level : "info",
                message : "START of conversation : USER REGISTRATION",
                metadata : {
                    convo : true,
                    userId : store.get(message.user)
                }
            });
            await bot.beginDialog(DIALOG_ID);
        }
    })
}