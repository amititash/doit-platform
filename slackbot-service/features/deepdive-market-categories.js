const store = require('../store/store');
const Logger = require('../utils/Logger');
const { BotkitConversation } = require('botkit');
const KoService = require('../api/ko');





module.exports = function(controller){
    const DIALOG_ID = "deepdive_market_dialog";

    let convo = new BotkitConversation(DIALOG_ID, controller);



    convo.before("default", async (convo, bot) => {
        Logger.log({
            level : "info",
            message : "START of conversation : deepdive-market-categories",
            metadata : {
                convo : true,
                userId : store.get(convo.vars.slack_user_id)
            }
        });
        //koUpdateObj contains only those fields that are updated by a particular deepdive section
        //whereas ideaObj contains some global info for the ko object, used throughout. 
        convo.setVar("koUpdateObj", {});
        convo.vars.koUpdateObj._id = convo.vars.ko_id;
        // for fetching idea categories from classifier
        let ideaCategories = [];
        convo.setVar("ideaCategoriesMap", {});
        convo.setVar("ideaCategoriesBlock",[
            {
                "type" : "actions",
                "elements" : []
            }
        ]);
        let ko = {};
        try {
            ko = await KoService.fetchIdea(convo.vars.ko_id);
            convo.setVar("short_name", ko.ideaName);
            ideaDescription = ko.ideaDescription;
            ideaCategories = ko.ideaCategories;
        }
        catch(e) {
            console.log(e);
            Logger.log({
                level : "error",
                message : e.message,
                metadata : {
                    error : e,
                    userId : store.get(convo.vars.slack_user_id),
                    intent : "deepdive_marketing_categories"
                }
            })
            return await convo.gotoThread("error_thread");
        }
        ideaCategories.forEach( (element,index) => {
            convo.vars.ideaCategoriesMap[`${index+1}`] = element;
            convo.vars.ideaCategoriesBlock[0].elements.push(
                {
                    "type": "button",
                    "text": {
                        "type": "plain_text",
                        "emoji": true,
                        "text": `${element}`
                    },
                    "style": "primary",
                    "value": `${index+1}`
                },
            )
        })
    });
    

    convo.addMessage({
        text : "Your idea looks like it belongs to one of the following categories. Do any of these seem right? Select any one."
    },"default");

    convo.addQuestion({
        blocks : async (template, vars) => {
            return vars.ideaCategoriesBlock
        }
    },
    [
        {
            pattern : "cancel",
            type : 'string',
            handler : async(res, convo, bot) => {
                return await convo.gotoThread("early_exit_thread");
            }
        },
        {
            default : true,
            type : 'string',
            handler : async(res, convo, bot) => {
                let chosenCategory = "";
                if(convo.vars.ideaCategoriesMap[`${res}`]){
                    chosenCategory = convo.vars.ideaCategoriesMap[`${res}`];
                    console.log("Categories chosen: ", chosenCategory);
                    convo.setVar("user_category", chosenCategory);
                    convo.vars.koUpdateObj.userCategory = chosenCategory
                }
                else {
                    await bot.say("Please use the buttons for replying.");
                    return await convo.repeat();
                }
            }
        }
    ],
    {key : 'field6'},
    "default");


    

    


    convo.addAction("select_co_categories_thread", "default");

    convo.before("select_co_categories_thread", async (convo, bot) => {
        convo.setVar("coCategoriesBlock", [
            {
                "type": "section",
                "text": {
                    "type": "plain_text",
                    "text": "Here is the list of co-categories associated with the above category.",
                    "emoji": true
                }
            },
            {
                "type" : "actions", 
                "elements" : []
            }
        ])
        let coCategoriesList = require('../assets/industryAndMarket/co-categories');
        let filteredCoCategoriesList = coCategoriesList.filter( (element) => element.category === convo.vars.user_category);
        if(!filteredCoCategoriesList.length) {
            return await convo.gotoThread("progress_card_redirect_thread");
        }
        let coCategoriesArray = filteredCoCategoriesList[0].cocats;
        let coCategoriesListString = "";
        convo.setVar("coCategoriesMap", {});
        coCategoriesArray.forEach( (element, index) => {
            coCategoriesListString += `${index+1}. ${element}\n`;
            convo.vars.coCategoriesMap[`${index+1}`] = element;
            convo.vars.coCategoriesBlock[1].elements.push({
                "type": "button",
                "text": {
                    "type": "plain_text",
                    "emoji": true,
                    "text": `${element}`
                },
                "style": "primary",
                "value": `${index+1}`
            },)
        })
        convo.setVar("co_categories_list", coCategoriesListString);
    });

    convo.addMessage({
        text : "placeholder",
        blocks : async (template, vars) => {
            return vars.coCategoriesBlock
        }
    },"select_co_categories_thread");


    convo.addQuestion({
        text : "Select the one that is relevant."
    },
    [
        {
            pattern : "cancel",
            type : 'string',
            handler : async(res, convo, bot) => {
                return await convo.gotoThread("early_exit_thread");
            }
        },
        {
            default : true,
            type : 'string',
            handler : async(res, convo, bot) => {
                let chosenCoCategories = [];
                let numString = res.replace(/ /g, '');
                let chosenNumbers = numString.split(',');
                chosenNumbers.forEach( number => {
                    if(convo.vars.coCategoriesMap[`${number}`]) {
                        chosenCoCategories.push(convo.vars.coCategoriesMap[`${number}`]);
                    }
                });
                console.log("chosen cocategories", chosenCoCategories);
                convo.vars.koUpdateObj.userCoCategories = chosenCoCategories;                
            }
        }
    ],
    {},
    "select_co_categories_thread");




    convo.addAction("progress_card_redirect_thread", "select_co_categories_thread");



    convo.before("progress_card_redirect_thread" , async (convo, bot) => {
        let userEmailId = store.get(convo.vars.slack_user_id);
        try {
            let savedKo = await KoService.fetchIdea(convo.vars.koUpdateObj._id);
            let koProgress = savedKo.progress;
            if(koProgress < 2) {
                convo.vars.koUpdateObj.progress = 2;
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
                    intent : "deepdive_marketing_categories"
                }
            })
            await bot.say("Some error occurred in saving the idea.")
        }
    })


    convo.addMessage({
        text : "Thanks. We now have a sense of industry and market targeted by your idea."
    },"progress_card_redirect_thread");



    convo.addMessage({
        text : "Let's now proceed to the *Research similar companies* section, where we will get an idea about your competitors."
    },"progress_card_redirect_thread");





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
            message : "END of conversation: deepdive-market-categories",
            metadata : {
                convo : false,
                userId : store.get(results.user)
            }
        });
    })


    controller.addDialog(convo);
}