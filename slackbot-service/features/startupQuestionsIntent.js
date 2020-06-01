const store = require('../store/store');
const axios = require('axios');
const Logger = require('../utils/Logger');
const questionElasticSearch = require('../utils/es_startupQuestions.js');
const { BotkitConversation } = require('botkit');

module.exports = function(controller) {
    let questionsMap = {};

    const DIALOG_ID = 'startup-questions-dialog';
    let convo = new BotkitConversation(DIALOG_ID, controller);


    convo.before("default", async (convo, bot) => {
        convo.setVar("slack_user_id", convo.step.values.user);
    })

    convo.addQuestion({
        text : "Okay. What is your question?"
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
                let question = res;
                let similarQuestionsString = "";
                let nluUrl = `${process.env.NUMBER_CONVERTER_API_URL}/getTags?text=${question}`
                try {
                    let tagsNluResponse = await axios.get(nluUrl);
                    let tags = tagsNluResponse.data.tags;
                    if(tags.length){
                        //if we get tags then question is replaced by concat of tags, else remains same
                        question = tags.join(' ');
                    }
                    let response = await questionElasticSearch.questionSearch(question);
                    response = response.slice(0,4);
                    response.forEach( (element,index) => {
                        questionsMap[`${index+1}`] = element._source;
                        similarQuestionsString += `${index+1}. ${element._source.Question}\n`
                    })
                    convo.setVar("similar_questions", similarQuestionsString);
                }
                catch(e) {
                    console.log(e);
                    Logger.log({
                        level : "error",
                        message : e.message,
                        metadata : {
                            userId : store.get(convo.vars.slack_user_id),
                            intent : "startupQuestions intent"
                        }
                    })
                    return await convo.gotoThread("error_thread");
                }
            }
        }
    ],
    {},
    "default");


    convo.addMessage({
        text : "We found the following questions similar to yours."
    },"default");

    convo.addMessage({
        text :"{{{vars.similar_questions}}}"
    },"default");

    convo.addQuestion({
        text : "Which of these is most relevant?"
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
                let num = res;
                if(!questionsMap[num]){
                    await bot.say({
                        text : "Please choose a valid option."
                    });
                    return await convo.repeat();
                }
                else {
                    let answersString = "";
                    let count = 1;
                    console.log('sel question' , questionsMap[num] );
                    for(let key in questionsMap[num]){
                        if(questionsMap[num].hasOwnProperty(key)){
                            if(key !== "Question"){
                                answersString += `${count++}. ${questionsMap[num][key]}\n`
                            }
                        }
                    }
                    convo.setVar("answers_string", answersString)
                }
            }
        }
    ],
    {},
    "default");

    convo.addMessage({
        text : "We have found following answers to your question."
    },"default");

    convo.addMessage({
        text : "{{{vars.answers_string}}}"
    },"default");




    convo.addMessage({
        text : "Okay. That's fine. You can always type `startiq questions` to get answers to your questions."
    },"early_exit_thread")




    convo.addMessage({
        text : 'Some error occurred'
    },"error_thread");

    convo.after(async (results, bot) => {
        Logger.log({
            level : "info",
            message : "END of conversation : startup_questions_intent",
            metadata : {
                convo : false,
                userId : store.get(results.user)
            }
        });

    })


    controller.addDialog(convo);




    controller.on('message, direct_message', async (bot, message) =>{

        if(!store.get(message.user)) {
            return ;
        }



        if(message.intent === "startup_questions_intent"){
            questionsMap = {};
            Logger.log({
                level : "info",
                message : "START of conversation : startup_questions_intent",
                metadata : {
                    convo : true,
                    userId : store.get(message.user)
                }
            });
            await bot.beginDialog(DIALOG_ID);
        }

    })
}