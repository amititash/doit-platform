const axios = require('axios');
const store = require('../store/store');
const Logger = require('../utils/Logger');
const { BotkitConversation } = require('botkit');
const KoService = require('../api/ko');
const DeepdiveReportApi = require('../utils/generateDeepdiveReport');


module.exports = function(controller) {

    const DIALOG_ID = "deepdive_report_dialog";

    let convo = new BotkitConversation(DIALOG_ID, controller);



    convo.before("default", async(convo, bot) => {
        Logger.log({
            level : "info",
            message : "START of conversation : deepdive-report",
            metadata : {
                convo : true,
                userId : store.get(convo.vars.slack_user_id)
            }
        });
        convo.setVar("slack_user_id", convo.step.values.user);
        let ko = {};
        let user = {};
        try {
            ko = await KoService.fetchIdea(convo.vars.ko_id);
            let userResponse = await axios.get(`${process.env.BACKEND_API_URL}/api/v1/users/byEmail?emailId=${store.get(convo.vars.slack_user_id)}`);
            user = userResponse.data[0];
            let ideaFreshness = "";
            switch(ko.freshness_criteria){
                case "very_new_idea" :
                    ideaFreshness = "Very new idea, Are you sure you are not entering too early into the market?"
                    break;
                case "moderately_new_idea" :
                    ideaFreshness = "This is fairly new, but probably not much competition yet. So perhaps a good time."
                    break;
                case "old_idea" :
                    ideaFreshness = "Looks like an old idea. This has been done before. Please check the competitive landscape and be very sure of your moat."
                    break;
            }
            let scaledFundability = Math.round((ko.fundability-0.33)/0.33*100).toFixed(0);
            let fundabilityStars = ko.fundabilityStars;
            if(scaledFundability <= 0){
                convo.setVar("fundability", "It looks like your idea is highly unlikely to be funded.")
            }
            else {
                convo.setVar("fundability", scaledFundability);
            }
            convo.setVar("required_skills", ko.requiredSkills.join(','));
            convo.setVar("fundability_stars", fundabilityStars);
            convo.setVar("freshness" , ideaFreshness);
            convo.setVar("idea_name", ko.ideaName);
            convo.setVar("idea_name_slug", ko.ideaNameSlug);
            convo.setVar("idea_description", ko.ideaDescription);
            convo.setVar("user_categories", ko.userCategory);
            convo.setVar("total_addressable_market", ko.customerSize);
            convo.setVar("ko_id", ko._id);
            convo.setVar("topSkill", user.topSkill);
            convo.setVar("coSkills", ``);
            convo.setVar("antiSkills", ``);
            convo.setVar("annualProfit", Math.round(ko.annualProfit));
            convo.setVar("annualCosts", Math.round(ko.annualCosts));
            convo.setVar("profitToRevenueRatio", Math.round(100 * ko.profitToRevenueRatio));
            convo.setVar("similar_companies", "");
            convo.setVar("target_segment", ko.targetSegment);
            convo.setVar("targetCustomer", ko.targetCustomer);
            convo.setVar("targetCustomerDescription", ko.targetCustomerDescription)
            ko.competitors.forEach( (element) => {
                convo.vars.similar_companies += `${element.cname} : ${element.url}\n`
            });
            convo.setVar("inProfit", true);
            if(ko.profitToRevenueRatio < 0){
                convo.vars.inProfit = false;
            }
            convo.setVar("koDataForPdfReport", {
                similar_companies : convo.vars.similar_companies,
                user_categories : convo.vars.user_categories,
                target_segment : convo.vars.target_segment,
                targetCustomer : convo.vars.targetCustomer,
                targetCustomerDescription : convo.vars.targetCustomerDescription,
                total_addressable_market : convo.vars.total_addressable_market,
            })
            user.coSkills.forEach( (element) => {
                convo.vars.coSkills += `${element.coSkill}, `;
            })
            user.antiSkills.forEach((element) => {
                convo.vars.antiSkills += `${element}, `
            })
            
        }
        catch(e) {
            console.log("some error occurred",e);
            Logger.log({
                level : "error",
                message : e.message,
                metadata : {
                    error : e,
                    userId : store.get(convo.vars.slack_user_id),
                    intent : "deepdive_report_intent"
                }
            })
            return await convo.gotoThread("error_thread");
        }
    })

    convo.addMessage({
        text : "Great work! We’ve generated a report that will help you sharpen your idea before you execute. Click the button below to see your report for *startiq*. As we get more data and better algorithms, we’ll automatically update the report for you.",
        action : "show_report_thread"
    },"default");


    convo.before("show_report_thread", async(convo, bot) => {
        convo.setVar("reportBlock", [
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": "*StartIQ Analysis of your idea* 🤖"
                }
            },
            {
                "type": "divider"
            },
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": "*What is your idea?*: {{{vars.idea_description}}}"
                }
            },
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": "*What do you call your product or service?*: {{{vars.idea_name}}}"
                }
            },
            {
                "type": "divider"
            },
            {
                "type": "section",
                "fields": [
                    {
                        "type": "mrkdwn",
                        "text": "*Freshness*"
                    },
                    {
                        "type": "mrkdwn",
                        "text": " {{{vars.freshness}}}"
                    },
                    {
                        "type": "mrkdwn",
                        "text": "*Fundability*"
                    },
                    {
                        "type": "mrkdwn",
                        "text": " {{{vars.fundability}}}"
                    },
                    {
                        "type": "mrkdwn",
                        "text": "*Skills Required*"
                    },
                    {
                        "type": "mrkdwn",
                        "text": " {{{vars.required_skills}}}"
                    },
                    {
                        "type": "mrkdwn",
                        "text": "*What market categories are you competing in?*"
                    },
                    {
                        "type": "mrkdwn",
                        "text": " {{{vars.user_categories}}}"
                    }
                ]
            },
            {
                "type": "divider"
            },
            {
                "type": "context",
                "elements": [
                    {
                        "type": "mrkdwn",
                        "text": "For more info, contact <askus@startiq.org>"
                    }
                ]
            }
        ] )
        if(!convo.vars.inProfit){
            // convo.vars.reportBlock[11].fields[2].text = "*Annual Loss*";
            // convo.vars.reportBlock[11].fields[3].text = ` \$${-1*convo.vars.annualProfit}`;
            // convo.vars.reportBlock[11].fields[4].text = "*Loss to Revenue Ratio*";
            // convo.vars.reportBlock[11].fields[5].text = `${-1*convo.vars.profitToRevenueRatio}%`
        }
    })

    convo.addMessage({
        text : "placeholder",
        blocks : async(template, vars) => {
            return vars.reportBlock
        }
    },
    "show_report_thread");


    convo.addMessage({
        text : "For greater details and insights, check here.",
        attachments : async (template, vars) => {
            return [
                {
                    "fallback": `${process.env.FRONTEND_API_URL}/report?idea=${vars.idea_name_slug}&email=${store.get(vars.slack_user_id)}`,
                    "actions": [
                        {
                            "type": "button",
                            "text": "Quinn Deepdive Report 🤖",
                            "url": `${process.env.FRONTEND_API_URL}/report?idea=${vars.idea_name_slug}&email=${store.get(vars.slack_user_id)}`
                        }
                    ]
                }
            ]
        }
    },"show_report_thread");


    convo.addAction("deepdive_complete_thread", "show_report_thread");

    // convo.addAction("mail_report_thread", "show_report_thread");


    convo.addQuestion({
        blocks : async (template, vars) => {
            return [
                {
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": `Do you want us to mail the report to you?`
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
                return await convo.gotoThread("early_exit_thread");
            }
        },
        {
            pattern : "yes",
            type : 'string',
            handler : async function (res, convo, bot) {
                return await convo.gotoThread("mail_to_user_thread");
            }
        },
        {
            pattern : "no",
            type : 'string',
            handler : async function (res, convo, bot) {
                return await convo.gotoThread("mail_mentor_thread");
            }
        },
        {
            default : true,
            type : 'string',
            handler : async (res, convo, bot) => {
                await bot.say("Please use the buttons for replying to this question.");
                return await convo.repeat();
            }
        }
    ],
    {},
    "mail_report_thread");


    convo.addQuestion({
        blocks : async (template, vars) => {
            return [
                {
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": `Is your following email id correct?\n${store.get(vars.slack_user_id)}`
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
                return await convo.gotoThread("early_exit_thread");
            }
        },
        {
            pattern : "yes",
            type : 'string',
            handler : async function (res, convo, bot) {
                try {
                    await DeepdiveReportApi.sendMail(convo.vars.idea_name_slug, store.get(convo.vars.slack_user_id),  store.get(convo.vars.slack_user_id));
                }
                catch(e){
                    console.log(e);
                    Logger.log({
                        level : "error",
                        message : e.message,
                        metadata : {
                            error : e,
                            userId : store.get(convo.vars.slack_user_id),
                            intent : "deepdive_report_intent"
                        }
                    })
                    return await convo.gotoThread("error_thread");
                }
                return await convo.gotoThread("mail_mentor_thread");
            }
        },
        {
            pattern : "no",
            type : 'string',
            handler : async function (res, convo, bot) {
                return await convo.gotoThread("ask_user_email_thread");
            }
        },
        {
            default : true,
            type : 'string',
            handler : async (res, convo, bot) => {
                await bot.say("Please use the buttons for replying to this question.");
                return await convo.repeat();
            }
        }
    ],
    {},
    "mail_to_user_thread");


    convo.addQuestion({
        text : "Please enter your email id."
    },
    [
        {
            pattern : "cancel",
            type : 'string',
            handler : async function (res, convo, bot) {
                return await convo.gotoThread("early_exit_thread");
            }
        },
        {
            default : true,
            type : 'string',
            handler : async (res, convo, bot) => {
                let receiverEmail = res;
                receiverEmail = receiverEmail.slice(receiverEmail.indexOf('|')+1, receiverEmail.indexOf('>'))
                try {
                    await DeepdiveReportApi.sendMail(convo.vars.idea_name_slug, store.get(convo.vars.slack_user_id) , receiverEmail);
                }
                catch(e){
                    console.log(e);
                    Logger.log({
                        level : "error",
                        message : e.message,
                        metadata : {
                            error : e,
                            userId : store.get(convo.vars.slack_user_id),
                            intent : "deepdive_report_intent"
                        }
                    })
                    return await convo.gotoThread("error_thread");
                }
                return await convo.gotoThread("mail_mentor_thread");
            }
        }

    ],
    {},
    "ask_user_email_thread");



    convo.addQuestion({
        blocks : async (template, vars) => {
            return [
                {
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": `Do you want us to mail the report to your mentor?`
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
                return await convo.gotoThread("early_exit_thread");
            }
        },
        {
            pattern : "yes",
            type : 'string',
            handler : async function (res, convo, bot) {
                return ; 
            }
        },
        {
            pattern : "no",
            type : 'string',
            handler : async function (res, convo, bot) {
                return await convo.gotoThread("deepdive_complete_thread");
            }
        },
        {
            default : true,
            type : 'string',
            handler : async (res, convo, bot) => {
                await bot.say("Please use the buttons for replying to this question.");
                return await convo.repeat();
            }
        }
    ],
    {},
    "mail_mentor_thread");


    convo.addQuestion({
        text : "Please enter your mentors e-mail address."
    },
    [
        {
            pattern : "cancel",
            type : 'string',
            handler : async function (res, convo, bot) {
                return await convo.gotoThread("early_exit_thread");
            }
        },
        {
            default : true,
            type : 'string',
            handler : async function (res, convo, bot) {
                let receiverEmail = res;
                receiverEmail = receiverEmail.slice(receiverEmail.indexOf('|')+1, receiverEmail.indexOf('>'))
                try {
                    await DeepdiveReportApi.sendMail( convo.vars.idea_name_slug, store.get(convo.vars.slack_user_id),  receiverEmail);
                }
                catch(e){
                    console.log(e);
                    Logger.log({
                        level : "error",
                        message : e.message,
                        metadata : {
                            error : e,
                            userId : store.get(convo.vars.slack_user_id),
                            intent : "deepdive_report_intent"
                        }
                    })
                    return await convo.gotoThread("error_thread");
                }
                return await convo.gotoThread("deepdive_complete_thread");
                
            }
        },
    ],
    {},
    "mail_mentor_thread");



    convo.addMessage({
        text : "placeholder",
        blocks : async(template, vars) => {
            return [
                {
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": "Well done. What would you like to do next?"
                    }
                },
                {
                    "type" : "actions",
                    "elements" : [
                        {
                            "type": "button",
                            "text": {
                                "type": "plain_text",
                                "emoji": true,
                                "text": "research an idea"
                            },
                            "style": "primary",
                            "value": "deepdive"
                        },
                        {
                            "type": "button",
                            "text": {
                                "type": "plain_text",
                                "emoji": true,
                                "text": "generate many ideas fast"
                            },
                            "style": "primary",
                            "value": "ideastorm"
                        }
                    ]
                }
            ]
        }
    },"deepdive_complete_thread");

    convo.addQuestion({
        blocks : [{
            "type" : "actions",
            "elements" : [
                {
                    "type": "button",
                    "text": {
                        "type": "plain_text",
                        "emoji": true,
                        "text": "done for now"
                    },
                    "style": "primary",
                    "value": "done for now"
                }
            ]
        }]
    },
    [
        {
            default : true,
            type : 'string',
            handler : async( res, convo, bot) => {
                await bot.say("Thanks for taking the deepdive.")
            }
        }
    ],
    {},
    "deepdive_complete_thread");


 
    convo.addMessage({
        text : "Some error occurred. Please try again."
    },"error_thread");



    convo.addMessage({
        text : "Ok, that's fine. You can always add additional ideas by typing `ideastorm` or develop one of your ideas further by typing `deepdive`."
    },"early_exit_thread");


    convo.addMessage({
        text : "Ok, that's fine. You can always add additional ideas by typing `ideastorm` or develop one of your ideas further by typing `deepdive`."
    },"exit_without_idea_thread");


    convo.after(async (results, bot) => {
        Logger.log({
            level : "info",
            message : "END of conversation : deepdive-report",
            metadata : {
                convo : false,
                userId : store.get(results.user)
            }
        });
    })
    
    controller.addDialog(convo);
}