const store = require('../store/store');
const Logger = require('../utils/Logger');
const slackProfile = require('../utils/userProfile');
const axios = require('axios');
const { BotkitConversation } = require('botkit');
const entrepreneurEfficacy = require('../assets/founderquiz/entrepreneurEfficacy');
const founderMotivation = require('../assets/founderquiz/founderMotivation');
const topSkills = require('../assets/teamSection/topSkills');
const coSkills = require('../assets/teamSection/coskills');
const antiSkills = require('../assets/teamSection/antiskills');
const UserApi = require('../utils/api/userUpdate');


module.exports = function(controller) {

    let userName = "";



    const DIALOG_ID = 'founderquiz-dialog';
    let convo = new BotkitConversation(DIALOG_ID, controller);







    convo.before("default", async(convo, bot) => {
        if(convo.vars.enforceFounderquiz){
            //set in normal-user-reg.js
            console.log("founderquiz for new user");
        }
        else {
            console.log("foundequiz for old user");
        }
        // our db for now can have multiple existence of same email id user. need to fix this later. 
        let users = [];
        let user = {};
        let slackUserId = convo.step.values.user;
        convo.setVar("slack_user_id", slackUserId);
        convo.setVar("userUpdateObj", {});
        convo.vars.userUpdateObj.demographicData = {};
        convo.setVar("topSkills", topSkills);
        convo.setVar("coSkills", coSkills);
        convo.setVar("antiSkills", antiSkills);
        convo.setVar("loopCounter", 0);

        let url = `${process.env.BACKEND_API_URL}/api/v1/users/byEmail?emailId=${store.get(convo.vars.slack_user_id)}`;
        
        
        try {
            let slackInfo = await slackProfile.slackUserProfile(slackUserId);
            userName = slackInfo.userRealName || slackInfo.userDisplayName;
            userName = userName.slice(0,userName.indexOf(' '));
            let response = await axios.get(url);
            users = response.data;
            user = users[0];
        }
        catch(e){
            console.log("error in slack user profile api", e);
            Logger.log({
                level : "error",
                message : e.message,
                metadata : {
                    userId : store.get(convo.vars.slack_user_id),
                    intent : "founderquiz intent"
                }
            })
            return await convo.gotoThread("error_thread");
        }
        convo.setVar("username", userName);
    })


    convo.addMessage({
        text : `Hey {{vars.username}}! The best leaders know their strengths and weaknesses.💪`
    },"default");

    convo.addMessage({
        text : "We’re going to ask you a few questions about your skills and motivations to provide better advice to you about your startup.💪"
    },"default")

   

    
    convo.addMessage({
        text : "We have four quick questionnaires, we’ll do this only once unless you want to update your profile.",
        action : "self_assessment_thread"
    },"default");



    convo.before("self_assessment_thread", async (convo, bot) => {
        convo.setVar("selfAssessmentOptionsBlock", [
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": "1. Tell us a little about yourself"
                },
                "accessory": {
                    "type": "button",
                    "text": {
                        "type": "plain_text",
                        "text": "Select",
                        "emoji": true
                    },
                    "value": "1"
                }
            },
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": "2. What are your strengths as an entrepreneur?"
                },
                "accessory": {
                    "type": "button",
                    "text": {
                        "type": "plain_text",
                        "text": "Select",
                        "emoji": true
                    },
                    "value": "2"
                }
            },
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": "3. What motivates you to start a company?"
                },
                "accessory": {
                    "type": "button",
                    "text": {
                        "type": "plain_text",
                        "text": "Select",
                        "emoji": true
                    },
                    "value": "3"
                }
            },
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": "4. What are your core skills?"
                },
                "accessory": {
                    "type": "button",
                    "text": {
                        "type": "plain_text",
                        "text": "Select",
                        "emoji": true
                    },
                    "value": "4"
                }
            }
        ]);


        if(convo.vars.demographyFlag){
            convo.vars.selfAssessmentOptionsBlock[0].accessory.text.text = "Done";
        }

        if(convo.vars.entrepreneurEfficacyFlag){
            convo.vars.selfAssessmentOptionsBlock[1].accessory.text.text = "Done";
            convo.vars.selfAssessmentOptionsBlock[1].text.text = `2. Entrepreneur Efficacy\nScores:\n${convo.vars.entrepreneurEfficacyResultString}`;
        }

        if(convo.vars.founderMotivationFlag){
            convo.vars.selfAssessmentOptionsBlock[2].accessory.text.text = "Done";
            convo.vars.selfAssessmentOptionsBlock[2].text.text = `2. Founder Motivation\nScores:\n${convo.vars.founderMotivationResultString}`;
        }

    })


    convo.addQuestion({
        blocks : async (template, vars) => {
            return vars.selfAssessmentOptionsBlock;
        } 
    },
    [
        {
            pattern : "cancel",
            type : 'string',
            handler : async (res, convo, bot) => {
                if(convo.vars.enforceFounderquiz){
                    // await bot.say("Please complete the founderquiz before proceeding.");
                    return await convo.repeat();
                }
                else {
                    return await convo.gotoThread("exit_thread");
                }
            }
        },
        {
            pattern : "1",
            type : 'string',
            handler : async (res, convo, bot) => {
                convo.setVar("demographyFlag" , true);
                return await convo.gotoThread("demography_thread");
            }
        },
        {
            pattern : "2",
            type : 'string',
            handler : async (res, convo, bot) => {
                if(!convo.vars.demographyFlag){
                    await bot.say("Please complete demography quiz first.");
                    return await convo.repeat();
                }
                convo.setVar("entrepreneurEfficacyFlag" , true);
                return await convo.gotoThread("entrepreneur_efficacy_thread");
            }
        },
        {
            pattern : "3",
            type : 'string',
            handler : async (res, convo, bot) => {
                if(!convo.vars.entrepreneurEfficacyFlag){
                    await bot.say("Please complete entrepreneur efficacy quiz first.");
                    return await convo.repeat();
                }
                convo.setVar("founderMotivationFlag", true);
                return await convo.gotoThread("founder_motivation_thread");
            }
        },
        {
            pattern : "4",
            type : 'string',
            handler : async (res, convo, bot) => {
                if(!convo.vars.founderMotivationFlag){
                    await bot.say("Please complete founder motivation quiz first.");
                    return await convo.repeat();
                }
                return await convo.gotoThread("skill_builder_thread");
            }
        },
        {
            default: true,
            type : 'string',
            handler : async (res, convo, bot) => {
                await bot.say("Please use the buttons for replying.");
                return await convo.repeat();
            }
        }
    ],
    {},
    "self_assessment_thread");





    convo.addQuestion({
        blocks : async(template, vars) => {
            return [
                {
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": `What is your age?`
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
                                "text": "18-25"
                            },
                            "style": "primary",
                            "value": "18-25"
                        },
                        {
                            "type": "button",
                            "text": {
                                "type": "plain_text",
                                "emoji": true,
                                "text": "25-35"
                            },
                            "style": "primary",
                            "value": "25-35"
                        },
                        {
                            "type": "button",
                            "text": {
                                "type": "plain_text",
                                "emoji": true,
                                "text": "35-45"
                            },
                            "style": "primary",
                            "value": "35-45"
                        },
                        {
                            "type": "button",
                            "text": {
                                "type": "plain_text",
                                "emoji": true,
                                "text": "45-55"
                            },
                            "style": "primary",
                            "value": "45-55"
                        },
                        {
                            "type": "button",
                            "text": {
                                "type": "plain_text",
                                "emoji": true,
                                "text": "Above 55"
                            },
                            "style": "primary",
                            "value": "> 55"
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
                if(convo.vars.enforceFounderquiz){
                    // await bot.say("Please complete the founderquiz before proceeding.");
                    return await convo.repeat();
                }
                else {
                    return await convo.gotoThread("exit_thread");
                }
            }
        },
        {
            default: true,
            type : 'string',
            handler : async (res, convo, bot) => {
                // let age = parseInt(res);
                // if(isNaN(age)){
                //     await bot.say("Please enter a valid number.");
                //     return await convo.repeat();
                // }
                let age = res;
                convo.vars.userUpdateObj.demographicData.age = age;
                return ;
            }
        }
    ],
    {},
    "demography_thread");

    convo.addQuestion({
        blocks : async (template, vars) => {
            return [
                {
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": `What is your gender?`
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
                                "text": "Female"
                            },
                            "style": "primary",
                            "value": "Female"
                        },
                        {
                            "type": "button",
                            "text": {
                                "type": "plain_text",
                                "emoji": true,
                                "text": "Male"
                            },
                            "style": "primary",
                            "value": "Male"
                        },
                        {
                            "type": "button",
                            "text": {
                                "type": "plain_text",
                                "emoji": true,
                                "text": "Transgender Female"
                            },
                            "style": "primary",
                            "value": "Transgender Female"
                        },
                        {
                            "type": "button",
                            "text": {
                                "type": "plain_text",
                                "emoji": true,
                                "text": "Transgender Male"
                            },
                            "style": "primary",
                            "value": "Transgender Male"
                        },
                        {
                            "type": "button",
                            "text": {
                                "type": "plain_text",
                                "emoji": true,
                                "text": "Gender Variant/Non-conforming"
                            },
                            "style": "primary",
                            "value": "Gender Variant/Non-conforming"
                        },
                        {
                            "type": "button",
                            "text": {
                                "type": "plain_text",
                                "emoji": true,
                                "text": "Not Listed"
                            },
                            "style": "primary",
                            "value": "Not Listed"
                        },
                        {
                            "type": "button",
                            "text": {
                                "type": "plain_text",
                                "emoji": true,
                                "text": "Prefer Not to Answer"
                            },
                            "style": "primary",
                            "value": "Prefer Not to Answer"
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
                if(convo.vars.enforceFounderquiz){
                    // await bot.say("Please complete the founderquiz before proceeding.");
                    return await convo.repeat();
                }
                else {
                    return await convo.gotoThread("exit_thread");
                }
            }
        },
        {
            default: true,
            type : 'string',
            handler : async (res, convo, bot) => {
                convo.vars.userUpdateObj.demographicData.gender = res;
                return ;
            }
        }
    ],
    {},
    "demography_thread");

    convo.addQuestion({
        blocks : async(template, vars) => {
                return [
                    {
                        "type": "section",
                        "text": {
                            "type": "mrkdwn",
                            "text": `Which course/program are you majoring in?`
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
                                    "text": "Engineering (EE, ME, CE)"
                                },
                                "style": "primary",
                                "value": "Engineering (EE, ME, CE)"
                            },
                            {
                                "type": "button",
                                "text": {
                                    "type": "plain_text",
                                    "emoji": true,
                                    "text": "Computer Science"
                                },
                                "style": "primary",
                                "value": "Computer Science"
                            },
                            {
                                "type": "button",
                                "text": {
                                    "type": "plain_text",
                                    "emoji": true,
                                    "text": "Basic science (Biology, Chemistry, Physics)"
                                },
                                "style": "primary",
                                "value": "Basic science (Biology, Chemistry, Physics)"
                            },
                            {
                                "type": "button",
                                "text": {
                                    "type": "plain_text",
                                    "emoji": true,
                                    "text": "Arts & Humanities"
                                },
                                "style": "primary",
                                "value": "Arts & Humanities"
                            },
                            {
                                "type": "button",
                                "text": {
                                    "type": "plain_text",
                                    "emoji": true,
                                    "text": "Social Science"
                                },
                                "style": "primary",
                                "value": "Social Science"
                            },
                            {
                                "type": "button",
                                "text": {
                                    "type": "plain_text",
                                    "emoji": true,
                                    "text": "Business / Management"
                                },
                                "style": "primary",
                                "value": "Business / Management"
                            },
                            {
                                "type": "button",
                                "text": {
                                    "type": "plain_text",
                                    "emoji": true,
                                    "text": "Education"
                                },
                                "style": "primary",
                                "value": "Education"
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
                if(convo.vars.enforceFounderquiz){
                    // await bot.say("Please complete the founderquiz before proceeding.");
                    return await convo.repeat();
                }
                else {
                    return await convo.gotoThread("exit_thread");
                }
            }
        },
        {
            default: true,
            type : 'string',
            handler : async (res, convo, bot) => {
               convo.vars.userUpdateObj.demographicData.major = res;
               return ;
            }
        }
    ],
    {},
    "demography_thread");


    


    convo.addAction("self_assessment_thread" , "demography_thread");









    convo.before("entrepreneur_efficacy_thread", async (convo, bot) => {
        convo.setVar("entrepreneurEfficacyScores", {
            "Marketing" : [],
            "Innovation" : [],
            "Management" : [],
            "Risktaking" : [],
            "Financialcontrol" : []
        });


    });

    convo.addMessage({
        text : "Here is a list of tasks required of founders by many startups. You don’t have to be great at everything, but it's good to know what you’ll do and what you will need to rely on others for."
    },"entrepreneur_efficacy_thread");

    convo.addMessage({
        text : `${entrepreneurEfficacy.prompt}`
    },"entrepreneur_efficacy_thread");

    entrepreneurEfficacy.questions.forEach( question => {
        convo.addQuestion({
            blocks : async (template, vars) => {
                return [
                    {
                        "type": "section",
                        "text": {
                            "type": "mrkdwn",
                            "text": `${question.q}`
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
                                    "text": "1"
                                },
                                "style": "primary",
                                "value": "1"
                            },
                            {
                                "type": "button",
                                "text": {
                                    "type": "plain_text",
                                    "emoji": true,
                                    "text": "2"
                                },
                                "style": "primary",
                                "value": "2"
                            },
                            {
                                "type": "button",
                                "text": {
                                    "type": "plain_text",
                                    "emoji": true,
                                    "text": "3"
                                },
                                "style": "primary",
                                "value": "3"
                            },
                            {
                                "type": "button",
                                "text": {
                                    "type": "plain_text",
                                    "emoji": true,
                                    "text": "4"
                                },
                                "style": "primary",
                                "value": "4"
                            },
                            {
                                "type": "button",
                                "text": {
                                    "type": "plain_text",
                                    "emoji": true,
                                    "text": "5"
                                },
                                "style": "primary",
                                "value": "5"
                            },
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
                    if(convo.vars.enforceFounderquiz){
                        // await bot.say("Please complete the founderquiz before proceeding.");
                        return await convo.repeat();
                    }
                    else {
                        return await convo.gotoThread("exit_thread");
                    }
                }
            },
            {
                default : true,
                handler : async (res, convo, bot) => {
                    let score = parseInt(res);
                    if(isNaN(score) || score<1 || score > 5){
                        // await bot.say({
                        //     text : "Please use the buttons below for replying to this question"
                        // });
                        return await convo.repeat();
                    }
                    else {
                        !question.reverse ? convo.vars.entrepreneurEfficacyScores[`${question.measure}`].push(score) : convo.vars.entrepreneurEfficacyScores[`${question.measure}`].push(6-score);
                    } 
                }
            }
        ],
        {},
        "entrepreneur_efficacy_thread");
    });

    convo.addAction("entrepreneur_efficacy_result_thread", "entrepreneur_efficacy_thread");


    convo.before("entrepreneur_efficacy_result_thread", async (convo, bot) =>{
        let entrepreneurEfficacyAverage = {};
        for(let key in convo.vars.entrepreneurEfficacyScores) {
            
            if(convo.vars.entrepreneurEfficacyScores.hasOwnProperty(key)) {
                let sum = convo.vars.entrepreneurEfficacyScores[key].reduce( (a,b) => a+b,0);
                let numberOfData = convo.vars.entrepreneurEfficacyScores[key].length;
                entrepreneurEfficacyAverage[`${key}`] = numberOfData ? (sum/numberOfData).toFixed(2) : 0
            }
        }
        convo.setVar("entrepreneurEfficacyResultAttachment", [
            {
                "type" : "divider"
            },
            {
                "type" : "section",
                "fields" : []
            },
            {
                "type" : "divider"
            }
        ]);
        convo.setVar("entrepreneurEfficacyResultString" , "");
        convo.setVar("scoreArray", []);
        for(let key in entrepreneurEfficacyAverage) {
            if(entrepreneurEfficacyAverage.hasOwnProperty(key)) {
                let text = "";
                switch(key){
                    case "Marketing":
                        text = "Sales and marketing";
                        break;
                    case "Innovation":
                        text = "Idea generation and innovation";
                        break;
                    case "Risktaking":
                        text = "Taking risks";
                        break;
                    case "Management":
                        text = "Management";
                        break;
                    case "Financialcontrol" :
                        text = "Financial management";
                        break;
                }
                convo.vars.entrepreneurEfficacyResultAttachment[1].fields.push({
                    "type": "plain_text",
                    "text": `${key}`,
                    "emoji": true
                });
                convo.vars.entrepreneurEfficacyResultAttachment[1].fields.push({
                    "type": "plain_text",
                    "text": `${entrepreneurEfficacyAverage[key]}`,
                    "emoji": true
                })
                convo.vars.scoreArray.push({
                    category : text,
                    score : entrepreneurEfficacyAverage[key]
                })
            }
            

        }
        convo.vars.scoreArray.sort( function(a,b){return b.score - a.score});
        convo.vars.scoreArray.forEach( (element,index) => {
            if(index < 2){
                convo.vars.entrepreneurEfficacyResultString += `${element.category} : ${element.score}\n`

            }
        })
        convo.vars.userUpdateObj.entrepreneurEfficacyScores = entrepreneurEfficacyAverage;
    });


    convo.addMessage({
        text : 'Here are your average scores:'
    },"entrepreneur_efficacy_result_thread");

    convo.addMessage({
        "text" : "{{vars.entrepreneurEfficacyResultString}}",
        // blocks : async (template, vars) => {
        //     return vars.entrepreneurEfficacyResultAttachment;
        // }
    },
    "entrepreneur_efficacy_result_thread");

    convo.addAction("self_assessment_thread","entrepreneur_efficacy_result_thread");







































    convo.before("founder_motivation_thread", async (convo, bot) => {
        convo.setVar("founderMotivationScores", {
            "motivation_money" : [],
            "motivation_challenge" : [],
            "motivation_advancement" : [],
            "motivation_society" : [],
        });
    });

    convo.addMessage({
        text : `${founderMotivation.prompt}`
    },"founder_motivation_thread");

    founderMotivation.questions.forEach( question => {
        convo.addQuestion({
            blocks : async (template, vars) => {
                return [
                    {
                        "type": "section",
                        "text": {
                            "type": "mrkdwn",
                            "text": `${question.q}`
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
                                    "text": "1"
                                },
                                "style": "primary",
                                "value": "1"
                            },
                            {
                                "type": "button",
                                "text": {
                                    "type": "plain_text",
                                    "emoji": true,
                                    "text": "2"
                                },
                                "style": "primary",
                                "value": "2"
                            },
                            {
                                "type": "button",
                                "text": {
                                    "type": "plain_text",
                                    "emoji": true,
                                    "text": "3"
                                },
                                "style": "primary",
                                "value": "3"
                            },
                            {
                                "type": "button",
                                "text": {
                                    "type": "plain_text",
                                    "emoji": true,
                                    "text": "4"
                                },
                                "style": "primary",
                                "value": "4"
                            },
                            {
                                "type": "button",
                                "text": {
                                    "type": "plain_text",
                                    "emoji": true,
                                    "text": "5"
                                },
                                "style": "primary",
                                "value": "5"
                            },
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
                    if(convo.vars.enforceFounderquiz){
                        // await bot.say("Please complete the founderquiz before proceeding.");
                        return await convo.repeat();
                    }
                    else {
                        return await convo.gotoThread("exit_thread");
                    }
                }
            },
            {
                default : true,
                handler : async (res, convo, bot) => {
                    let score = parseInt(res);
                    if(isNaN(score) || score<1 || score > 5){
                        // await bot.say({
                        //     text : "Please use the buttons below for replying to this question"
                        // });
                        return await convo.repeat();
                    }
                    else {
                        !question.reverse ? convo.vars.founderMotivationScores[`${question.measure}`].push(score) : convo.vars.founderMotivationScores[`${question.measure}`].push(6-score);
                    } 
                }
            }
        ],
        {},
        "founder_motivation_thread");
    });

    convo.addAction("founder_motivation_result_thread", "founder_motivation_thread");


    convo.before("founder_motivation_result_thread", async (convo, bot) =>{
        let founderMotivationAverage = {};
        for(let key in convo.vars.founderMotivationScores) {
            
            if(convo.vars.founderMotivationScores.hasOwnProperty(key)) {
                let sum = convo.vars.founderMotivationScores[key].reduce( (a,b) => a+b,0);
                let numberOfData = convo.vars.founderMotivationScores[key].length;
                founderMotivationAverage[`${key}`] = numberOfData ? (sum/numberOfData).toFixed(2) : 0
            }
        }
        convo.setVar("founderMotivationResultAttachment", [
            {
                "type" : "divider"
            },
            {
                "type" : "section",
                "fields" : []
            },
            {
                "type" : "divider"
            }
        ]);
        convo.setVar("founderMotivationResultString" , "");
        for(let key in founderMotivationAverage) {
            if(founderMotivationAverage.hasOwnProperty(key)) {
                let text = "";
                switch(key){
                    case "motivation_money":
                        text = "Financial success";
                        break;
                    case "motivation_challenge":
                        text = "Challenge";
                        break;
                    case "motivation_advancement":
                        text = "Advancement";
                        break;
                    case "motivation_society" :
                        text = "Society";
                        break;
                }
                convo.vars.founderMotivationResultAttachment[1].fields.push({
                    "type": "plain_text",
                    "text": `${text}`,
                    "emoji": true
                });
                convo.vars.founderMotivationResultAttachment[1].fields.push({
                    "type": "plain_text",
                    "text": `${founderMotivationAverage[key]}`,
                    "emoji": true
                });
                convo.vars.founderMotivationResultString += `${text} : ${founderMotivationAverage[key]}\n`
            }
        }
        convo.vars.userUpdateObj.founderMotivationScores = founderMotivationAverage;
    });


    convo.addMessage({
        text : 'Here are your average scores:'
    },"founder_motivation_result_thread");

    convo.addMessage({
        "text" : "placeholder",
        blocks : async (template, vars) => {
            return vars.founderMotivationResultAttachment;
        }
    },
    "founder_motivation_result_thread");


    convo.addAction("self_assessment_thread" ,"founder_motivation_result_thread");


























    convo.addMessage({
        text : "Okay. Now let's turn to your skills."
    }, "skill_builder_thread");


    convo.before("skill_builder_thread", async (convo, bot) => {
        convo.setVar("topSkillsBlock",[
            {
                "type" : "actions",
                "elements" : []
            }
        ]);
        convo.vars.topSkills.every( (element, index) => {
            if(index===20){
                return false;
            }
            convo.vars.topSkillsBlock[0].elements.push({
                "type": "button",
                "text": {
                    "type": "plain_text",
                    "emoji": true,
                    "text": `${element.skill}`
                },
                "style": "primary",
                "value": `${index}`
            })
            return true;
        })
    });

    convo.addMessage({
        text : "Every startup needs a strong team. What skill in the list below is your strongest one?"
    },"skill_builder_thread");

    convo.addQuestion({
        blocks : async (template, vars) => {
            return vars.topSkillsBlock
        }
    },
    [
        {
            pattern : "cancel",
            type : 'string',
            handler : async (res, convo, bot) => {
                if(convo.vars.enforceFounderquiz){
                    // await bot.say("Please complete the founderquiz before proceeding.");
                    return await convo.repeat();
                }
                else {
                    return await convo.gotoThread("exit_thread");
                }
            }
        },
        {
            default : true,
            type : 'string',
            handler : async (res, convo, bot) => {
                if(!convo.vars.topSkills[res]){
                    await bot.say("What skill in the list below is your strongest one?");
                    return await convo.repeat();
                }
                convo.vars.userUpdateObj.topSkill = convo.vars.topSkills[res].skill;
                let filteredAntiSkills = antiSkills.filter( (element) => element.skill === convo.vars.userUpdateObj.topSkill).slice(0,10);
                convo.vars.userUpdateObj.antiSkills = filteredAntiSkills[0].antiskill;
            }
        }
    ],
    {},
    "skill_builder_thread");




    convo.addAction("coskill_builder_thread", "skill_builder_thread");





    convo.before("coskill_builder_thread", async (convo, bot) => {
        convo.vars.loopCounter = 0;
        convo.vars.userUpdateObj.coSkills = [];
        let filteredCoSkills = convo.vars.coSkills.filter((element) => element.skill === convo.vars.userUpdateObj.topSkill);
        let relatedCoSkills =filteredCoSkills[0].coskill;
        convo.setVar("relatedCoSkills", relatedCoSkills);
    });

    convo.addMessage({
        text : "How proficient are you in the following skill (1= not at all to 5 = I’m a rock star)?"
    },"coskill_builder_thread");

    convo.addAction("co_skill_loop_thread", "coskill_builder_thread");

    convo.before("co_skill_loop_thread", async (convo, bot) => {
        if(!convo.vars.relatedCoSkills[convo.vars.loopCounter]){
            return await convo.gotoThread("save_responses_thread");
        }
        convo.setVar("coSkillsBlock",[
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": `${convo.vars.relatedCoSkills[convo.vars.loopCounter]}`
                }
            },
            {
                "type": "actions",
                "elements": []
            }
        ]);
        for(let i=1;i<=5;i++){
            convo.vars.coSkillsBlock[1].elements.push({
                "type": "button",
                "text": {
                    "type": "plain_text",
                    "emoji": true,
                    "text": `${i}`
                },
                "style": "primary",
                "value": `${i}`
            })
        }
    })


    convo.addQuestion({
        blocks : async (template, vars) => {
            return vars.coSkillsBlock;
        }
    },
    [
        {
            pattern : "cancel",
            type : 'string',
            handler : async (res, convo, bot) => {
                if(convo.vars.enforceFounderquiz){
                    // await bot.say("Please complete the founderquiz before proceeding.");
                    return await convo.repeat();
                }
                else {
                    return await convo.gotoThread("exit_thread");
                }
            }
        },
        {
            default : true,
            type : 'string',
            handler : async (res, convo, bot) => {
                if(isNaN(res) || res < 1 || res > 5){
                    await bot.say("Please use buttons for replying.");
                    return await convo.repeat();
                }
                convo.vars.userUpdateObj.coSkills.push({
                    coSkill : convo.vars.relatedCoSkills[convo.vars.loopCounter],
                    proficiency : Number(res)
                });
                convo.vars.loopCounter++;
                if(convo.vars.loopCounter > 9){
                    return await convo.gotoThread("save_responses_thread");
                }
                // if(convo.vars.loopCounter != 0 && convo.vars.loopCounter % 5 === 0) {
                //     return await convo.gotoThread("next_five_coskills_check_thread");
                // }
                return await convo.gotoThread("co_skill_loop_thread");
            }
        }
    ],
    {},
    "co_skill_loop_thread");

    // convo.addQuestion({
    //     blocks : async (template, vars) => {
    //         return [
    //             {
    //                 "type": "section",
    //                 "text": {
    //                     "type": "mrkdwn",
    //                     "text": `Would you like to see the next five skills?`
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
    //             await bot.say("Please complete the founderquiz before proceeding.");
    //             return await convo.repeat();
    //         }
    //     },
    //     {
    //         pattern : "yes",
    //         handler : async (res, convo, bot) => {
    //             return await convo.gotoThread("co_skill_loop_thread");
    //         }
    //     },
    //     {
    //         pattern : "no",
    //         handler : async (res, convo, bot) => {
    //             return await convo.gotoThread("save_responses_thread");
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
    // "next_five_coskills_check_thread")








































    





    
    convo.before("save_responses_thread", async(convo, bot) => {

        console.log("data to be saved", convo.vars.userUpdateObj)
        let userEmailId = store.get(convo.vars.slack_user_id);
        try {
            await UserApi.updateUserData(userEmailId, convo.vars.userUpdateObj);
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
        text : "Thanks we’ll use this information to help you find resources to help you get better at what you know and find resources to help you build a strong team."
    },"save_responses_thread")




    convo.addGotoDialog("help-dialog-id",  "save_responses_thread");


    convo.addMessage({
        text : "Some error occurred"
    },"error_thread");


    convo.addMessage({
        text : "Thanks for taking founderquiz. You can do it again by typing `founderquiz`."
    },"exit_thread");



    convo.after(async (results, bot) => {
        Logger.log({
            level : "info",
            message : "END of conversation : founderquiz_intent",
            metadata : {
                convo : false,
                userId : store.get(results.user)
            }
        });

    })



    



    controller.addDialog(convo);

    controller.on('message, direct_message', async(bot, message) => {
        if(!store.get(message.user)) {
            return ;
        }

        if(message.text === "founderquiz" || message.intent === "build_profile_intent") {
            userName = "";
            BigFivePersonalityScores = [];
            Logger.log({
                level : "info",
                message : "START of conversation : founderquiz_intent",
                metadata : {
                    convo : true,
                    userId : store.get(message.user)
                }
            });
            await bot.beginDialog(DIALOG_ID);
            

        }


    })
}