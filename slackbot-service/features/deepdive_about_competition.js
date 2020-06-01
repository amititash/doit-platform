const store = require('../store/store');
const elasticSearchService =  require('../utils/elasticsearch');
const Logger = require('../utils/Logger');
const { BotkitConversation } = require('botkit');
const KoService = require('../api/ko');

module.exports = function(controller) {
    // const DIALOG_ID = "deepdive_about_competition_dialog";

    // let convo = new BotkitConversation(DIALOG_ID, controller);

    
    // convo.before("default", async (convo, bot) => {
    //     Logger.log({
    //         level : "info",
    //         message : "START of conversation : deepdive-competition",
    //         metadata : {
    //             convo : true,
    //             userId : store.get(convo.vars.slack_user_id)
    //         }
    //     });
    //     convo.setVar("koUpdateObj", {});
    //     convo.vars.koUpdateObj._id = convo.vars.ko_id;
    //     convo.setVar("allSimilarCompanies", []);
    //     convo.setVar("numberOfSimilarCompanies", 0);
    //     convo.setVar("chosenCompetitors", []);
    //     convo.setVar("companyIndex", 0);
    //     convo.setVar("userListedCompanies", []);
    //     try {
    //         convo.vars.allSimilarCompanies = await elasticSearchService.search(convo.vars.ideaObj.ideaDescription);
    //         convo.vars.numberOfSimilarCompanies = convo.vars.allSimilarCompanies.length;
    //     }
    //     catch(e) {
    //         console.log("Error in elasticsearch", e)
    //         Logger.log({
    //             level : "error",
    //             message : e.message,
    //             metadata : {
    //                 error : e,
    //                 userId : store.get(convo.vars.slack_user_id),
    //                 intent : "deepdive_about_competition"
    //             }
    //         })
    //         return await convo.gotoThread("error_thread");
    //     }
    //     if(!convo.vars.allSimilarCompanies.length){
    //         await bot.say("I did not find any similar companies.");
    //         return await convo.gotoThread("add_missed_similar_companies_thread");
    //     }
    //     await bot.say({
    //         text : "We found the following competitors. On a scale of 1 to 5, how relevant are they to what are you starting?"
    //     })
    //     return await convo.gotoThread("ask_es_listed_company_relevance_thread");

    // })




    // convo.before("ask_es_listed_company_relevance_thread", async (convo, bot) => {
    //     let company = convo.vars.allSimilarCompanies[convo.vars.companyIndex];
    //     let companyDescription = company._source.description;
    //             companyDescription = companyDescription.slice(0,200);
    //             if(companyDescription.slice(-1) !== " "){
    //                 let lastWhitespaceIndex = companyDescription.lastIndexOf(' ');
    //                 companyDescription = companyDescription.slice(0, lastWhitespaceIndex);
    //             }
    //             companyDescription += "...";
    //             companyDescription = companyDescription.toLowerCase();
    //             companyDescription = companyDescription.charAt(0).toUpperCase() + companyDescription.slice(1);
    //     convo.setVar("companyBlock",[
    //         {
    //             "type": "section",
    //             "text": {
    //                 "type": "mrkdwn",
    //                 "text" : `${convo.vars.companyIndex+1}. <${company._source.domain}|${company._source.company_name}>\n${companyDescription}`
    //             }
    //         },
    //         {
    //             "type": "actions",
    //             "elements": [
    //                 {
    //                     "type": "button",
    //                     "text": {
    //                         "type": "plain_text",
    //                         "emoji": true,
    //                         "text": "1"
    //                     },
    //                     "style": "primary",
    //                     "value": "1"
    //                 },
    //                 {
    //                     "type": "button",
    //                     "text": {
    //                         "type": "plain_text",
    //                         "emoji": true,
    //                         "text": "2"
    //                     },
    //                     "style": "primary",
    //                     "value": "2"
    //                 },
    //                 {
    //                     "type": "button",
    //                     "text": {
    //                         "type": "plain_text",
    //                         "emoji": true,
    //                         "text": "3"
    //                     },
    //                     "style": "primary",
    //                     "value": "3"
    //                 },
    //                 {
    //                     "type": "button",
    //                     "text": {
    //                         "type": "plain_text",
    //                         "emoji": true,
    //                         "text": "4"
    //                     },
    //                     "style": "primary",
    //                     "value": "4"
    //                 },
    //                 {
    //                     "type": "button",
    //                     "text": {
    //                         "type": "plain_text",
    //                         "emoji": true,
    //                         "text": "5"
    //                     },
    //                     "style": "primary",
    //                     "value": "5"
    //                 }
    //             ]
    //         }
    //     ])
    // });


    // convo.addQuestion({
    //     blocks : async (template, vars) => {
    //         return vars.companyBlock;
    //     }
    // },
    // [
    //     {
    //         pattern : "cancel",
    //         handler : async (res, convo, bot) => {
    //             return await convo.gotoThread("early_exit_thread");
    //         }
    //     },
    //     {
    //         default : true,
    //         handler : async (res, convo, bot) => {
    //             let score = parseInt(res);
    //             if(isNaN(score) || score<1 || score > 5){
    //                 await bot.say({
    //                     text : "Please use the buttons below for replying to this question"
    //                 });
    //                 return await convo.repeat();
    //             }
    //             else {
    //                 convo.vars.chosenCompetitors.push({
    //                     cname : convo.vars.allSimilarCompanies[convo.vars.companyIndex]._source.company_name,
    //                     crel : score,
    //                     url : convo.vars.allSimilarCompanies[convo.vars.companyIndex]._source.domain
    //                 })
    //                 convo.vars.companyIndex++;
    //                 if(convo.vars.companyIndex === convo.vars.numberOfSimilarCompanies) {
    //                     return await convo.gotoThread("add_missed_similar_companies_thread")
    //                 }
    //                 if(convo.vars.companyIndex%5 === 0) {
    //                     return await convo.gotoThread("next_five_companies_check_thread");
    //                 }
    //                 return await convo.gotoThread("ask_es_listed_company_relevance_thread");
    //             }
    //         }
    //     }
    // ],
    // {},
    // "ask_es_listed_company_relevance_thread")


    // convo.addQuestion({
    //     blocks : async (template, vars) => {
    //         return [
    //             {
    //                 "type": "section",
    //                 "text": {
    //                     "type": "mrkdwn",
    //                     "text": `Would you like to see the next five competitors?`
    //                 }
    //             },
    //             {
    //                 "type": "actions",
    //                 "elements": [
    //                     {
    //                         "type": "button",
    //                         "text": {
    //                             "type": "plain_text",
    //                             "emoji": true,
    //                             "text": "Yes"
    //                         },
    //                         "style": "primary",
    //                         "value": "yes"
    //                     },
    //                     {
    //                         "type": "button",
    //                         "text": {
    //                             "type": "plain_text",
    //                             "emoji": true,
    //                             "text": "No"
    //                         },
    //                         "style": "danger",
    //                         "value": "no"
    //                     }
    //                 ]
    //             }
    //         ]
    //     }
    // },
    // [
    //     {
    //         pattern : "cancel",
    //         type : 'string',
    //         handler : async (res, convo, bot) => {
    //             return await convo.gotoThread("early_exit_thread");
    //         }
    //     },
    //     {
    //         pattern : "yes",
    //         handler : async (res, convo, bot) => {
    //             return await convo.gotoThread("ask_es_listed_company_relevance_thread");
    //         }
    //     },
    //     {
    //         pattern : "no",
    //         handler : async (res, convo, bot) => {
    //             return await convo.gotoThread("add_missed_similar_companies_thread");
    //         }
    //     },
    //     {
    //         default : true,
    //         handler : async (res, convo, bot) => {
    //             await bot.say("Please use the buttons for replying.")
    //             return await convo.repeat();
    //         }
    //     }   
    // ],
    // {},
    // "next_five_companies_check_thread")


    // convo.before("add_missed_similar_companies_thread", async (convo, bot) => {
    //     convo.vars.companyIndex = 0;
    // })



    // convo.addQuestion({
    //     blocks : [
    //         {
    //             "type": "section",
    //             "text": {
    //                 "type": "mrkdwn",
    //                 "text": `Any companies I missed?`
    //             }
    //         },
    //         {
    //             "type": "actions",
    //             "elements": [
    //                 {
    //                     "type": "button",
    //                     "text": {
    //                         "type": "plain_text",
    //                         "emoji": true,
    //                         "text": "Yes"
    //                     },
    //                     "style": "primary",
    //                     "value": "yes"
    //                 },
    //                 {
    //                     "type": "button",
    //                     "text": {
    //                         "type": "plain_text",
    //                         "emoji": true,
    //                         "text": "No"
    //                     },
    //                     "style": "danger",
    //                     "value": "no"
    //                 }
    //             ]
    //         }
    //     ]
    // },
    // [
    //     {
    //         pattern : "cancel",
    //         type : 'string',
    //         handler : async (res, convo, bot) => {
    //             return await convo.gotoThread("early_exit_thread");
    //         }
    //     },
    //     {
    //         pattern : "no",
    //         type : 'string',
    //         handler : async (res, convo, bot) => {
    //             return await convo.gotoThread("save_competitors_info_thread");
    //         }
    //     },
    //     {
    //         pattern : "yes",
    //         type : 'string',
    //         handler : async (res, convo, bot) => {
    //             return ;
    //         }
    //     },
    //     {
    //         default : true,
    //         type : 'string',
    //         handler : async (res, convo, bot) => {
    //             await bot.say("Please use the buttons for replying.");
    //             return await convo.repeat();
    //         }
    //     }
    // ],
    // {key : 'field8'},
    // "add_missed_similar_companies_thread");


    // convo.addQuestion({
    //     text : "Tell me who they are and I'll keep track of them. If you have multiple additional competitors, separate their names with commas."
    // },
    // [
    //     {
    //         pattern : "cancel",
    //         type : 'string',
    //         handler : async (res, convo, bot) => {
    //             return await convo.gotoThread("early_exit_thread");
    //         }
    //     },
    //     {
    //         default : true,
    //         type : 'string',
    //         handler : async (res, convo, bot) => {
    //             let companies = res.split(',');
    //             companies.forEach( company => {
    //                 convo.vars.userListedCompanies.push(company);
    //             })
    //             convo.vars.userListedCompanies.forEach( (element) => {
    //                 convo.vars.chosenCompetitors.push({
    //                     cname : element,
    //                     crel : 5
    //                 })
    //             })
    //         }
    //     }
    // ],
    // {key : 'field9'},
    // "add_missed_similar_companies_thread");


    // convo.addAction("save_competitors_info_thread", "add_missed_similar_companies_thread");


    // // convo.before("ask_user_listed_companies_relevance", async (convo, bot) => {
    // //     let company = convo.vars.userListedCompanies[convo.vars.companyIndex];
    // //     convo.setVar("companyBlock",[
    // //         {
    // //             "type": "section",
    // //             "text": {
    // //                 "type": "mrkdwn",
    // //                 "text" : `${convo.vars.companyIndex+1}. ${company}`
    // //             }
    // //         },
    // //         {
    // //             "type": "actions",
    // //             "elements": [
    // //                 {
    // //                     "type": "button",
    // //                     "text": {
    // //                         "type": "plain_text",
    // //                         "emoji": true,
    // //                         "text": "1"
    // //                     },
    // //                     "style": "primary",
    // //                     "value": "1"
    // //                 },
    // //                 {
    // //                     "type": "button",
    // //                     "text": {
    // //                         "type": "plain_text",
    // //                         "emoji": true,
    // //                         "text": "2"
    // //                     },
    // //                     "style": "primary",
    // //                     "value": "2"
    // //                 },
    // //                 {
    // //                     "type": "button",
    // //                     "text": {
    // //                         "type": "plain_text",
    // //                         "emoji": true,
    // //                         "text": "3"
    // //                     },
    // //                     "style": "primary",
    // //                     "value": "3"
    // //                 },
    // //                 {
    // //                     "type": "button",
    // //                     "text": {
    // //                         "type": "plain_text",
    // //                         "emoji": true,
    // //                         "text": "4"
    // //                     },
    // //                     "style": "primary",
    // //                     "value": "4"
    // //                 },
    // //                 {
    // //                     "type": "button",
    // //                     "text": {
    // //                         "type": "plain_text",
    // //                         "emoji": true,
    // //                         "text": "5"
    // //                     },
    // //                     "style": "primary",
    // //                     "value": "5"
    // //                 }
    // //             ]
    // //         }
    // //     ])
    // // })

    // // convo.addQuestion({
    // //     blocks : async (template, vars) => {
    // //         return vars.companyBlock
    // //     }
    // // },
    // // [
    // //     {
    // //         pattern : "cancel",
    // //         handler : async (res, convo, bot) => {
    // //             return await convo.gotoThread("early_exit_thread");
    // //         }
    // //     },
    // //     {
    // //         default : true,
    // //         handler : async (res, convo, bot) => {
    // //             let score = parseInt(res);
    // //             if(isNaN(score) || score<1 || score > 5){
    // //                 await bot.say({
    // //                     text : "Please use the buttons below for replying to this question"
    // //                 });
    // //                 return await convo.repeat();
    // //             }
    // //             else {
    // //                 convo.vars.chosenCompetitors.push({
    // //                     cname : convo.vars.userListedCompanies[convo.vars.companyIndex],
    // //                     crel : score
    // //                 })
    // //                 convo.vars.companyIndex++;
    // //                 if(!convo.vars.userListedCompanies[convo.vars.companyIndex]) {
    // //                     convo.vars.koUpdateObj.competitors = convo.vars.chosenCompetitors;
    // //                     return await convo.gotoThread("save_competitors_info_thread");
    // //                 }
    // //                 return await convo.gotoThread("ask_user_listed_companies_relevance");
    // //             }
    // //         }
    // //     }
    // // ],
    // // {},
    // // "ask_user_listed_companies_relevance"
    // // );


    // convo.before("save_competitors_info_thread", async (convo, bot) => {
    //     convo.vars.koUpdateObj.competitors = convo.vars.chosenCompetitors;
    // })

    // convo.addAction("progress_card_redirect_thread" , "save_competitors_info_thread");

    

    // convo.addMessage({
    //     text : "Some error occurred. Please try again."
    // },"error_thread");


    // convo.addMessage({
    //     text : "Ok, that's fine. You can always add additional ideas by typing `ideastorm` or develop one of your ideas further by typing `deepdive`."
    // },"early_exit_thread");

    // convo.addMessage({
    //     text : "Ok, that's fine. You can always add additional ideas by typing ideastorm` or develop one of your ideas further by typing `deepdive`."
    // },"exit_without_idea_thread");



    // convo.before("progress_card_redirect_thread", async (convo, bot) => {
    //     console.log("data before saving", convo.vars.koUpdateObj);
    //     let userEmailId = store.get(convo.vars.slack_user_id);
    //     try {
    //         let savedKo = await KoService.fetchIdea(convo.vars.koUpdateObj._id);
    //         let koProgress = savedKo.progress;
    //         if(koProgress < 3){
    //             convo.vars.koUpdateObj.progress = 3;
    //         }
    //         await KoService.storeIdea(userEmailId, convo.vars.koUpdateObj);
    //         console.log("local scope data from about_competition saved in backend")
    //     }
    //     catch(e){
    //         console.log(e);
    //         Logger.log({
    //             level : "error",
    //             message : e.message,
    //             metadata : {
    //                 error : e,
    //                 userId : store.get(convo.vars.slack_user_id),
    //                 intent : "deepdive_about_competition"
    //             }
    //         })
    //         await bot.say("Some error occurred in saving the idea.")
    //     }
    // })


    // convo.addMessage({
    //     text : "Thanks. We now know who your competitors are."
    // },"progress_card_redirect_thread");

    

    // convo.addAction("complete", "progress_card_redirect_thread");




    // convo.after(async (results, bot) => {
    //     Logger.log({
    //         level : "info",
    //         message : "END of conversation : deepdive-competition",
    //         metadata : {
    //             convo : false,
    //             userId : store.get(results.user)
    //         }
    //     });
    // })


    // controller.addDialog(convo);
    
}