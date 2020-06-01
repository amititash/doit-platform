const axios = require('axios');
const store = require('../store/store');
const Logger = require('../utils/Logger');
const { BotkitConversation } = require('botkit');
const KoService = require('../api/ko');
const numeral = require('numeral');
const accounting = require('accounting');



module.exports = function(controller) {
    const DIALOG_ID = "deepdive_business_model_dialog";
    let convo = new BotkitConversation(DIALOG_ID, controller);



    convo.before("default", async (convo, bot) => {
        Logger.log({
            level : "info",
            message : "START of conversation: deepdive-business-model",
            metadata : {
                convo : true,
                userId : store.get(convo.vars.slack_user_id)
            }
        });
        let ko = {};
        try {
            ko = await KoService.fetchIdea(convo.vars.ko_id);
        }
        catch(e) {
            console.log(e);
            Logger.log({
                level : "error",
                message : e.message,
                metadata : {
                    error : e,
                    userId : store.get(convo.vars.slack_user_id),
                    intent : "deepdive_business_model"
                }
            })
            convo.gotoThread("error_thread");
        }
        convo.setVar("koUpdateObj", {});
        convo.vars.koUpdateObj.businessModel = {
            employees : [],
            otherExpenses : []
        };
        convo.vars.koUpdateObj._id = convo.vars.ko_id;
        convo.setVar("totalMonths" , 12);
        convo.setVar("totalMarketSize", ko.customerSize);
        convo.setVar("growthRateBlock", [
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": `Businesses need to get better at acquiring customers over time. In the best-case scenario, how much can you improve customer acquisition each month in % terms?`
                }
            },
            {
                "type": "actions",
                "elements": [
                ]
            }
        ])
        for(let i = 0 ; i<= 10 ; i+=5){
            convo.vars.growthRateBlock[1].elements.push({
                "type": "button",
                "text": {
                    "type": "plain_text",
                    "emoji": true,
                    "text": `${i}%`
                },
                "style": "primary",
                "value": `${i}`
            })
        }
        const numberOfUnits = [1,5,10,20,50,100,1000,5000];
        
        convo.setVar("numberOfUnitsBlock", [
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": `How many units of the product does a given customer purchase in one month?`
                }
            },
            {
                "type": "actions",
                "elements": []
            }
        ])
        numberOfUnits.forEach((element) => {
            convo.vars.numberOfUnitsBlock[1].elements.push({
                "type": "button",
                "text": {
                    "type": "plain_text",
                    "emoji": true,
                    "text": `${element}`
                },
                "style": "primary",
                "value": `${element}`
            })
        })
    });





    convo.addMessage({
        text : "Every business is built on a model of how it will make money. In this module, we’ll help you estimate your business’ potential revenue and profits."
    },"default");

    



    convo.addQuestion({
        blocks : async (template, vars) => {
            return [
                {
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": `Will you have a subscription service type model where you build a long-term relationship with your customer?`
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
            type : "string",
            handler : async (res, convo, bot) => {
                return await convo.gotoThread("early_exit_thread");
            }   
        },
        {
            pattern : "yes",
            type : "string",
            handler : async (res, convo, bot) => {
                convo.setVar("subscriptionService", 1);
                convo.vars.koUpdateObj.businessModel.subscriptionService = true;
                return await convo.gotoThread("subscription_service_thread");    
            }
        },
        {
            pattern : "no",
            type : "string",
            handler : async (res, convo, bot) => {
                convo.setVar("subscriptionService", 0);
                convo.vars.koUpdateObj.businessModel.subscriptionService = false;
                return await convo.gotoThread("non_subscription_thread");
            }
        },
        {
            default : true,
            type : 'string',
            handler : async (res, convo, bot) => {
                await bot.say("Please use the buttons for replying to above question.");
                return await convo.repeat();
            }
        }   
    ],
    {},
    "default");


    convo.before("non_subscription_thread", async (convo, bot) => {
        convo.setVar("persistence", 0);
        convo.setVar("subscriptionPrice", 0);
        convo.setVar("anyAdditionalPurchase", 0);

        convo.vars.koUpdateObj.businessModel.customerPersistence = convo.vars.persistence;
        convo.vars.koUpdateObj.businessModel.subscriptionPrice = 0;
        
    })


    convo.addQuestion({
        text : "How many customers do you think you can acquire in the first month of your business"
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
                let number = res.trim();
                if(isNaN(number)){
                    await bot.say("Please enter a valid number");
                    return await convo.repeat();
                }
                convo.setVar("newCustomers", Number(number));
                convo.vars.koUpdateObj.businessModel.customersInFirstMonth = convo.vars.newCustomers;
                console.log("newCustomers", convo.vars.newCustomers);
                return ;
            }
        }  
    ],
    {},
    "non_subscription_thread");


    convo.addQuestion({
        blocks : async (template, vars) => {
            return vars.growthRateBlock
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
                let number = res.trim();
                if(number.charAt(number.length-1)==="%"){
                    number = number.substring(0, number.length - 1);
                }
                if(isNaN(number)){
                    await bot.say("Please use the buttons for replying.");
                    return await convo.repeat();
                }
                let customerGrowth = Number(number) / 100;
                convo.setVar("customerGrowth", customerGrowth);
                convo.vars.koUpdateObj.businessModel.customerGrowth = convo.vars.customerGrowth;
                console.log("customerGrowth", convo.vars.customerGrowth);
                return ;
            }
        }
    ],
    {},
    "non_subscription_thread");



    convo.addQuestion({
        text : "How much do you charge for one unit of your product or service?"
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
                res = res.trim();
                let number = accounting.unformat(res);
                if(isNaN(number)){
                    await bot.say("Please enter a valid number");
                    return await convo.repeat();
                }
                convo.setVar("unitPrice", Number(number));
                convo.vars.koUpdateObj.businessModel.unitPrice = convo.vars.unitPrice;
                console.log("unit price", convo.vars.unitPrice);                
                return ;
            }
        }
    ],
    {},
    "non_subscription_thread")


    convo.addQuestion({
        blocks : async (template, vars) => {
            return vars.numberOfUnitsBlock;
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
                let number = res.trim();
                if(isNaN(number)){
                    await bot.say("Please use the buttons for replying.");
                    return await convo.repeat();
                }
                convo.setVar("units", Number(number));
                convo.vars.koUpdateObj.businessModel.units = convo.vars.units;
                console.log("units", convo.vars.units);
                return ;
            }
        }
    ],
    {},
    "non_subscription_thread");

    convo.addAction("cost_estimation_thread", "non_subscription_thread" );


    


    convo.before("subscription_service_thread", async (convo, bot) => {
        convo.setVar("growthRateBlock", [
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": `Businesses need to get better at acquiring customers over time. In the best-case scenario, how much can you improve customer acquisition each month in % terms?`
                }
            },
            {
                "type": "actions",
                "elements": [
                ]
            }
        ])
        for(let i = 0 ; i<= 10 ; i+=5){
            convo.vars.growthRateBlock[1].elements.push({
                "type": "button",
                "text": {
                    "type": "plain_text",
                    "emoji": true,
                    "text": `${i}%`
                },
                "style": "primary",
                "value": `${i}`
            })
        }


        convo.setVar("persistenceRateBlock", [
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": `What would be the monthly persistence of your customers using this service?`
                }
            },
            {
                "type": "actions",
                "elements": []
            }
        ])

        for(let i = 20 ; i<= 70 ; i+=10){
            convo.vars.persistenceRateBlock[1].elements.push({
                "type": "button",
                "text": {
                    "type": "plain_text",
                    "emoji": true,
                    "text": `${i}%`
                },
                "style": "primary",
                "value": `${i}`
            })
        }

    })



    convo.addMessage({
        text : "Let's begin by estimating the revenue that you will generate from subscriptions."
    },"subscription_service_thread");




    convo.addQuestion({
        text : "How many customers do you think you can acquire in the first month of your business"
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
                let number = res.trim();
                if(isNaN(number)){
                    await bot.say("Please enter a valid number");
                    return await convo.repeat();
                }
                convo.setVar("newCustomers", Number(number));
                convo.vars.koUpdateObj.businessModel.customersInFirstMonth = convo.vars.newCustomers;
                console.log("newCustomers", convo.vars.newCustomers);
                return ;
            }
        }  
    ],
    {},
    "subscription_service_thread");


    convo.addQuestion({
        blocks : async (template, vars) => {
            return vars.growthRateBlock;
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
                let number = res.trim();
                if(number.charAt(number.length-1)==="%"){
                    number = number.substring(0, number.length - 1);
                }
                if(isNaN(number)){
                    await bot.say("Please use the buttons for replying.");
                    return await convo.repeat();
                }
                let customerGrowth = Number(number) / 100;
                convo.setVar("customerGrowth", customerGrowth);
                convo.vars.koUpdateObj.businessModel.customerGrowth = convo.vars.customerGrowth;
                console.log("customer growth", convo.vars.customerGrowth);
            }
        }
    ],
    {},
    "subscription_service_thread");



    convo.addQuestion({
        blocks : async (template, vars) => {
            return vars.persistenceRateBlock;
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
                let persistence = 0;
                res = res.trim();
                if(res.charAt(res.length-1)==="%"){
                    res = res.substring(0, res.length - 1);
                }
                if(isNaN(res)){
                    await bot.say("Please use the buttons for replying.");
                    return await convo.repeat();
                }

                ///Confirm this from titash!!!
                else {
                    persistence = Number(res);
                    if(persistence > 1){
                        persistence = persistence / 100;
                    }
                }
                convo.setVar("persistence", persistence);
                convo.vars.koUpdateObj.businessModel.customerPersistence = convo.vars.persistence;
                console.log("persistence", persistence);
            }
        }   
    ],
    {},
    "subscription_service_thread");





    convo.addQuestion({
        text : "What is the price that each customer pays for the subscription per month in dollars?"
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
                res = res.trim();
                let number = accounting.unformat(res);
                if(isNaN(number)){
                    await bot.say("Please enter a valid number");
                    return await convo.repeat();
                }
                convo.setVar("subscriptionPrice", Number(number));
                convo.vars.koUpdateObj.businessModel.subscriptionPrice = convo.vars.subscriptionPrice;
                console.log('sub price', convo.vars.subscriptionPrice);
            }
        }   
    ],
    {},
    "subscription_service_thread");



    convo.addQuestion({
        blocks : async (template, vars) => {
            return [
                {
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": `Do your customers also regularly purchase other goods or services from you in addition to the subscription fee?`
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
            type : "string",
            handler : async (res, convo, bot) => {
                return await convo.gotoThread("early_exit_thread");
            }
        },
        {
            pattern : "yes",
            type : "string",
            handler : async (res, convo, bot) => {
                convo.setVar("anyAdditionalPurchase", 1);
                return await convo.gotoThread("additional_purchases_thread");
            }
        },
        {
            pattern : "no",
            type : "string",
            handler : async (res, convo, bot) => {
                convo.setVar("anyAdditionalPurchase", 0);
                convo.setVar("units", 0);
                convo.setVar("unitPrice", 0);
                return ;
            }
        },
        {
            default : true,
            type : 'string',
            handler : async (res, convo, bot) => {
                await bot.say("Please use the buttons for replying to this question.")
                return await convo.repeat();
            }
        }
    ],
    {},
    "subscription_service_thread");


    convo.addAction("cost_estimation_thread", "subscription_service_thread");

    convo.addMessage({
        text : "Ok, let's figure out your unit economics."
    },"additional_purchases_thread");




    convo.addQuestion({
        text : "How much do you charge for one unit of this product or service?"
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
                res = res.trim();
                let number = accounting.unformat(res);
                if(isNaN(number)){
                    await bot.say("Please enter a valid number");
                    return await convo.repeat();
                }
                convo.setVar("unitPrice", Number(number));
                convo.vars.koUpdateObj.businessModel.unitPrice = convo.vars.unitPrice;
                console.log("unit price", convo.vars.unitPrice);
                return ;
            }
        }
    ],
    {},
    "additional_purchases_thread")


    convo.addQuestion({
        blocks : async (template, vars) => {
            return vars.numberOfUnitsBlock;
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
                let number = res.trim();
                if(isNaN(number)){
                    await bot.say("Please use the buttons for replying.");
                    return await convo.repeat();
                }
                convo.setVar("units", Number(number));
                convo.vars.koUpdateObj.businessModel.units = convo.vars.units;
                console.log("units", convo.vars.units);
                return ;
            }
        }
    ],
    {},
    "additional_purchases_thread");

    convo.addAction("cost_estimation_thread", "additional_purchases_thread");


    convo.before("cost_estimation_thread", async (convo, bot) => {
        const factors = [0.1, 0.25, 0.5, 0.75, 1, 1.1, 1.25, 1.5, 1.75, 2];
        convo.setVar("customerAcquisitionCostBlock", [
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": `How much does it cost you to acquire one customer (here are some ballpark figures)?`
                }
            },
            {
                "type": "actions",
                "elements": []
            }
        ])
        factors.forEach( (element) => {
            let costMultiplier = convo.vars.subscriptionPrice +  convo.vars.units * convo.vars.unitPrice ;
            convo.vars.customerAcquisitionCostBlock[1].elements.push({
                "type": "button",
                "text": {
                    "type": "plain_text",
                    "emoji": true,
                    "text": `$${1+Math.floor(element*costMultiplier)}`
                },
                "style": "primary",
                "value": `${1+Math.floor(element*costMultiplier)}`
            })
        })
        const marginalCostFactors = [0.1, 0.25, 0.5, 0.75, 1, 1.1, 1.25, 1.5, 1.75, 2];
        convo.setVar("marginalCostBlock", [
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": `What is the cost for you to produce one unit of your product or service (not accounting for the fixed costs of technology, capital or labor)?`
                }
            },
            {
                "type": "actions",
                "elements": []
            }
        ])
        marginalCostFactors.forEach((element) => {
            convo.vars.marginalCostBlock[1].elements.push({
                "type": "button",
                "text": {
                    "type": "plain_text",
                    "emoji": true,
                    "text": `$${1+Math.floor(element*convo.vars.unitPrice)}`
                },
                "style": "primary",
                "value": `${1+Math.floor(element*convo.vars.unitPrice)}`
            })
        })
        const arrSum = function(arr){
            return arr.reduce(function(a,b){
              return a + b
            }, 0);
        }
        convo.vars.koUpdateObj.totalCustomers = [];
        convo.vars.koUpdateObj.totalRevenue = [];
        let fullMarketRevenue = 0;
        let annualRevenueFromSubscription = 0;
        let annualRevenueFromOtherSales = 0;
        for(let j = 1; j <= convo.vars.totalMonths; j++) {
            let multiplier = 0;
            for(let i = 0; i < j; i++) {
                multiplier += Math.pow(convo.vars.persistence,i);
            }
            console.log(`multiplier after ${j} th month`, multiplier);
            convo.vars.koUpdateObj.totalCustomers[j-1] = Math.floor(convo.vars.newCustomers*Math.pow((1+convo.vars.customerGrowth),j-1)*multiplier);
            let monthlyRevenueFromSubscription = (convo.vars.subscriptionService*convo.vars.koUpdateObj.totalCustomers[j-1]*convo.vars.subscriptionPrice);
            let monthlyRevenueFromOtherSales = convo.vars.koUpdateObj.totalCustomers[j-1]*convo.vars.unitPrice*convo.vars.units;
            convo.vars.koUpdateObj.totalRevenue[j-1] =  Math.round(monthlyRevenueFromSubscription + monthlyRevenueFromOtherSales);
            annualRevenueFromSubscription += monthlyRevenueFromSubscription;
            annualRevenueFromOtherSales += monthlyRevenueFromOtherSales;
            console.log(`subscript revenue cost for ${j} th month : `, monthlyRevenueFromSubscription);
            console.log(`other sales revenue for ${j} th month : `, monthlyRevenueFromOtherSales);
        }
        fullMarketRevenue = (convo.vars.totalMarketSize*convo.vars.units*convo.vars.unitPrice*convo.vars.totalMonths)+(convo.vars.subscriptionService*convo.vars.subscriptionPrice*convo.vars.totalMonths);
        console.log("Total customers : " , convo.vars.koUpdateObj.totalCustomers)
        console.log("Total revenue : " , convo.vars.koUpdateObj.totalRevenue)
        console.log("Sum of total revenue : " , arrSum(convo.vars.koUpdateObj.totalRevenue))
        console.log("Full market Revenue : " , fullMarketRevenue)
        convo.vars.koUpdateObj.businessModel.totalAnnualRevenue = arrSum(convo.vars.koUpdateObj.totalRevenue);
        convo.vars.koUpdateObj.businessModel.annualRevenueFromOtherSales = annualRevenueFromOtherSales;
        convo.vars.koUpdateObj.businessModel.annualRevenueFromSubscription = annualRevenueFromSubscription;
    })

    convo.addMessage({
        text : "Ok, now let’s pivot to costs."
    },"cost_estimation_thread");

    convo.addQuestion({
        blocks : async (template, vars) => {
            return vars.customerAcquisitionCostBlock;
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
                res = res.trim();
                let number = accounting.unformat(res);
                if(isNaN(number)){
                    console.log("inside isNan", number);
                    await bot.say("Please enter a valid number");
                    return await convo.repeat();
                }
                convo.setVar("customerAcquisition", Number(number));
                console.log("customer acquisition cost", convo.vars.customerAcquisition);
                if(!convo.vars.subscriptionService){
                    // not a subscription service
                    return await convo.gotoThread("unit_cost_thread");
                }
                if(convo.vars.anyAdditionalPurchase){
                    //subscription with additional purchase
                    return await convo.gotoThread("marginal_unit_cost_thread");
                }
                if(!convo.vars.anyAdditionalPurchase){
                    //subscription without additional purchase
                    convo.setVar("unitCost", 0);
                    return await convo.gotoThread("fixed_costs_thread");
                }
            }
        }
    ],
    {},
    "cost_estimation_thread");





    convo.addQuestion({
        blocks : async (template, vars) => {
            return vars.marginalCostBlock;
        }
    },
    [
        {
            pattern : "cancel",
            type : 'string',
            handler : async (res, convo, bot) => {
                return await  convo.gotoThread("early_exit_thread");
            }
        },
        {
            default : true,
            type : 'string',
            handler : async (res, convo, bot) => {
                res = res.trim();
                let number = accounting.unformat(res);
                if(isNaN(number)){
                    await bot.say("Please enter a valid number");
                    return await convo.repeat();
                }
                let unitCost = Number(number);
                convo.setVar("unitCost", unitCost);
                console.log("unit cost", convo.vars.unitCost);
            }
        }
    ],
    {},
    "marginal_unit_cost_thread");



    convo.addAction("fixed_costs_thread", "marginal_unit_cost_thread");




    convo.addQuestion({
        text : "How much does it cost you to produce one unit of your product or service?"
    },
    [
        {
            pattern : "cancel",
            type : 'string',
            handler : async (res, convo, bot) => {
                return await  convo.gotoThread("early_exit_thread");
            }
        },
        {
            default : true,
            type : 'string',
            handler : async (res, convo, bot) => {
                res = res.trim();
                let number = accounting.unformat(res);
                if(isNaN(number)){
                    await bot.say("Please enter a valid number");
                    return await convo.repeat();
                }
                let unitCost = Number(number);
                convo.setVar("unitCost", unitCost);
                console.log("unit cost", convo.vars.unitCost);
            }
        }
    ],
    {},
    "unit_cost_thread");

    convo.addAction("fixed_costs_thread", "unit_cost_thread");


    convo.before("fixed_costs_thread", async (convo, bot) => {
        convo.setVar("allFixedCosts", []);
    })

    convo.addMessage({
        text : "*Finally, let's think through your fixed costs of labor, capital and technology for a barebones startup.*"
    },"fixed_costs_thread");




    
    convo.addQuestion({
        blocks : async (template, vars) => {
            return [
                {
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": `Will you pay yourself (i.e., the CEO)? ($75000)`
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
                return await  convo.gotoThread("early_exit_thread");
            }
        },
        {
            pattern : "yes",
            type : 'string',
            handler : async (res, convo, bot) => {
                convo.vars.koUpdateObj.businessModel.employees.push({ position : 'ceo', salary : 75000 });
                convo.vars.allFixedCosts.push(75000);
                return ;
            }
        },
        {
            pattern : "no",
            type : 'string',
            handler : async (res, convo, bot) => {
                return ;
            }   
        },
        {
            default : true,
            type : 'string',
            handler : async (res, convo, bot) => {
                await bot.say("Please use the buttons for replying.");
                return await convo.repeat();
            }
        }
    ],
    {},
    "fixed_costs_thread");

    convo.addQuestion({
        blocks : async (template, vars) => {
            return [
                {
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": `Will you need a software developer? ($100,000)`
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
                return await  convo.gotoThread("early_exit_thread");
            }
        },
        {
            pattern : "yes",
            type : 'string',
            handler : async (res, convo, bot) => {
                convo.vars.koUpdateObj.businessModel.employees.push({ position : 'software developer', salary : 100000 });
                convo.vars.allFixedCosts.push(100000);
                return ;
            }
        },
        {
            pattern : "no",
            type : 'string',
            handler : async (res, convo, bot) => {
                return ;
            }
        },
        {
            default : true,
            type : 'string',
            handler : async (res, convo, bot) => {
                await bot.say("Please use the buttons for replying.");
                return await convo.repeat();
            }
        }
    ],
    {},
    "fixed_costs_thread");
    convo.addQuestion({
        blocks : async (template, vars) => {
            return [
                {
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": `How about a product manager? ($107,000)`
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
                return await  convo.gotoThread("early_exit_thread");
            }
        },
        {
            pattern : "yes",
            type : 'string',
            handler : async (res, convo, bot) => {
                convo.vars.koUpdateObj.businessModel.employees.push({ position : 'product manager', salary : 107000 });
                convo.vars.allFixedCosts.push(107000);
                return ;
            }
        },
        {
            pattern : "no",
            type : 'string',
            handler : async (res, convo, bot) => {
                return;
            }
        },
        {
            default : true,
            type : 'string',
            handler : async (res, convo, bot) => {
                await bot.say("Please use the buttons for replying.");
                return await convo.repeat();
            }
        }
    ],
    {},
    "fixed_costs_thread");


    convo.addQuestion({
        blocks : async (template, vars) => {
            return [
                {
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": `How about a data scientist? ($101,000)`
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
                return await  convo.gotoThread("early_exit_thread");
            }
        },
        {
            pattern : "yes",
            type : 'string',
            handler : async (res, convo, bot) => {
                convo.vars.koUpdateObj.businessModel.employees.push({ position : 'data scientist', salary : 101000 });
                convo.vars.allFixedCosts.push(101000);
                return ;
            }
        },
        {
            pattern : "no",
            type : 'string',
            handler : async (res, convo, bot) => {
                return ;
            }
        },
        {
            default : true,
            type : 'string',
            handler : async (res, convo, bot) => {
                await bot.say("Please use the buttons for replying.");
                return await convo.repeat();
            }
        }
    ],
    {},
    "fixed_costs_thread");


    convo.addQuestion({
        blocks : async (template, vars) => {
            return [
                {
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": `How about a sales and marketing director? ($97,000)`
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
                return await  convo.gotoThread("early_exit_thread");
            }
        },
        {
            pattern : "yes",
            type : 'string',
            handler : async (res, convo, bot) => {
                convo.vars.koUpdateObj.businessModel.employees.push({ position : 'sales and marketing director', salary : 97000 });
                convo.vars.allFixedCosts.push(97000);
                return ;
            }
        },
        {
            pattern : "no",
            type : 'string',
            handler : async (res, convo, bot) => {
                return ;
            }
        },
        {
            default : true,
            type : 'string',
            handler : async (res, convo, bot) => {
                await bot.say("Please use the buttons for replying.");
                return await convo.repeat();
            }
        }
    ],
    {},
    "fixed_costs_thread");

    convo.addMessage({
        text : "*Let’s pivot to other business expenses.*"
    },"fixed_costs_thread");


    convo.addQuestion({
        blocks : async (template, vars) => {
            return [
                {
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": `Will you need to rent office space? ($33,000)`
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
                return await  convo.gotoThread("early_exit_thread");
            }
        },
        {
            pattern : "yes",
            type : 'string',
            handler : async (res, convo, bot) => {
                convo.vars.allFixedCosts.push(33000);
                convo.vars.koUpdateObj.businessModel.otherExpenses.push({expenseType : 'rent', cost : 33000});
                return ;
            }
        },
        {
            pattern : "no",
            type : 'string',
            handler : async (res, convo, bot) => {
                return ;
            }
        },
        {
            default : true,
            type : 'string',
            handler : async (res, convo, bot) => {
                await bot.say("Please use the buttons for replying.");
                return await convo.repeat();
            }
        }
    ],
    {},
    "fixed_costs_thread");


    convo.addQuestion({
        blocks : async (template, vars) => {
            return [
                {
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": `Will you need to spend money on advertising and marketing? ($2,500)`
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
                return await  convo.gotoThread("early_exit_thread");
            }
        },
        {
            pattern : "yes",
            type : 'string',
            handler : async (res, convo, bot) => {
                convo.vars.allFixedCosts.push(2500);
                convo.vars.koUpdateObj.businessModel.otherExpenses.push({expenseType : 'advertising and marketing', cost : 2500})
                return ;
            }
        },
        {
            pattern : "no",
            type : 'string',
            handler : async (res, convo, bot) => {
                return ;
            }
        },
        {
            default : true,
            type : 'string',
            handler : async (res, convo, bot) => {
                await bot.say("Please use the buttons for replying.");
                return await convo.repeat();
            }
        }
    ],
    {},
    "fixed_costs_thread");



    convo.addQuestion({
        blocks : async (template, vars) => {
            return [
                {
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": `Will you need a professionally designed website? ($480)`
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
                return await  convo.gotoThread("early_exit_thread");
            }
        },
        {
            pattern : "yes",
            type : 'string',
            handler : async (res, convo, bot) => {
                convo.vars.allFixedCosts.push(480);
                convo.vars.koUpdateObj.businessModel.otherExpenses.push({expenseType : 'website', cost : 480})
                return ;
            }

        },
        {
            pattern : "no",
            type : 'string',
            handler : async (res, convo, bot) => {
                return ;
            }
        },
        {
            default : true,
            type : 'string',
            handler : async (res, convo, bot) => {
                await bot.say("Please use the buttons for replying.");
                return await convo.repeat();
            }
        }
    ],
    {},
    "fixed_costs_thread");



    convo.addQuestion({
        blocks : async (template, vars) => {
            return [
                {
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": `Will you need to buy computers and office supplies? ($7,500)`
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
                return await  convo.gotoThread("early_exit_thread");
            }
        },
        {
            pattern : "yes",
            type : 'string',
            handler : async (res, convo, bot) => {
                convo.vars.allFixedCosts.push(7500);
                convo.vars.koUpdateObj.businessModel.otherExpenses.push({expenseType : 'computer and office supplies', cost : 7500})
                return ;
            }
        },
        {
            pattern : "no",
            type : 'string',
            handler : async (res, convo, bot) => {
                return ;
            }
        },
        {
            default : true,
            type : 'string',
            handler : async (res, convo, bot) => {
                await bot.say("Please use the buttons for replying.");
                return await convo.repeat();
            }
        }
    ],
    {},
    "fixed_costs_thread");



    convo.addQuestion({
        blocks : async (template, vars) => {
            return [
                {
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": `Will you need to buy insurance? ($1,200)`
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
                return await  convo.gotoThread("early_exit_thread");
            }
        },
        {
            pattern : "yes",
            type : 'string',
            handler : async (res, convo, bot) => {
                convo.vars.allFixedCosts.push(1200);
                convo.vars.koUpdateObj.businessModel.otherExpenses.push({expenseType : 'insurance', cost : 1200})
                return ;
            }
        },
        {
            pattern : "no",
            type : 'string',
            handler : async (res, convo, bot) => {
                return ;
            }
        },
        {
            default : true,
            type : 'string',
            handler : async (res, convo, bot) => {
                await bot.say("Please use the buttons for replying.");
                return await convo.repeat();
            }
        }
    ],
    {},
    "fixed_costs_thread");


    


    convo.addAction("evaluation_thread", "fixed_costs_thread");

    convo.before("evaluation_thread", async (convo, bot) => {
        let fixedCosts = convo.vars.allFixedCosts.reduce((a,b) => a+b, 0);
        let spreadFixedCosts = fixedCosts/convo.vars.totalMonths;
        convo.setVar("spreadFixedCosts", spreadFixedCosts);


        const arrSum = function(arr){
            return arr.reduce(function(a,b){
              return a + b
            }, 0);
        }

        let totalCosts = [];
        let annualRevenue = 0;
        let annualCosts = 0;
        let annualProfit = 0;
        let annualCustomerAcquisitionCost = 0;
        let annualProductionCost = 0;

        for(let j = 1; j <= convo.vars.totalMonths; j++){
            let multiplier = 0;
            for (let i = 0; i < j; i++) {
                multiplier += Math.pow(convo.vars.persistence,i);
            }
            console.log(`multiplier after ${j} th month`, multiplier);
            convo.vars.koUpdateObj.totalCustomers[j-1] = Math.floor(convo.vars.newCustomers*Math.pow((1+convo.vars.customerGrowth),j-1)*multiplier);
            let monthlyCustomerAcquisitionCost = (convo.vars.newCustomers*Math.pow((1+convo.vars.customerGrowth),j-1)*convo.vars.customerAcquisition);
            let monthlyProductionCost = convo.vars.anyAdditionalPurchase*(convo.vars.koUpdateObj.totalCustomers[j-1]*convo.vars.unitCost*convo.vars.units);
            totalCosts[j-1] = Math.round(monthlyCustomerAcquisitionCost + convo.vars.spreadFixedCosts + monthlyProductionCost);
            annualCustomerAcquisitionCost += monthlyCustomerAcquisitionCost;
            annualProductionCost += monthlyProductionCost;
            console.log(`cust acquisition cost for ${j} th month : `, monthlyCustomerAcquisitionCost);
            console.log(`production cost for ${j} th month : `, monthlyProductionCost);
        }
        annualRevenue = arrSum(convo.vars.koUpdateObj.totalRevenue);
        annualRevenue = annualRevenue.toFixed(2);
        annualCosts = arrSum(totalCosts);
        annualCosts = annualCosts.toFixed(2);
        annualProfit = annualRevenue-annualCosts;
        annualProfit = annualProfit.toFixed(2);


        // console.log(convo.vars.koUpdateObj.totalCustomers)
        // console.log(totalCosts)
        convo.vars.koUpdateObj.businessModel.annualProductionCost = annualProductionCost;
        convo.vars.koUpdateObj.businessModel.annualCustomerAcquisitionCost = annualCustomerAcquisitionCost;
        convo.vars.koUpdateObj.totalCosts = totalCosts;
        // console.log(annualCosts)
        convo.vars.koUpdateObj.annualCosts = annualCosts;
        // console.log(annualProfit)
        convo.vars.koUpdateObj.annualProfit = annualProfit;
        // console.log(annualProfit/annualRevenue)
        convo.vars.koUpdateObj.profitToRevenueRatio = (annualProfit/annualRevenue).toFixed(2);
    });


    // convo.addMessage({
    //     text : "Your Annual Costs : ${{{vars.koUpdateObj.annualCosts}}}\nYour Annual Profits : ${{{vars.koUpdateObj.annualProfit}}}\nYour Profit to Revenue Ratio : {{{vars.koUpdateObj.profitToRevenueRatio}}}"
    // },"evaluation_thread");


    convo.addAction("progress_card_redirect_thread", "evaluation_thread");


    convo.before("progress_card_redirect_thread", async (convo, bot) => {
        convo.vars.koUpdateObj.businessModel.unitCost = convo.vars.unitCost;
        convo.vars.koUpdateObj.businessModel.customerAcquisitionCost = convo.vars.customerAcquisition;
        let userEmailId = store.get(convo.vars.slack_user_id);
        try {
            let savedKo = await KoService.fetchIdea(convo.vars.koUpdateObj._id);
            let koProgress = savedKo.progress;
            if(koProgress < 5) {
                convo.vars.koUpdateObj.progress = 5;
            }
            await KoService.storeIdea(userEmailId, convo.vars.koUpdateObj);
            console.log("data saved in backend")
        }
        catch(e){
            console.log(e);
            Logger.log({
                level : "error",
                message : e.message,
                metadata : {
                    error : e,
                    userId : store.get(convo.vars.slack_user_id),
                    intent : "deepdive_business_model"
                }
            })
            await bot.say("Some error occurred in saving the idea.")
        }
    })


    convo.addMessage({
        text : "Thanks we now have a sense of your business model."
    },"progress_card_redirect_thread");

    convo.addMessage({
        text : "Let's now proceed to *Idea report* section where you can generate deepdive report for your idea."
    },"progress_card_redirect_thread");


    convo.addAction("complete", "progress_card_redirect_thread")







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
            message : "END of conversation: deepdive-business-model",
            metadata : {
                convo : false,
                userId : store.get(results.user)
            }
        });
    })

    controller.addDialog(convo);
}