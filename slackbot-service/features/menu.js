const store = require('../store/store');
const Logger = require('../utils/Logger');
const { BotkitConversation } = require('botkit');

module.exports = function(controller) {

    const DIALOG_ID = 'menu-dialog';
    let convo = new BotkitConversation(DIALOG_ID, controller);

    
    convo.before("default", async (convo, bot) => {
        convo.setVar("slack_user_id", convo.step.values.user);
    })


    convo.say({
        "text": "<@W1A2BC3DD> approved your travel request. Book any airline you like by continuing below.",
        // "channel": "C061EG9SL",
        "attachments": [
            {
                "fallback": "Book your flights at https://flights.example.com/book/r123456",
                "actions": [
                    {
                        "type": "button",
                        "text": "Book flights 🛫",
                        "url": "https://flights.example.com/book/r123456"
                    }
                ]
            }
        ]
    })

    
    convo.say({
        text : "You can add additional ideas by typing `ideastorm` or develop one of your ideas further by typing `deepdive`. You can get to know more about yourself as a founder using `founderquiz`"
    })


    convo.after(async (results, bot) => {
        Logger.log({
            level : "info",
            message : "END of conversation : menu_intent",
            metadata : {
                convo : false,
                userId : store.get(results.user)
            }
        });

    })

    controller.addDialog(convo);



    controller.on('direct_message, message' , async (bot, message) => {
        if(!store.get(message.user)) {
            return ;
        }
        if(message.intent === "menu_intent") {
            
            Logger.log({
                level : "info",
                message : "START of conversation : menu_intent",
                metadata : {
                    convo : true,
                    userId : store.get(message.user)
                }
            });
           
            await bot.beginDialog(DIALOG_ID);
            
        }
    })
}