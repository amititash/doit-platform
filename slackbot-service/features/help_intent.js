const { BotkitConversation } = require('botkit');
const store = require('../store/store');
const Logger = require('../utils/Logger');

module.exports = function(controller) {
    let convo = new BotkitConversation('help-dialog-id', controller);



    convo.before("default", async (convo, bot) => {
        convo.setVar("slack_user_id", convo.step.values.user);
        let testFlow = "both";
        let optionsBlock = [
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": "You can choose from the following options. Type `help` at any time to see a list of available options."
                }
            },
            {
                "type" : "actions",
                "elements" : []
            }
        ];
        if(testFlow === "deepdive"){
            optionsBlock[1].elements.push({
                "type": "button",
                "text": {
                    "type": "plain_text",
                    "emoji": true,
                    "text": "research an idea"
                },
                "style": "primary",
                "value": "deepdive"
            })
        }
        else if(testFlow === "ideastorm"){
            optionsBlock[1].elements.push({
                "type": "button",
                "text": {
                    "type": "plain_text",
                    "emoji": true,
                    "text": "generate many ideas fast"
                },
                "style": "primary",
                "value": "ideastorm"
            })
        }
        else if(testFlow === "both"){
            optionsBlock[1].elements.push({
                "type": "button",
                "text": {
                    "type": "plain_text",
                    "emoji": true,
                    "text": "research an idea"
                },
                "style": "primary",
                "value": "deepdive"
            });
            optionsBlock[1].elements.push({
                "type": "button",
                "text": {
                    "type": "plain_text",
                    "emoji": true,
                    "text": "generate many ideas fast"
                },
                "style": "primary",
                "value": "ideastorm"
            })
        }
        else {
            optionsBlock[1].elements.push({
                "type": "button",
                "text": {
                    "type": "plain_text",
                    "emoji": true,
                    "text": "list ideas"
                },
                "style": "primary",
                "value": "list ideas"
            })
        }
        optionsBlock[1].elements.push({
            "type": "button",
            "text": {
                "type": "plain_text",
                "emoji": true,
                "text": "submit idea for competition"
            },
            "style": "primary",
            "value": "submit idea"
        })
        convo.setVar("optionsBlock", optionsBlock);

    })


 

    convo.say({
        text : "placeholder",
        blocks : async (template, vars) => {
            return vars.optionsBlock
        }
    })

    convo.after( async(results, bot) => {
        Logger.log({
            level : "info",
            message : "END of conversation : help_intent",
            metadata : {
                convo : false,
                userId : store.get(results.user)
            }
        });
    });
    
    controller.addDialog(convo);


    controller.on('message, direct_message', async (bot, message)=> {
        if(!store.get(message.user)) {
            return ;
        }
        if(message.intent === "help_intent") {
            Logger.log({
                level : "info",
                message : "START of conversation : help_intent",
                metadata : {
                    convo : true,
                    userId : store.get(message.user)
                }
            });
            await bot.beginDialog('help-dialog-id');
        }
    })
}