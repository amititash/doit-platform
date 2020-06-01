const store = require('../store/store');
const axios = require('axios');
const elasticSearchService =  require('../utils/elasticsearch');
const Logger = require('../utils/Logger');
const { BotkitConversation } = require('botkit');



module.exports = function(controller) {
    let attachment = [];


    const DIALOG_ID = 'similar-companies-dialog';
    let convo = new BotkitConversation(DIALOG_ID, controller);

    convo.before("default", async(convo, bot) => {
        convo.setVar("slack_user_id", convo.step.values.user);
    })


    convo.addQuestion({
        text : "Please enter a description of your idea and I will find out companies working on similar ideas."
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
                let url = `${process.env.BACKEND_API_URL}/api/v1/kos`;
                await bot.say({
                    text : "Hang on, I'll fetch the results."
                })
                let similarCompanies = [];
                let similarCompaniesString = "";
                try {
                    similarCompanies = await elasticSearchService.search(res);
                }
                catch(e){
                    console.log("error in elasticsearch", e);
                    Logger.log({
                        level : "error",
                        message : e.message,
                        metadata : {
                            userId : store.get(convo.vars.slack_user_id),
                            intent : "find similar companies  intent"
                        }
                    })
                    return await convo.gotoThread("error_thread");
                }
                if(!similarCompanies.length){
                    await bot.say({
                        text : "Looks like there is no company working on that idea."
                    });
                }
                else {
                    similarCompanies.forEach( (element,index) => {
                        similarCompaniesString += `${index+1}. ${element._source.company_name}\n${element._source.domain}\n${element._source.description}\n`;
                        let companyDescription = element._source.description;
                        companyDescription = companyDescription.slice(0,200);
                        if(companyDescription.slice(-1) !== " "){
                            let lastWhitespaceIndex = companyDescription.lastIndexOf(' ');
                            companyDescription = companyDescription.slice(0, lastWhitespaceIndex);
                        }
                        companyDescription += "...";
                        companyDescription = companyDescription.toLowerCase();
                        companyDescription = companyDescription.charAt(0).toUpperCase() + companyDescription.slice(1);
                        attachment.push({
                            "fallback": "Required plain-text summary of the attachment.",
                            "color": "#36a64f",
                            // "pretext": "Optional text that appears above the attachment block",
                            "author_name": `${index+1}. ${element._source.company_name}`,
                            "author_link": `http://${element._source.domain}`,
                            "author_icon": "http://flickr.com/icons/bobby.jpg",
                            "title": `${element._source.domain}`,
                            "title_link": `http://${element._source.domain}`,
                            "text": `${companyDescription}`,
                            // "fields": [
                            //     {
                            //         "title": "Priority",
                            //         "value": "High",
                            //         "short": false
                            //     }
                            // ],
                            "image_url": "http://my-website.com/path/to/image.jpg",
                            "thumb_url": "http://example.com/path/to/thumb.png",
                            "footer": "StartIQ API",
                            "footer_icon": "https://platform.slack-edge.com/img/default_application_icon.png",
                            // "ts": 123456789
                        })
                    })
                    convo.setVar("similar_companies", similarCompaniesString);
                    return await convo.gotoThread("results_thread");
                }
            }
        }
    ],
    {},
    "default")



    convo.addMessage({
        text : "I found the following companies working on similar ideas.",
        attachments : async (template, vars) => {
            return attachment;
        }
    },"results_thread");



    convo.addMessage({
        text : "Ok, that's fine. You can always add additional ideas by typing `ideastorm` or develop one of your ideas further by typing `deepdive`."
    },"early_exit_thread");


    convo.addMessage({
        text : "Some error occurred."
    },"error_thread")


    convo.after(async (results, bot) => {
        Logger.log({
            level : "info",
            message : "END of conversation : find_similiar_companies intent",
            metadata : {
                convo : false,
                userId : store.get(results.user)
            }
        });

    });

    controller.addDialog(convo);


    // NOT IN SYNC WITH NEW ELASTICSEARCH UTIL. (CHANGE FOR GETTING UNIQUE COMPANIES ONLY)

    // controller.on('message, direct_message', async(bot, message) => {
    //     if(!store.get(message.user)) {
    //         return ;
    //     }

    //     if(message.intent === "find_similar_companies_intent"){
    //         attachment = [];
    //         Logger.log({
    //             level : "info",
    //             message : "START of conversation : find_similiar_companies intent",
    //             metadata : {
    //                 convo : true,
    //                 userId : store.get(message.user)
    //             }
    //         });
    //         await bot.beginDialog(DIALOG_ID);
            
    //     }
    // })
}