const axios = require('axios');
const store = require('../store/store');
const Logger = require('../utils/Logger');
const { BotkitConversation } = require('botkit');
const KoService = require('../api/ko');


module.exports = function(controller) {

    const DIALOG_ID = 'submit-idea-dialog';
    let convo = new BotkitConversation(DIALOG_ID, controller);


    convo.before("default", async (convo, bot) => {
        convo.setVar("koUpdateObj", {});
        convo.vars.koUpdateObj.bizcompApplication = {};
        convo.setVar("ideasBlock", []);
        convo.setVar("slack_user_id", convo.step.values.user);
        convo.setVar("ideas", []);
        let url = `${process.env.BACKEND_API_URL}/api/v1/kos/numbered?emailId=${store.get(convo.vars.slack_user_id)}&sortBy=fundability`;
        try {
            let response = await axios.get(url);
            convo.vars.ideas = response.data;
        }
        catch(e){
            console.log(e);
            Logger.log({
                level : "error",
                message : e.message,
                metadata : {
                    userId : store.get(convo.vars.slack_user_id),
                    intent : "deepdive  intent"
                }
            })
            await convo.gotoThread('error_thread');
        }


        if(convo.vars.ideas.length < 1 ){
            return await convo.gotoThread("no_ideas_existing_thread");
        }

        else if(convo.vars.ideas.length === 1){
            await bot.say(`Your idea: ${convo.vars.ideas[0].ideaDescription}`)
            convo.vars.koUpdateObj._id = convo.vars.ideas[0]._id;
            return await convo.gotoThread("questionnaire_thread");
        }
        
        convo.vars.ideas.forEach( (element,index) => {
            convo.vars.ideasBlock.push({
                "type": "section",
			    "text": {
                    "type": "mrkdwn",
                    "text": `${index+1}. ${element.ideaDescription}`
                },
                "accessory": {
                    "type": "button",
                    "text": {
                        "type": "plain_text",
                        "text": "Submit idea for competition",
                        "emoji": true
                    },
                    "value": `${index+1}`
                }
            })
            convo.vars.ideasBlock.push(
                {
                    "type": "divider"
                }   
            );
        });
    });

    convo.addQuestion({
        blocks : async(template, vars) => {
            return vars.ideasBlock
        }
    },
    [
        {
            pattern : "cancel",
            type : "string",
            handler : async (res, convo, bot) => {
                return await convo.gotoThread("early_exit_thread");
            }
        },
        {
            default : true,
            type : 'string',
            handler : async (res, convo, bot) => {
                let number = res;
                console.log(convo.vars.ideas, "oh yeah");
                let chosenIdeaArray = convo.vars.ideas.filter( (idea) => idea.serial == number );
                if(!chosenIdeaArray.length){
                    await bot.say("Please enter a valid response.");
                    return await convo.repeat();
                }
                let currentIdeaId = chosenIdeaArray[0]._id;
                convo.setVar("ko_id" , currentIdeaId);
                let selectedIdea = {};
                try {
                    selectedIdea = await KoService.fetchIdea(currentIdeaId);
                }
                catch(e) {
                    console.log(e);
                    Logger.log({
                        level : "error",
                        message : e.message,
                        metadata : {
                            userId : store.get(convo.vars.slack_user_id),
                            intent : "deepdive  intent"
                        }
                    })
                }
                convo.vars.koUpdateObj._id = selectedIdea._id;
                return await convo.gotoThread("questionnaire_thread");
            }
        }
    ],
    {},
    "default");



    convo.addQuestion({
        text : "What does your company make or do?"
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
                convo.vars.koUpdateObj.bizcompApplication.q1 = res;
                return;
            }
        }
    ],
    {},
    "questionnaire_thread");


    convo.addQuestion({
        text : "Why did you pick this idea to work on? Do you have domain expertise in this area? How do you know people need what you're making?"
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
                convo.vars.koUpdateObj.bizcompApplication.q2 = res;
                return;
            }
        }
    ],
    {},
    "questionnaire_thread");



    convo.addQuestion({
        text : "What is new about what you are making? What substitutes do people resort to because it doesn’t exist yet (or they don’t know about it)?"
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
                convo.vars.koUpdateObj.bizcompApplication.q3 = res;
                return;
            }
        }
    ],
    {},
    "questionnaire_thread");




    convo.addQuestion({
        text : "Who are your competitors, and what do you understand about your business that other companies just don’t get?"
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
                convo.vars.koUpdateObj.bizcompApplication.q4 = res;
                return;
            }
        }
    ],
    {},
    "questionnaire_thread");



    

    convo.addAction("save_responses_thread" , "questionnaire_thread");


    convo.before("save_responses_thread", async(convo, bot) => {
        let userEmailId = store.get(convo.vars.slack_user_id);
        convo.vars.koUpdateObj.submissionDate = new Date();
        try {
            await KoService.storeIdea(userEmailId, convo.vars.koUpdateObj);
            console.log("responses saved in the backend")
        }
        catch(e){
            console.log(e);
            Logger.log({
                level : "error",
                message : e.message,
                metadata : {
                    userId : store.get(convo.vars.slack_user_id),
                    intent : "deepdive  intent"
                }
            })
            await bot.say("Some error occurred in saving the idea.")
        }
    });



    convo.addMessage({
        text : "You don't have any ideas in your binder yet."
    },"no_ideas_existing_thread");

    convo.addAction("complete", "no_ideas_existing_thread" );


    convo.addMessage({
        text : "Thanks your idea has been submitted."
    },"save_responses_thread");

    convo.addAction("complete", "save_responses_thread" );
  


    convo.addMessage({
        text : "Some error occurred. Please try again."
    },"error_thread");




    convo.addGotoDialog("help-dialog-id", "early_exit_thread");






    convo.after(async (results, bot) => {
        Logger.log({
            level : "info",
            message : "END of conversation: submit_idea_intent",
            metadata : {
                convo : false,
                userId : store.get(results.user)
            }
        });
    })

    controller.addDialog(convo);



    controller.on('message, direct_message', async (bot, message) => {
        if(!store.get(message.user)) {
            return ;
        }
        if(message.intent === "submit_idea_intent"){
            Logger.log({
                level : "info",
                message : "START of conversation: submit_idea_intent",
                metadata : {
                    convo : true,
                    userId : store.get(message.user)
                }
            });
            await bot.beginDialog(DIALOG_ID); 
        }

        
    })




}