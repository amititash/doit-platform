const axios = require('axios');
const store = require('../store/store');
const Logger = require('../utils/Logger');
const numeral = require('numeral');
const { BotkitConversation } = require('botkit');
const KoService = require('../api/ko');

module.exports = function(controller) {
    const DIALOG_ID = "deepdive_customer_segment_dialog";
    let convo = new BotkitConversation(DIALOG_ID, controller);


    convo.before("default", async (convo, bot) => {
        convo.setVar("koUpdateObj", {});
        convo.vars.koUpdateObj._id = convo.vars.ko_id;

        convo.setVar("targetCustomersMap", {});
    });


    convo.before("default", async (convo, bot) => {
        Logger.log({
            level : "info",
            message : "START of conversation: deepdive-customer-segment",
            metadata : {
                convo : true,
                userId : store.get(convo.vars.slack_user_id)
            }
        });


        let targetCustomers = [];
        let ideaDescription = convo.vars.ideaObj.ideaDescription;
        let url = `${process.env.CLASSIFIER_API_URL}/targetCustomer?idea=${ideaDescription}`
        try {
            let response = await axios.get(url);
            targetCustomers = response.data["PRED"].slice(0,10);
            console.log(targetCustomers)
        }
        catch(e){
            console.log(e);
            Logger.log({
                level : "error",
                message : e.message,
                metadata : {
                    error : e,
                    userId : store.get(convo.vars.slack_user_id),
                    intent : "deepdive_customer_segment"
                }
            });
            return await convo.gotoThread("error_thread");
        }
        convo.setVar("target_customer_attachment", [
            {
                "type" : "actions",
                "elements" : []
            }
        ]);
        targetCustomers.forEach( (element,index) => {
            let targetCustomer = element.topic;
            targetCustomer = targetCustomer.charAt(0).toUpperCase() + targetCustomer.slice(1);
            convo.vars.targetCustomersMap[`${index+1}`] = targetCustomer;
            convo.vars.target_customer_attachment[0].elements.push({
                "type": "button",
                "text": {
                    "type": "plain_text",
                    "emoji": true,
                    "text": `${targetCustomer.toLowerCase()}`
                },
                "style": "primary",
                "value": `${index+1}`
            },)
        })
        convo.vars.target_customer_attachment[0].elements.push({
            "type": "button",
            "text": {
                "type": "plain_text",
                "emoji": true,
                "text": `none of these`
            },
            "style": "primary",
            "value": `11`
        })
    })

    convo.addMessage({
        text : "Now let's pivot to customers.",
    },"default");





    convo.addQuestion({
        blocks : async (template, vars) => {
            return [
                {
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": `Are customers who pay for your product/service businesses or individuals?`
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
                                "text": "businesses"
                            },
                            "style": "primary",
                            "value": "businesses"
                        },
                        {
                            "type": "button",
                            "text": {
                                "type": "plain_text",
                                "emoji": true,
                                "text": "individuals"
                            },
                            "style": "primary",
                            "value": "individuals"
                        }
                    ]
                }
            ]
        }
    },
    [
        {
            pattern : "cancel",
            type : "string",
            handler : async (res, convo, bot) => {
                return await convo.gotoThread("early_exit_thread");
            }
        },
        {
            pattern : "businesses",
            type : "string",
            handler : async (res, convo, bot) => {
                convo.vars.koUpdateObj.targetSegment = res;
                return ;
            }
        },
        {
            pattern : "individuals",
            type : "string",
            handler : async (res, convo, bot) => {
                convo.vars.koUpdateObj.targetSegment = res;
                return ;
            }
        },
        {
            default : true,
            type : 'string',
            handler : async (res, convo, bot) => {
                await bot.say("Please use the buttons for replying to above question.")
                return await convo.repeat();
            }
        }
    ],
    {},
    "default");




    

 

    convo.addMessage({
        text : "Which of these labels best describes your target customer?"
    },"default")

    convo.addQuestion({
        blocks : async (template, vars) => {
            return vars.target_customer_attachment
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
                let chosenNumber = res;
                if(chosenNumber == 11) {
                    return await convo.gotoThread("choose_target_customer_thread");
                }
                else if(convo.vars.targetCustomersMap[`${res}`]){
                    convo.setVar("target_customer", convo.vars.targetCustomersMap[`${res}`]);
                    convo.vars.koUpdateObj.targetCustomer = convo.vars.targetCustomersMap[`${res}`];
                    return await convo.gotoThread("chosen_target_customer_thread");
                }
                else {
                    await bot.say({
                        text : "Just choose one of these customer segments, even though there might be more."
                    })
                    return await convo.repeat();
                }
            }
        }
    ],
    {key : 'field16'},
    "default")



    convo.addQuestion({
        text : "Okay. Please enter the target customer."
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
                convo.setVar("target_customer", res);
                convo.vars.koUpdateObj.targetCustomer = res;
                return await convo.gotoThread("chosen_target_customer_thread");
            }
        }
    ],
    {key : 'field17'},
    "choose_target_customer_thread");


  

    convo.addQuestion({
        text : "In plain text, can you name the specific customer segment you are targeting (e.g., employers with less than 50 employees or NGOs that monitor air pollution)?"
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
                let targetCustomerDescription = res;
                convo.vars.koUpdateObj.targetCustomerDescription = targetCustomerDescription;
                return ;
            }
        }
    ],
    {},
    "chosen_target_customer_thread");


    convo.addMessage({
        text : ""
    })

    

    convo.addAction("customer_size_thread", "chosen_target_customer_thread");



    convo.before("customer_size_thread", async (convo, bot) => {
        convo.setVar("customerSizeBlock", [{
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text" : `Let's try to get a rough estimate of your total possible market size.\nWhat is your estimate of the total market size (e.g.,total customers) that could potentially buy your product?`
            }
        },
        {
            "type": "actions",
            "elements": []
        }]);

        let customerSizeRanges = require('../assets/customerPersona/ranges');
        for( let key in customerSizeRanges ) {
            if(customerSizeRanges.hasOwnProperty(key)){
                convo.vars.customerSizeBlock[1].elements.push({
                    "type": "button",
                    "text": {
                        "type": "plain_text",
                        "emoji": true,
                        "text": `${numeral(Number(key)).format('0,0')}`
                    },
                    "style": "primary",
                    "value": `${key}`
                })
            }
        }
    });


    convo.addQuestion({
        blocks : async (template, vars) => {
            return vars.customerSizeBlock;
        }
    },
    [
        {
            pattern : "cancel",
            type : "string",
            handler : async (res, convo, bot) => {
                return await convo.gotoThread("early_exit_thread");
            }
        },
        {
            default : true,
            type : 'string',
            handler : async (res, convo, bot) => {
                console.log("min cust size", res);
                convo.setVar("min_cust_size", Number(res));
                convo.setVar("customerSizeSubRangeBlock", [
                    {
                        "type": "section",
                        "text": {
                            "type": "mrkdwn",
                            "text" : `OK. We’ll assume you have at least ${numeral(convo.vars.min_cust_size).format('0,0')} potential customers. Let’s get more specific. Are any of these figures a better estimate of your market size?`
                        }
                    },
                    {
                        "type": "actions",
                        "elements": []
                    }
                ]);
                let count = 1;
                for(let i = 1;i <=9;i++) {
                    convo.vars.customerSizeSubRangeBlock[1].elements.push({
                        "type": "button",
                        "text": {
                            "type": "plain_text",
                            "emoji": true,
                            "text": `${numeral(Number(res)*count).format('0,0')}`
                        },
                        "style": "primary",
                        "value": `${res*(count)}`
                    })
                    count++;
                }
            }
        }
    ],
    {},
    "customer_size_thread");


    convo.addQuestion({
        blocks : async (template, vars)  => {
            return vars.customerSizeSubRangeBlock;
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
                console.log("max cust size", res);
                convo.setVar("max_cust_size", Number(res));
                //average of min and max
                convo.vars.koUpdateObj.customerSize = convo.vars.min_cust_size + ((convo.vars.max_cust_size - convo.vars.min_cust_size)/2);
            }
        }
    ],
    {},
    "customer_size_thread")


    convo.addMessage({
        text : "Great, we now have a sense of how big your market might be."
    },"customer_size_thread");

    convo.addMessage({
        text : "We now have a sense of your target customers. Let's move to the next step where we get to know more about your *business model*."
    },"customer_size_thread");



    convo.addAction("progress_card_redirect_thread", "customer_size_thread");

    convo.addQuestion({
        text : "How many {{{vars.target_customer}}} do you think exist in the market?"
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
                let numberString = res;
                let number = "";
                try {
                    let response = await axios.get(`${process.env.NUMBER_CONVERTER_API_URL}/convert?text=${numberString}`)
                    number = response.data.value
                }
                catch(e){
                    console.log(e);
                    Logger.log({
                        level : "error",
                        message : e.message,
                        metadata : {
                            error : e,
                            userId : store.get(convo.vars.slack_user_id),
                            intent : "deepdive_customer_segment"
                        }
                    });
                    return await convo.gotoThread("error_thread");
                }
                convo.vars.koUpdateObj.customerSize = number;
                convo.setVar("customer_size", numeral(number).format('0,0'));
                return ;
            }
        }
    ],
    {},
    "chosen_target_customer_thread");



    convo.addQuestion({
        text : "How much do you think {{vars.target_customer}} are willing to pay per year in USD for your product?"
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
                let numberString = res;
                let number = "";
                try {
                    let response = await axios.get(`${process.env.NUMBER_CONVERTER_API_URL}/convert?text=${numberString}`);
                    number = response.data.value;
                }
                catch(e){
                    console.log(e);
                    Logger.log({
                        level : "error",
                        message : e.message,
                        metadata : {
                            error : e,
                            userId : store.get(convo.vars.slack_user_id),
                            intent : "deepdive_customer_segment"
                        }
                    });
                    return await convo.gotoThread("error_thread");
                }
                convo.vars.koUpdateObj.pricePerUser = number;
                let totalAddressableMarket = 0;
                try{
                    totalAddressableMarket = Number(convo.vars.koUpdateObj.customerSize) * Number(convo.vars.koUpdateObj.pricePerUser);
                    convo.vars.koUpdateObj.totalAddressableMarket = Number(convo.vars.koUpdateObj.customerSize) * Number(convo.vars.koUpdateObj.pricePerUser) ;
                }
                catch(e){
                    Logger.log({
                        level : "error",
                        message : e.message,
                        metadata : {
                            error : e,
                            userId : store.get(convo.vars.slack_user_id),
                            intent : "deepdive_customer_segment"
                        }
                    });
                    console.log("enter a numeric value for the number of users and price per user");
                    return await convo.gotoThread("error_thread");
                }
                convo.setVar("total_addressable_market", numeral(totalAddressableMarket).format('0,0'));
            }
        }
    ],
    {key : 'field20'},
    "chosen_target_customer_thread")


    convo.addMessage({
        text : "Based on these assumptions your total addressable market has {{vars.customer_size}} {{vars.target_customer}}. If this is right, the maximum revenue entire market can generate is ${{vars.total_addressable_market}} per year.",
    },"chosen_target_customer_thread");
  

    convo.addAction("progress_card_redirect_thread", "chosen_target_customer_thread");



    convo.before("progress_card_redirect_thread", async(convo, bot) => {
        let userEmailId = store.get(convo.vars.slack_user_id);
        try {
            let savedKo = await KoService.fetchIdea(convo.vars.koUpdateObj._id);
            let koProgress = savedKo.progress;
            if(koProgress < 4){
                convo.vars.koUpdateObj.progress = 4;
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
                    intent : "deepdive_customer_segment"
                }
            });
            await bot.say("Some error occurred in saving the idea.")
        }
    })
    //control goes to deepdive main whre we redirect the user to progress card thread
    convo.addAction("complete", "progress_card_redirect_thread");



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
            message : "END of conversation: deepdive-customer-segment",
            metadata : {
                convo : false,
                userId : store.get(results.user)
            }
        });
    })
    
    controller.addDialog(convo);
}