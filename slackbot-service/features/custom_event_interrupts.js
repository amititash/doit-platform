const store = require('../store/store');
const { BotkitConversation } = require('botkit');

module.exports = function(controller) {
    // let helpConvo = new BotkitConversation('help-dialog-id', controller);
    // helpConvo.addMessage({
    //     text : "You can add additional ideas by typing `ideastorm` (many ideas) or develop one of your ideas further by typing `deepdive`."
    // },"default");

    // controller.addDialog(helpConvo);




    // let greetConvo = new BotkitConversation('greet-dialog-id', controller);

    // greetConvo.say({
    //     text : "Hi there! I am here to help you develop your business ideas. 🤖"
    // });

    // greetConvo.say({
    //     text : "Just type `ideastorm` to start brainstorming."
    // })

    // greetConvo.say({
    //     text : "Type `help` at any time to see more options."
    // })


    // greetConvo.after( async (results, bot) => {
    //     console.log("greet convo exec")
    // })

    


    
    // controller.addDialog(greetConvo);



    // controller.on('custom_help_event', async (bot, message) => {
    //     if(!store.get(message.user)) {
    //         console.log("User not found in local storage.");
    //         return ;
    //     }
    //     await bot.beginDialog('help-dialog-id');

    // })


    // controller.on('custom_greet_event', async (bot, message)=> {
    //     if(!store.get(message.user)) {
    //         console.log("User not found in local storage.");
    //         await controller.trigger("custom_user_reg_event", bot, message);
    //         return ;
    //     }
    //     else {
    //         await bot.beginDialog('greet-dialog-id');
    //     }
    // })
}
