const Logger = require('../utils/Logger');
const axios = require('axios');
const store = require('../store/store');

module.exports = function(controller) {

    /**
     * We need userEmailId as global because slack id info is not available in the send middleware,
     * but we can set this using the slack id from receive middleware. In our bot, this is valid bacause ANYTIME the bot will
     * send the message to the same user from which it is receiving the message. If we manipulate this later on, then 
     * this might not be valid. 
     */
    let USER_EMAIL_ID = "";

    controller.middleware.receive.use( async function (bot, message, next){
        //checks and prints if new user enters the system
        if(!store.get(message.user)){
            console.log("message by unregistered user");
        }
        next();
    });


    controller.middleware.receive.use(async function(bot, message, next) {

        /**
         * This middleware is used to control interrupts
         */
        let logData = [];
        try {
            logData = await axios.post(`${process.env.LOGGER_API_URL}/find`, {
                "query" : {
                    "meta.convo" : {
                        "$exists" : true
                    },
                    "meta.userId" : store.get(message.user) || "Error: unregistered user"
                },
                "sort" : "-timestamp"
            });
            logData = logData.data;
        }
        catch(e){
            console.log("error in Logger api", e);
            Logger.log({
                level : "error",
                message : e.message,
                metadata : {
                    userId : store.get(message.user),
                    intent : "error in fetching Logger data in middleware"
                }
            })
        }
        if(logData.length && logData[0]["meta"]["convo"]){
            // if bot is in convo, all the interrupts are rendered inactive
            console.log("bot inside some convo");
            next();
        }

        else {
            //code reaches here only if bot not in convo.
            // const interrupt_intents = ["help_intent", "default_welcome_intent"];
            const interrupt_intents = [];
            
            if(interrupt_intents.includes(message.intent) ){
                let custom_event = "";
                switch(message.intent){
                    case "help_intent" :
                        custom_event = "custom_help_event";
                        break;
                    case "default_welcome_intent":
                        custom_event = "custom_greet_event";
                        break;
                    default:
                        custom_event = "direct_message"
                }

                controller.trigger(custom_event, bot, message);
            }
            else{
                next();
            }
        }
    })



    controller.middleware.receive.use(function (bot, message, next){
        USER_EMAIL_ID = store.get(message.user);
        Logger.log({
            level : "info",
            message : "received_message",
            metadata : {
                message_text : message.text,
                userId : USER_EMAIL_ID
            }
        })
        next();
    })


    controller.middleware.send.use(function (bot, message, next) {
        if(message.channelData.blocks){
            Logger.log({
                level : "info",
                message : "sent_message",
                metadata : {
                    message_blocks : message.channelData.blocks,
                    userId : USER_EMAIL_ID
                }
            })  
        }
        else {
            Logger.log({
                level : "info",
                message : "sent_message",
                metadata : {
                    message_text : message.text,
                    userId : USER_EMAIL_ID
                }
            })
        }
        next();
    });



    
}