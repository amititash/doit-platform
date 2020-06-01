const axios = require('axios');
const store = require('../store/store');
const Logger = require('../utils/Logger');
const { BotkitConversation } = require('botkit');
const KoService = require('../api/ko');

module.exports = function(controller) {
    const DIALOG_ID = "deepdive_about_idea_dialog";

    let convo = new BotkitConversation(DIALOG_ID, controller);

    convo.before("default", async (convo, bot) => {
        Logger.log({
            level : "info",
            message : "START of conversation : deepdive-about-idea",
            metadata : {
                convo : true,
                userId : store.get(convo.vars.slack_user_id)
            }
        });
        convo.setVar("koUpdateObj", {});
        let ko = {};
        try {
            ko = await KoService.fetchIdea(convo.vars.ko_id);
            convo.vars.koUpdateObj.ideaDescription = ko.ideaDescription;
            convo.setVar("current_idea_name", ko.ideaName);
            convo.setVar("shortNameExists", false);
            if(ko.ideaName){
                convo.setVar("shortNameExists", true);
            }
        }
        catch(e){
            console.log(e);
            Logger.log({
                level : "error",
                message : e.message,
                metadata : {
                    error : e,
                    userId : store.get(convo.vars.slack_user_id),
                    intent : "deepdive_about_idea"
                }
            })
            return await convo.gotoThread("error_thread");
        }
        //koUpdateObj contains only those fields that are updated by a particular deepdive section
        //whereas ideaObj contains some global info for the ko object, used throughout. 
        convo.vars.koUpdateObj._id = convo.vars.ko_id;
        if(convo.vars.enteringNewIdea) {
            return await convo.gotoThread("short_name_exists_thread");
        }
    });

    convo.addMessage({
        text : "*{{{vars.koUpdateObj.ideaDescription}}}*"
    },"default");



    convo.addQuestion({
        blocks : async (template, vars) => {
            return [
                {
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": `Do you want to change the idea description?`
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
                                "text": "Yes"
                            },
                            "style": "primary",
                            "value": "yes"
                        },
                        {
                            "type": "button",
                            "text": {
                                "type": "plain_text",
                                "emoji": true,
                                "text": "No"
                            },
                            "style": "danger",
                            "value": "no"
                        }
                    ]
                }
            ]
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
            pattern : "yes",
            type : 'string',
            handler : async (res, convo, bot) => {
                return await convo.gotoThread("change_idea_description_thread");
            }
        },
        {
            pattern : "no",
            type : 'string',
            handler : async (res, convo, bot) => {
                if(convo.vars.shortNameExists){
                    return await convo.gotoThread("short_name_exists_thread");
                }
                else {
                    return await convo.gotoThread("change_short_name_thread");
                }
                
            }
        },

        {
            default : true,
            type : 'string',
            handler : async (res, convo, bot) => {
                await bot.say("Please use the buttons for replying to this question");
                return await convo.repeat();
            }
        }
    ],
    {},
    "default");

    convo.addQuestion({
        text :"Please enter new description of your idea."
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
                if(res.length< 75) {
                    await bot.say({
                        text : "The description should have atleast 75 characters. Please re-enter."
                    });
                    return await convo.repeat();
                }
                convo.vars.koUpdateObj.ideaDescription = res;
                return await convo.gotoThread("short_name_exists_thread");
            }
        }
    ],
    {},
    "change_idea_description_thread");

    
    convo.addMessage({
        text : "Your product name currently is : * {{{vars.current_idea_name}}}*"
    },"short_name_exists_thread");
    

    convo.addQuestion({
        blocks : async (template, vars) => {
            return [
                {
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": `Would you like to change the product name?`
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
                                "text": "Yes"
                            },
                            "style": "primary",
                            "value": "yes"
                        },
                        {
                            "type": "button",
                            "text": {
                                "type": "plain_text",
                                "emoji": true,
                                "text": "No"
                            },
                            "style": "danger",
                            "value": "no"
                        }
                    ]
                }
            ]
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
            pattern : "yes",
            type : 'string',
            handler : async (res, convo, bot) => {
                return await convo.gotoThread("change_short_name_thread");
            }
        },
        {
            pattern : "no",
            type : 'string',
            handler : async (res, convo, bot) => {
                return await convo.gotoThread("progress_card_redirect_thread");
            }
        },
        {
            default : true,
            type : 'string',
            handler : async (res, convo, bot) => {
                await bot.say("Please use the buttons for replying to this question");
                return await convo.repeat();
            }
        }
    ],
    {},
    "short_name_exists_thread");



    convo.addQuestion({
        text :"What is the name of your product?"
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
                convo.vars.koUpdateObj.ideaName = res;
                return ;
            }
        }
    ],
    {},
    "change_short_name_thread");

   

    convo.addAction("progress_card_redirect_thread", "change_short_name_thread");



    convo.before("progress_card_redirect_thread", async (convo, bot) => {
        let userEmailId = store.get(convo.vars.slack_user_id);
        try {
            let savedKo = await KoService.fetchIdea(convo.vars.koUpdateObj._id);
            let koProgress = savedKo.progress;
            if(koProgress < 1) {
                convo.vars.koUpdateObj.progress = 1;
            }
            await KoService.storeIdea(userEmailId, convo.vars.koUpdateObj);
            console.log("data saved in backend")
        }
        catch(e){
            console.log(e);
            Logger.log({
                level : "error",
                message : e.message,
                metadata : {
                    error : e,
                    userId : store.get(convo.vars.slack_user_id),
                    intent : "deepdive_about_idea"
                }
            })
            await bot.say("Some error occurred in saving the idea.")
        }
    });


    convo.addMessage({
        text : "Thanks. We got basic info about your idea."
    },"progress_card_redirect_thread");


    convo.addMessage({
        text : "Let's now proceed to the *Industry and market categories section* to know more about your idea."
    },"progress_card_redirect_thread")

    convo.addAction("complete", "progress_card_redirect_thread");


    convo.addMessage({
        text : "Ok, that's fine. You can always add additional ideas by typing `ideastorm` or develop one of your ideas further by typing `deepdive`."
    },"early_exit_thread");

    convo.addMessage({
        text : "Ok, that's fine. You can always add additional ideas by typing `ideastorm` or develop one of your ideas further by typing `deepdive`."
    },"exit_without_idea_thread");



    convo.addMessage({
        text : "Some error occurred. Please try again."
    },"error_thread");


    convo.after(async (results, bot) => {
        Logger.log({
            level : "info",
            message : "END of conversation: deepdive-about-idea",
            metadata : {
                convo : false,
                userId : store.get(results.user)
            }
        });
    })

    controller.addDialog(convo);
}