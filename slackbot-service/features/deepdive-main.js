const axios = require('axios');
const store = require('../store/store');
const Logger = require('../utils/Logger');
const { BotkitConversation } = require('botkit');
const ProgressCard = require('../utils/progressCard');
const KoService = require('../api/ko');

module.exports = function(controller) {

    const DIALOG_ID = "deepdive_main_dialog";

    let convo = new BotkitConversation(DIALOG_ID, controller);


    convo.before("default", async(convo, bot) => {
        let slackUserId = convo.step.values.user;
        convo.setVar("existingIdeasCount", 0);
        convo.setVar("ideaObj", {});
        convo.setVar("slack_user_id", slackUserId);
        convo.setVar("enteringNewIdea" , false);
        try {
            let ideas = await axios.get(`${process.env.BACKEND_API_URL}/api/v1/kos/count?emailId=${store.get(slackUserId)}`);
            convo.vars.existingIdeasCount = ideas.data.koCount
        }
        catch(error) {
            console.log(error);
            Logger.log({
                level : "error",
                message : e.message,
                metadata : {
                    error : e,
                    userId : store.get(convo.vars.slack_user_id),
                    intent : "deepdive_main"
                }
            })
            return await convo.gotoThread("error_thread");
        }
        if(!convo.vars.existingIdeasCount) {
            await bot.say("Looks like you don't have any ideas in your binder yet.");
            return await convo.gotoThread("new_idea_thread");
        }
        else {
            convo.setVar("existing_ko_count", convo.vars.existingIdeasCount);
        }
    })



    convo.addQuestion({
        blocks : async(template, vars) => {
            return [
                {
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": `It looks like you have {{vars.existing_ko_count}} ideas in your binder.\nDo you want to enter a new idea?`
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
            handler : async function (res, convo, bot) {
                return await convo.gotoThread("exit_without_idea_thread");
            }
        },
        {
            pattern : "yes",
            type : 'string',
            handler : async function (res, convo, bot) {
                return await convo.gotoThread("new_idea_thread");
            }
        },
        {
            pattern : "no",
            type : 'string',
            handler : async function (res, convo, bot) {
                return ;
            }
        },
        {
            default : true,
            type : 'string',
            handler : async function (res, convo, bot) {
                await bot.say({
                    text : "Please use the buttons below for replying to this question"
                })
                return await convo.repeat();
            }
        },
    ],
    { key : 'field1'},
    "default");






    convo.addQuestion({
        blocks : [
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": `How would you like me to sort your ideas?`
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
                            "text": "Funding activity"
                        },
                        "style": "primary",
                        "value": "fundability"
                    },
                    {
                        "type": "button",
                        "text": {
                            "type": "plain_text",
                            "emoji": true,
                            "text": "Freshness"
                        },
                        "style": "primary",
                        "value": "freshness"
                    },
                    {
                        "type": "button",
                        "text": {
                            "type": "plain_text",
                            "emoji": true,
                            "text": "Most recent"
                        },
                        "style": "primary",
                        "value": "most recent"
                    },
                    {
                        "type": "button",
                        "text": {
                            "type": "plain_text",
                            "emoji": true,
                            "text": "Search ideas"
                        },
                        "style": "primary",
                        "value": "search ideas"
                    }
                ]
            }
        ]
    },
    [
        {
            pattern : "cancel",
            type : 'string',
            handler : async (res, convo, bot) => {
                return await convo.gotoThread("exit_without_idea_thread");
            }
        },
        {
            pattern : "fundability",
            type : 'string',
            handler : async (res, convo, bot) => {
                return await convo.gotoThread("rank_by_fundability_thread");
            }
        },
        {
            pattern : "freshness",
            type : 'string',
            handler : async (res, convo, bot) => {
                return await convo.gotoThread("rank_by_freshness_thread");
            }
        },
        {
            pattern : "most recent",
            type : 'string',
            handler : async (res, convo, bot) => {
                return await convo.gotoThread("rank_by_recent_thread");
            }
        },
        {
            pattern : "search ideas",
            type : 'string',
            handler : async (res, convo, bot) => {
                return await convo.gotoThread("ideas_by_keyword_thread");
            }
        },
        {
            default : true,
            type : 'string',
            handler : async (res, convo, bot) => {
                await bot.say({
                    text : "Please use the buttons below for replying to this question"
                });
                return await convo.repeat();
            }
        }
    ],
    {key : 'field2'},
    "default");




    convo.before("rank_by_fundability_thread", async (convo, bot) => {
        convo.setVar("ideaByFundabilityAttachment", []);
        let url = `${process.env.BACKEND_API_URL}/api/v1/kos/numbered?emailId=${store.get(convo.vars.slack_user_id)}&sortBy=fundability`;
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
                    intent : "deepdive_main"
                }
            })
            await convo.gotoThread('error_thread');
        }
        ideas.forEach( (element,index) => {
            let fundabilityStars = element.fundabilityStars;
            let greenDots = '🔵 ';
            greenDots = greenDots.repeat(fundabilityStars.length);
            convo.vars.ideaByFundabilityAttachment.push({
                "type": "section",
			    "text": {
                    "type": "mrkdwn",
                    "text": `${index+1}. ${element.ideaDescription}\n${greenDots}`
                },
                "accessory": {
                    "type": "button",
                    "text": {
                        "type": "plain_text",
                        "text": "Select",
                        "emoji": true
                    },
                    "value": `${index+1}`
                }
            })
            convo.vars.ideaByFundabilityAttachment.push(
                {
                    "type": "divider"
                }   
            );
        });
    })


    convo.addMessage({
        text : "Here are your top ideas by funding activity in recent years. Select the idea you want to develop further.\n"
    },"rank_by_fundability_thread");

    convo.addQuestion({
        blocks : async (template, vars) => {
            return vars.ideaByFundabilityAttachment;
        }

    },
    [
        {
            pattern : "cancel",
            type : 'string',
            handler : async (res, convo, bot) => {
                return await convo.gotoThread("exit_without_idea_thread");
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
                            error : e,
                            userId : store.get(convo.vars.slack_user_id),
                            intent : "deepdive_main"
                        }
                    })
                }
                convo.vars.ideaObj = {
                    ...selectedIdea
                }
                convo.vars.ideaObj.ideaName = convo.vars.ideaObj.ideaDescription.slice(0,200);
                await bot.say({
                    text : `You chose *${convo.vars.ideaObj.ideaDescription}*\n`
                })
                return await convo.gotoThread("show_progress_card_thread");
            }
        }
    ],
    {key : 'field3'},
    "rank_by_fundability_thread");


    convo.before("rank_by_freshness_thread", async (convo, bot) => {
        convo.setVar("ideaByFreshnessAttachment", []);
        let url = `${process.env.BACKEND_API_URL}/api/v1/kos/numbered?emailId=${store.get(convo.vars.slack_user_id)}&sortBy=freshness`;
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
                    intent : "deepdive_main"
                }
            })
            await convo.gotoThread('error_thread');
        }
        ideas.forEach( (element,index) => {
            convo.vars.ideaByFreshnessAttachment.push({
                "type": "section",
			    "text": {
                    "type": "mrkdwn",
                    "text": `${index+1}. ${element.ideaDescription}\n${element.freshness.toFixed(2)}`
                },
                "accessory": {
                    "type": "button",
                    "text": {
                        "type": "plain_text",
                        "text": "Select",
                        "emoji": true
                    },
                    "value": `${index+1}`
                }
            })
            convo.vars.ideaByFreshnessAttachment.push(
                {
                    "type": "divider"
                }   
            );
        });
    })


    convo.addMessage({
        text : "Here are your top ideas by freshness. Select the idea you want to develop further."
    },"rank_by_freshness_thread");

    convo.addQuestion({
        blocks : async (template, vars) => {
            return vars.ideaByFreshnessAttachment;
        }
    },
    [
        {
            pattern : "cancel",
            type : 'string',
            handler : async (res, convo, bot) => {
                return await convo.gotoThread("exit_without_idea_thread");
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
                            error : e,
                            userId : store.get(convo.vars.slack_user_id),
                            intent : "deepdive_main"
                        }
                    })
                }
                convo.vars.ideaObj = {
                    ...selectedIdea
                }
                convo.vars.ideaObj.ideaName = convo.vars.ideaObj.ideaDescription.slice(0,200);
                await bot.say({
                    text : `You chose *${convo.vars.ideaObj.ideaDescription}*\n`
                })
                return await convo.gotoThread("show_progress_card_thread");
            }
        }
    ],
    {key : 'freshness'},
    "rank_by_freshness_thread");


    convo.before("rank_by_recent_thread", async (convo, bot) => {
        let url = `${process.env.BACKEND_API_URL}/api/v1/kos/numbered?emailId=${store.get(convo.vars.slack_user_id)}&sortBy=recent`;
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
                    intent : "deepdive_main"
                }
            })
            return await convo.gotoThread('error_thread');
        }
        convo.setVar("ideaByMostRecentAttachment", []);
        ideas.forEach( (element,index) => {
            convo.vars.ideaByMostRecentAttachment.push({
                "type": "section",
			    "text": {
                    "type": "mrkdwn",
                    "text": `${index+1}. ${element.ideaDescription}`
                },
                "accessory": {
                    "type": "button",
                    "text": {
                        "type": "plain_text",
                        "text": "Select",
                        "emoji": true
                    },
                    "value": `${index+1}`
                }
            })
            convo.vars.ideaByMostRecentAttachment.push(
                {
                    "type": "divider"
                }   
            );
        });
    })



    convo.addQuestion({
        text : "Here are your most recent ideas. Select the idea you want to develop further.",
        blocks : async (template, vars) => {
            return vars.ideaByMostRecentAttachment
        }
    },
    [
        {
            pattern : "cancel",
            type : 'string',
            handler : async (res, convo, bot) => {
                return await convo.gotoThread("exit_without_idea_thread");
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
                            error : e,
                            userId : store.get(convo.vars.slack_user_id),
                            intent : "deepdive_main"
                        }
                    })
                }
                convo.vars.ideaObj = {
                    ...selectedIdea
                }
                convo.vars.ideaObj.ideaName = convo.vars.ideaObj.ideaDescription.slice(0,200);
                await bot.say({
                    text : `You chose *${convo.vars.ideaObj.ideaDescription}*\n`
                })
                return await convo.gotoThread("show_progress_card_thread");
            }
        }
    ],
    {key : 'recent'},
    "rank_by_recent_thread");




    convo.addQuestion({
        text : "Please enter keywords for your idea."
    },
    [
        {
            pattern : "cancel",
            type : 'string',
            handler : async (res, convo, bot) => {
                return await convo.gotoThread("exit_without_idea_thread");
            }
        },
        {
            default : true,
            type : 'string',
            handler : async (res, convo, bot) => {
                convo.setVar("ideaByKeywordAttachment", []);
                let keyword = res;
                let url = `${process.env.BACKEND_API_URL}/api/v1/kos?emailId=${store.get(convo.vars.slack_user_id)}&keyword=${keyword}`;
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
                            intent : "deepdive_main"
                        }
                    })
                    return await convo.gotoThread('error_thread');
                }
                if(!ideas.length){
                    await bot.say("No idea found in your binder. Try searching with a different keyword.")
                    return await convo.repeat();
                }
                else {
                    ideas.forEach( (element,index) => {
                        convo.vars.ideaByKeywordAttachment.push({
                            "type": "section",
                            "text": {
                                "type": "mrkdwn",
                                "text": `${index+1}. ${element.ideaDescription}`
                            },
                            "accessory": {
                                "type": "button",
                                "text": {
                                    "type": "plain_text",
                                    "text": "Select",
                                    "emoji": true
                                },
                                "value": `${index+1}`
                            }
                        })
                        convo.vars.ideaByKeywordAttachment.push(
                            {
                                "type": "divider"
                            }   
                        );

                    });
                }
            }
        }
    ],
    {key : 'keyword'},
    "ideas_by_keyword_thread");


    convo.addMessage({
        text : "Here are the ideas that matched your search. Select the idea you want to develop further."
    },"ideas_by_keyword_thread");


    convo.addQuestion({
        blocks : async (template, vars) => {
            return vars.ideaByKeywordAttachment;
        }
    },
    [
        {
            pattern : "cancel",
            type : 'string',
            handler : async (res, convo, bot) => {
                return await convo.gotoThread("exit_without_idea_thread");
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
                            error : e,
                            userId : store.get(convo.vars.slack_user_id),
                            intent : "deepdive_main"
                        }
                    })
                }
                convo.vars.ideaObj = {
                    ...selectedIdea
                }
                convo.vars.ideaObj.ideaName = convo.vars.ideaObj.ideaDescription.slice(0,200);
                await bot.say({
                    text : `You chose *${convo.vars.ideaObj.ideaDescription}*\n`
                })
                return await convo.gotoThread("show_progress_card_thread");
            }
        }
    ],
    {},
    "ideas_by_keyword_thread");




    convo.addQuestion({
        text: `Let’s start by entering a new idea. What are you trying to build and for whom?`
    },
    [
        {
            pattern : "cancel",
            type : 'string',
            handler : async (res, convo, bot) => {
                return await convo.gotoThread("exit_without_idea_thread");
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
                convo.vars.ideaObj.ideaDescription = res;
                convo.vars.ideaObj.ideaName = "my-idea";
                convo.vars.ideaObj.progress = 0;
                convo.vars.enteringNewIdea = true;
                try {
                    let response = await KoService.justSaveIdea(store.get(convo.vars.slack_user_id), convo.vars.ideaObj);
                    convo.vars.ideaObj._id = response._id;
                    convo.setVar("ko_id" , response._id);
                }
                catch(e) {
                    console.log("some error occurred",e.message);
                    Logger.log({
                        level : "error",
                        message : e.message,
                        metadata : {
                            error : e,
                            userId : store.get(convo.vars.slack_user_id),
                            intent : "deepdive_main"
                        }
                    })
                    // return await convo.gotoThread("error_thread");
                    return await convo.gotoThread("slow_network_error_thread");
                }
                return await convo.gotoThread("show_progress_card_thread");
            }
        }
    ],
    {key : 'field4'},
    "new_idea_thread");






    convo.before("show_progress_card_thread", async (convo, bot) => {
        let koProgress = 0;
        try {
            let response = await KoService.fetchIdea(convo.vars.ko_id);
            koProgress = response.progress;
        }
        catch(e) {
            console.log(e);
            Logger.log({
                level : "error",
                message : e.message,
                metadata : {
                    error : e,
                    userId : store.get(convo.vars.slack_user_id),
                    intent : "deepdive_main"
                }
            })
            convo.gotoThread("error_thread");
        }
        convo.setVar("koProgress", koProgress);
        const progressCardAttachment = ProgressCard.createProgressCard(koProgress);
        progressCardAttachment[0].text.text = `Researching *${convo.vars.ideaObj.ideaDescription}*`;
        convo.setVar("progressCardAttachment", progressCardAttachment);
    })


    convo.addQuestion({
        blocks : async (template, vars) => {
            return vars.progressCardAttachment;
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
            pattern : "start section-1",
            type : 'string',
            handler : async (res, convo, bot) => {
                return await convo.gotoThread("idea_selected_thread");
            }
        },
        {
            pattern : "start section-2",
            type : 'string',
            handler : async (res, convo, bot) => {
                if(convo.vars.koProgress < 1){
                    await bot.say("Please fill all the sections above.");
                    return await convo.repeat();
                }
                return await convo.gotoThread("industry_and_market_thread");
            }
        },
        {
            pattern : "start section-3",
            type : 'string',
            handler : async (res, convo, bot) => {
                if(convo.vars.koProgress < 2){
                    await bot.say("Please fill all the sections above.");
                    return await convo.repeat();
                }
                return await convo.gotoThread("choose_similar_companies_thread");
            }
        },
        {
            pattern : "start section-4",
            type : 'string',
            handler : async (res, convo, bot) => {
                if(convo.vars.koProgress < 3){
                    await bot.say("Please fill all the sections above.");
                    return await convo.repeat();
                }
                return await convo.gotoThread("choose_customer_segment_thread");
            }
        },
        {
            pattern : "start section-5",
            type : 'string',
            handler : async (res, convo, bot) => {
                if(convo.vars.koProgress < 4){
                    await bot.say("Please fill all the sections above.");
                    return await convo.repeat();
                }
                return await convo.gotoThread("business_model_section_thread");
            }
        },
        {
            pattern : "start section-6",
            type : 'string',
            handler : async (res, convo, bot) => {
                if(convo.vars.koProgress < 5){
                    await bot.say("Please fill all the sections above.");
                    return await convo.repeat();
                }
                return await convo.gotoThread("calculate_costs_thread");
            }
        },
        {
            pattern : "generate deepdive report",
            type : 'string',
            handler : async (res, convo, bot) => {
                if(convo.vars.koProgress < 5){
                    await bot.say("Please fill all the sections above.");
                    return await convo.repeat();
                }
                return await convo.gotoThread("show_deepdive_report_thread");
            }
        },
        {
            default : true,
            type : 'string',
            handler : async (res, convo, bot) => {
                await bot.say("Please choose a valid option.");
                return await convo.repeat();
            }
        }
    ],
    {},
    "show_progress_card_thread");



    convo.addChildDialog("deepdive_about_idea_dialog", '', "idea_selected_thread");
    convo.addAction("show_progress_card_thread", "idea_selected_thread");


    convo.addChildDialog("deepdive_new_competition_dialog", '', "choose_similar_companies_thread");
    convo.addAction("show_progress_card_thread", "choose_similar_companies_thread");


    convo.addChildDialog("deepdive_customer_segment_dialog", '', "choose_customer_segment_thread");
    convo.addAction("show_progress_card_thread", "choose_customer_segment_thread");


    convo.addChildDialog("deepdive_market_dialog", '', "industry_and_market_thread");
    convo.addAction("show_progress_card_thread", "industry_and_market_thread");

    convo.addChildDialog("deepdive_business_model_dialog", '', "business_model_section_thread");
    convo.addAction("show_progress_card_thread", "business_model_section_thread");


    convo.addChildDialog("deepdive_skills_dialog", '', "calculate_costs_thread");
    convo.addAction("show_progress_card_thread", "calculate_costs_thread");


    convo.addChildDialog("deepdive_report_dialog",'', "show_deepdive_report_thread");


    convo.addMessage({
        text : "Something didn't work. Please try doing `deepdive` again."
    },"error_thread");


    convo.addMessage({
        text : "My AI Models are reloading due to slow network. Can you please type `deepdive` one more time ..."
    },"slow_network_error_thread")

    convo.addMessage({
        text : "Thanks for taking the deepdive."
    },"exit_without_idea_thread");

    convo.addMessage({
        text : "Thanks for taking the deepdive."
    },"early_exit_thread");

    convo.addGotoDialog("help-dialog-id", "exit_without_idea_thread");
    convo.addGotoDialog("help-dialog-id", "early_exit_thread");


    convo.after(async (results, bot) => {
        Logger.log({
            level : "info",
            message : "END of conversation : deepdive-main",
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
        if(message.intent === "deepdive_intent"){
            
            Logger.log({
                level : "info",
                message : "START of conversation : deepdive-main",
                metadata : {
                    convo : true,
                    userId : store.get(message.user)
                }
            });

            await bot.beginDialog(DIALOG_ID); 
        }

        
    })
}