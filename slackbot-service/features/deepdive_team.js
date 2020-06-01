const axios = require('axios');
const store = require('../store/store');
const Logger = require('../utils/Logger');
const numeral = require('numeral');
const { BotkitConversation } = require('botkit');
const KoService = require('../api/ko');
const topSkills = require('../assets/teamSection/topSkills');
const coSkills = require('../assets/teamSection/coskills');
const antiSkills = require('../assets/teamSection/antiskills');


module.exports = function(controller) {
    const DIALOG_ID = "deepdive_skills_dialog";

    let convo = new BotkitConversation(DIALOG_ID, controller);

    convo.before("default", async (convo, bot) => {
        Logger.log({
            level : "info",
            message : "END of conversation : deepdive-team",
            metadata : {
                convo : true,
                userId : store.get(convo.vars.slack_user_id)
            }
        });


        convo.setVar("koUpdateObj", {});
        convo.vars.koUpdateObj._id = convo.vars.ko_id;
        convo.setVar("topSkills", topSkills);
        convo.setVar("coSkills", coSkills);
        convo.setVar("antiSkills", antiSkills);
        convo.setVar("loopCounter", 0);
    })
    
    convo.addAction("skill_builder_thread", "default");


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
                return await convo.gotoThread("early_exit_thread");
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
                convo.vars.koUpdateObj.topSkill = convo.vars.topSkills[res].skill;
            }
        }
    ],
    {},
    "skill_builder_thread");


    convo.addAction("coskill_builder_thread", "skill_builder_thread");





    convo.before("coskill_builder_thread", async (convo, bot) => {
        convo.setVar("selectedCoSkills", []);
        convo.vars.loopCounter = 0;
        let filteredCoSkills = convo.vars.coSkills.filter((element) => element.skill === convo.vars.koUpdateObj.topSkill);
        let relatedCoSkills =filteredCoSkills[0].coskill;
        convo.setVar("relatedCoSkills", relatedCoSkills);
    });

    convo.addMessage({
        text : "How proficient are you in the following skill (1= not at all to 5 = I’m a rock star)?"
    },"coskill_builder_thread");

    convo.addAction("co_skill_loop_thread", "coskill_builder_thread");

    convo.before("co_skill_loop_thread", async (convo, bot) => {
        if(!convo.vars.relatedCoSkills[convo.vars.loopCounter]){
            return await convo.gotoThread("anti_skills_builder_thread");
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
                return await convo.gotoThread("early_exit_thread");
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
                convo.vars.selectedCoSkills.push({
                    coSkill : convo.vars.relatedCoSkills[convo.vars.loopCounter],
                    proficiency : Number(res)
                })
                console.log(convo.vars.selectedCoSkills);
                convo.vars.loopCounter++;
                if(convo.vars.loopCounter != 0 && convo.vars.loopCounter % 5 === 0) {
                    return await convo.gotoThread("next_five_coskills_check_thread");
                }
                return await convo.gotoThread("co_skill_loop_thread");
            }
        }
    ],
    {},
    "co_skill_loop_thread");

    convo.addQuestion({
        blocks : async (template, vars) => {
            return [
                {
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": `Would you like to see the next five skills?`
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
            handler : async (res, convo, bot) => {
                return await convo.gotoThread("co_skill_loop_thread");
            }
        },
        {
            pattern : "no",
            handler : async (res, convo, bot) => {
                return await convo.gotoThread("anti_skills_builder_thread");
            }
        },
        {
            default : true,
            handler : async (res, convo, bot) => {
                await bot.say("Please use the buttons for replying.")
                return await convo.repeat();
            }
        }   
    ],
    {},
    "next_five_coskills_check_thread")




    convo.before("anti_skills_builder_thread", async (convo, bot) => {
        convo.setVar("loopCounter", -1);
        convo.vars.koUpdateObj.antiSkills = [];
        console.log(antiSkills);
        let filteredAntiSkills = antiSkills.filter( (element) => element.skill === convo.vars.koUpdateObj.topSkill);
        convo.setVar("antiSkillsSet", filteredAntiSkills[0].antiskill.slice(0,10));
        convo.vars.koUpdateObj.antiSkills = convo.vars.antiSkillsSet;
    })

   


    convo.addAction("progress_card_redirect_thread", "anti_skills_builder_thread");


    convo.before("progress_card_redirect_thread", async(convo, bot) => {
        let userEmailId = store.get(convo.vars.slack_user_id);
        try {
            let savedKo = await KoService.fetchIdea(convo.vars.koUpdateObj._id);
            let koProgress = savedKo.progress;
            if(koProgress < 6){
                convo.vars.koUpdateObj.progress = 6;
            }
            await KoService.storeIdea(userEmailId, convo.vars.koUpdateObj);
            console.log("local scope data from about_customers saved in backend")
        }
        catch(e){
            console.log(e);
            Logger.log({
                level : "error",
                message : e.message,
                metadata : {
                    error : e,
                    userId : store.get(convo.vars.slack_user_id),
                    intent : "deepdive_team"
                }
            })
            await bot.say("Some error occurred in saving the idea.")
        }
    })

    convo.addMessage({
        text : "Thanks we now have a sense of your skills."
    },"progress_card_redirect_thread");

    convo.addAction("complete", "progress_card_redirect_thread");


    convo.addMessage({
        text : "Some error occurred. Please try again."
    },"error_thread");


    convo.addMessage({
        text : "Ok, that's fine. You can always add additional ideas by typing `ideastorm` or develop one of your ideas further by typing `deepdive`."
    },"early_exit_thread");


    convo.after(async (results, bot) => {
        Logger.log({
            level : "info",
            message : "END of conversation : deepdive-team",
            metadata : {
                convo : false,
                userId : store.get(results.user)
            }
        });
    })


    controller.addDialog(convo);
}