const store = require('../store/store');
const Logger = require('../utils/Logger');
const { BotkitConversation } = require('botkit');


module.exports = function(controller) {
    const DIALOG_ID = 'thanks-dialog';
    let convo = new BotkitConversation(DIALOG_ID, controller);

    convo.say({
        text : "You are welcome."
    })


    convo.after(async (results, bot) => {
        Logger.log({
            level : "info",
            message : "END of conversation : thank_intent",
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

        if(message.intent === "thank_intent") {
            Logger.log({
                level : "info",
                message : "START of conversation : thank_intent",
                metadata : {
                    convo : true,
                    userId : store.get(message.user)
                }
            });
            await bot.beginDialog(DIALOG_ID);
            
        }
    })
}