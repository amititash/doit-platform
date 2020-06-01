const store = require('../store/store');
const axios = require('axios');
const Logger = require('../utils/Logger');
const { BotkitConversation } = require('botkit');


const storeKo = (url, data) => {
    return new Promise( async (resolve, reject) => {
        let savedKo = {};
        try {
            let response = await axios.post(url, data);
            savedKo = response.data;
        }
        catch(e){
            console.log(e);
            reject(e);
        }
        resolve(savedKo);
    })
}

module.exports = function(controller){


    const DIALOG_ID = 'list-ideas-dialog';
    let convo = new BotkitConversation(DIALOG_ID, controller);
    let ideaCount = 0;


    convo.say({
        text: "Type your idea below. Go ahead, we'll research your ideas in the background...✏️",
    });


    convo.ask({
        text: "To stop, type `cancel` any time.",
    },
    [
        {
            pattern : "cancel",
            type : 'string',
            handler : async(res, convo, bot) => {
                return await convo.gotoThread("exit_thread");
            }
        },
        {
            default : true,
            type : 'string',
            handler : async(res, convo, bot) => {
                let slackUserId = convo.step.values.user;
                if(res.length < 75){
                    await bot.say("An idea description should contain a minimum of 75 characters. If you want to stop entering ideas, type `cancel`.")
                    return await convo.repeat();
                }
                let url = `${process.env.BACKEND_API_URL}/api/v1/kos`;
                let data = {
                    ideaOwner : store.get(slackUserId),
                    ideaDescription : res,
                    ideaName : "my-idea"
                }
                console.log(url, data);
                try {
                    const savedKo = await storeKo(url, data);
                    console.log("data was saved successfully");
                }
                catch(e){
                    console.log("some error occurred");
                    Logger.log({
                        level : "error",
                        message : e.message,
                        metadata : {
                            userId : store.get(convo.vars.slack_user_id),
                            intent : "ideastorm intent"
                        }
                    })
                }
                ideaCount ++;
                return await convo.gotoThread("idea_input_thread");
            }
        }
    ])


    convo.addQuestion({
        text : "Your ideas was saved. Thanks."
    },
    [
        {
            pattern : "yes",
            type : 'string',
            handler : async(res, convo, bot) => {
                return await convo.gotoThread("enter_idea_thread")
            }
        },
        {
            pattern : "no",
            type : 'string',
            handler : async(res, convo, bot) => {
                return await convo.gotoThread("exit_thread");
            }
        },
        {
            pattern : "cancel",
            type : 'string',
            handler : async(res, convo, bot) => {
                return await convo.gotoThread("exit_thread");
            }
        },
        {
            default : true,
            type : 'string',
            handler : async(res, convo, bot) => {
                let slackUserId = convo.step.values.user;
                if(res.length < 75){
                    await bot.say("An idea description should contain a minimum of 75 characters. If you want to stop entering ideas, type `cancel`.")
                    return await convo.repeat();
                }
                let url = `${process.env.BACKEND_API_URL}/api/v1/kos`;
                let data = {
                    ideaOwner : store.get(slackUserId),
                    ideaDescription : res,
                    ideaName : "my-idea"
                }
                console.log(url , data);
                try {
                    let savedKo = await storeKo(url, data);
                    console.log("data was saved successfully");
                }
                catch(e){
                    console.log(e);
                    Logger.log({
                        level : "error",
                        message : e.message,
                        metadata : {
                            userId : store.get(convo.vars.slack_user_id),
                            intent : "ideastorm  intent"
                        }
                    })
                }
                ideaCount++;
                return await convo.gotoThread("idea_input_thread");
            }
        }
    ],
    {key : 'field1'},
    "idea_input_thread");


    convo.before("exit_thread", function(convo, next) {
        convo.setVar("idea_count", ideaCount);
    })


    convo.addMessage({
        text : "You came up with {{vars.idea_count}} ideas in this session! The average person comes up with 6.3 ideas."
    },"exit_thread");


    convo.addGotoDialog("help-dialog-id", "exit_thread");

    // convo.addMessage({
    //     text : "If you want to do a deep dive on one of your ideas type `deepdive` 💦."
    // },"exit_thread");



    convo.after(async (results, bot) => {
        Logger.log({
            level : "info",
            message : "END of conversation : list_ideas_intent",
            metadata : {
                convo : false,
                userId : store.get(results.user)
            }
        });
    })



    controller.addDialog(convo);


    
    controller.on('direct_message, message', async(bot, message) => {

        if(!store.get(message.user)) {
            return ;
        }

        if(message.intent === "list_ideas_intent") {
            ideaCount = 0;
            Logger.log({
                level : "info",
                message : "START of conversation : list_ideas_intent",
                metadata : {
                    convo : true,
                    userId : store.get(message.user)
                }
            });
            await bot.beginDialog(DIALOG_ID);
        }

    })
}