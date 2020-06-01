const store = require('../store/store');
const axios = require('axios');
const Logger = require('../utils/Logger');
const { BotkitConversation } = require('botkit');


const deleteIdea = (id) => {
    return new Promise( async(resolve, reject) => {
        let url = `${process.env.BACKEND_API_URL}/api/v1/kos?id=${id}`;
        let idea = {};
        try{
            let response  = await axios.delete(url);
            idea = response.data;
            resolve(idea);
        }
        catch(e){
            console.log(e);
            reject(e);
        }
    })
};


const deleteAllIdeas = (userEmailId) => {
    return new Promise( async (resolve, reject) => {
        let url = `${process.env.BACKEND_API_URL}/api/v1/kos/all?emailId=${userEmailId}`;
        try {
            let response = await axios.delete(url);
            resolve(response);
        }
        catch(e){
            console.log(e);
            reject(e);
        }
    })
}



module.exports = function(controller) {

    const DIALOG_ID = 'delete-idea-dialog';
    let convo = new BotkitConversation(DIALOG_ID, controller);
    let ideas = [];
    let attachments = []
    

    convo.before("default", async(convo, bot) => {
        let slackUserId = convo.step.values.user;
        convo.setVar("slack_user_id", slackUserId);
        convo.setVar("attachments", []);
        let url = `${process.env.BACKEND_API_URL}/api/v1/kos?emailId=${store.get(slackUserId)}`;
        try {
            let response = await axios.get(url);
            ideas = response.data;
        }
        catch(e){
            console.log(e);
            Logger.log({
                level : "error",
                message : e.message,
                metadata : {
                    error : e,
                    userId : store.get(convo.vars.slack_user_id),
                    intent : "delete_idea_intent"
                }
            })
            return await convo.gotoThread("error_thread");
        }
        if(!ideas.length) {
            return await convo.gotoThread("no_existing_ideas_thread");
        }
        ideas.forEach( (element,index) => {
            convo.vars.attachments.push(
                {
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": `${index+1}. ${element.ideaDescription}`
                    },
                    "accessory": {
                        "type": "button",
                        "text": {
                            "type": "plain_text",
                            "text": "Delete",
                            "emoji": true
                        },
                        "style" : "danger",
                        "value": `${index+1}`
                    }
                }
            )
        });
        convo.vars.attachments.push({
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": "*Select the idea that you want to delete*"
            }
        })
    })  


    convo.addQuestion({
        blocks : [
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": `Would you like to delete all ideas or a single idea?`
                }
            },
            {
                "type": "actions",
                "elements": [
                    {
                        "type": "button",
                        "text": {
                            "type": "plain_text",
                            "emoji": true,
                            "text": "All ideas"
                        },
                        "style": "danger",
                        "value": "all ideas"
                    },
                    {
                        "type": "button",
                        "text": {
                            "type": "plain_text",
                            "emoji": true,
                            "text": "Single idea"
                        },
                        "value": "single idea"
                    }
                ]
            }
        ]
    },[
        {
            pattern: "single idea",
            type : 'string',
            handler : async (res, convo, bot) => {
                return await convo.gotoThread("delete_single_idea_thread")
            }
        },
        {
            pattern: "all ideas",
            type : 'string',
            handler : async (res, convo, bot) => {
                let slackUserId = convo.step.values.user;
                let userEmailId = store.get(slackUserId);
                try{
                    let response = await deleteAllIdeas(userEmailId);
                    console.log("del success");
                    await bot.say({
                        text : "Idea(s) successfully deleted."
                    })
                }
                catch(e){
                    console.log(e);
                    Logger.log({
                        level : "error",
                        message : e.message,
                        metadata : {
                            error : e,
                            userId : store.get(convo.vars.slack_user_id),
                            intent : "delete_idea_intent"
                        }
                    })
                    return await convo.gotoThread("error_thread");
                }
                return; 
            }
        },
        {
            default: true,
            type : 'string',
            handler : async (res, convo, bot) => {
                return await convo.repeat();
            }
        }
    ],
    {},
    "default");



    convo.addMessage({
        text : "Here are all the ideas in your binder."
    },"delete_single_idea_thread");



    convo.addQuestion({
        blocks : async (template, vars) => {
            return vars.attachments;
        } 
    },
    [
        {
            pattern : "cancel",
            type : 'string',
            handler : async (res, convo, bot) => {
                return await convo.gotoThread("early_exit_thread");
            }
        },
        {
            default : true,
            type : 'string',
            handler : async (res, convo, bot) => {
                let number = res;
                let chosenIdeaArray = ideas.filter( (idea) => idea.serial == number );
                if(!chosenIdeaArray.length){
                    await bot.say("Please enter a valid response.");
                    return await convo.repeat();
                }
                let currentIdeaId = chosenIdeaArray[0]._id;
                try {
                    let deletedIdea = await deleteIdea(currentIdeaId);
                    console.log("deleted idea", deletedIdea);
                    return await convo.gotoThread("successfully_deleted_thread");
                }
                catch(e){
                    console.log(e);
                    Logger.log({
                        level : "error",
                        message : e.message,
                        metadata : {
                            error : e,
                            userId : store.get(convo.vars.slack_user_id),
                            intent : "delete_idea_intent"
                        }
                    })
                    return await convo.gotoThread("error_thread");
                }
            }
        }
    ],
    {},
    "delete_single_idea_thread")





    convo.addMessage({
        text : "You have no ideas in your binder."
    },"no_existing_ideas_thread");


    convo.addMessage({
        text : "Oops! Something went wrong."
    },"error_thread");


    convo.addMessage({
        text : "Ok, that's fine. You can always add additional ideas by typing `ideastorm` or develop one of your ideas further by typing `deepdive`."
    },"early_exit_thread");

    convo.addMessage({
        text : "Idea(s) successfully deleted."
    },"successfully_deleted_thread");


    convo.after(async (results, bot) => {
        Logger.log({
            level : "info",
            message : "END of conversation : delete_idea_intent",
            metadata : {
                convo : false,
                userId : store.get(results.user)
            }
        });

    })





    controller.addDialog(convo);






    controller.on('direct_message, message', async function(bot, message){

        if(!store.get(message.user)) {
            return ;
        }

        if(message.text === "delete idea" || message.intent === "delete_idea_intent"){
            Logger.log({
                level : "info",
                message : "START of conversation : delete_idea_intent",
                metadata : {
                    convo : true,
                    userId : store.get(message.user)
                }
            });
            await bot.beginDialog(DIALOG_ID);
            
            
        }


    })
}
