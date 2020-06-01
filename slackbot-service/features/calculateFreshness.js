const store = require('../store/store');
const axios = require('axios');
const Logger = require('../utils/Logger');
const { BotkitConversation } = require('botkit');


module.exports = function(controller) {
    let attachment = [];


    const DIALOG_ID = 'calculate-freshness-dialog';
    let convo = new BotkitConversation(DIALOG_ID, controller);



    convo.addQuestion({
        text : "Please enter a description of your idea and I will find out the freshness score."
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
                let slackUserId = convo.step.values.user;
                let url = `${process.env.BACKEND_API_URL}/api/v1/kos`;
                let koData = {
                    ideaOwner : store.get(slackUserId),
                    ideaDescription : res,
                    ideaName : res.slice(0,200)
                }
                try {
                    let response = await axios.post(url, koData);
                    let createdKo = response.data;
                    attachment.push({

                        "fallback": "Required plain-text summary of the attachment.",
                        "color": "#36a64f",
                        // "pretext": "Here are the top ideas by fundability. Type the number of the idea you want to develop further.",
                        "author_name": `${createdKo.ideaDescription}`,
                        // "author_link": "http://flickr.com/bobby/",
                        "author_icon": "http://flickr.com/icons/bobby.jpg",
                        // "title": `${createdKo.ideaDescription}`,
                        // "title_link": "https://api.slack.com/",
                        // "text": "Optional text that appears within the attachment",
                        "fields": [
                            {
                                "title": "Freshness:",
                                "value": `${createdKo.freshness_criteria}`,
                                "short": false
                            }
                        ],
                        "image_url": "http://my-website.com/path/to/image.jpg",
                        "thumb_url": "http://example.com/path/to/thumb.png",
                        "footer": "StartIQ API",
                        "footer_icon": "https://platform.slack-edge.com/img/default_application_icon.png",
                        // "ts": 123456789

                    })
                    convo.setVar("fundability_score", createdKo.fundability);
                }
                catch(e){
                    console.log("some error occurred", e);
                    Logger.log({
                        level : "error",
                        message : e.message,
                        metadata : {
                            error : e,
                            userId : store.get(slackUserId),
                            intent : "calculate_freshness_intent"
                        }
                    })
                    return await convo.gotoThread("error_thread");
                }
                return await convo.gotoThread("result_thread");
            }
        }
    ],
    {},
    "default");



    convo.addMessage({
        attachments : async (template, vars) => {
            return attachment;
        }
    },"result_thread");


    convo.addMessage({
        text : "Ok, that's fine. You can always add additional ideas by typing `ideastorm` or develop one of your ideas further by typing `deepdive`."
    },"early_exit_thread");



    convo.addMessage({
        text : "Some error occurred."
    },"error_thread")
    



    convo.after(async (results, bot) => {
        Logger.log({
            level : "info",
            message : "END of conversation : calculate_freshness_intent",
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
        if(message.intent === "calculate_freshness_intent"){
            attachment = [];

            Logger.log({
                level : "info",
                message : "START of conversation : calculate_freshness_intent",
                metadata : {
                    convo : true,
                    userId : store.get(message.user)
                }
            });
            await bot.beginDialog(DIALOG_ID);
        }

    })
}