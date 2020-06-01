const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const axios = require('axios');


const KoSchema = new Schema({
    ideaNameSlug : { type : String },
    ideaName : { type : String },
    ideaDescription : { type : String , required : true},
    ideaCategories : [ {type : String}],
    progress : { type : Number , default : 0 },
    ideaStage : { type : String , default : "idea_perceived"},
    ideaOwner : { type : String , required : true },
    targetCustomer : {type : String },
    targetCustomerDescription : { type : String },
    targetSegment : { type : String },
    problemsSolved :  {type : String },
    newCapabilities : {type : String},    // mapped to "most innovating aspect of idea"
    competitors : [ { cname : String, crel : Number, url : String }],        // are there other companies that might be competitors ?
    competitiveDifferentiation : {type : String },
    requiredSkills : [ {type : String }],
    requiredTechnology : [{type : String}],
    freshness : {type : Number },
    newCategories : [{type : String}],
    userCategory : {type : String},
    userCoCategories: [{type : String}],
    competitorSize : [{type : String}],
    fundability : {type : Number },
    createdAt : { type : Date, default : Date.now},
    freshness_criteria : { type : String },
    fundabilityStars : { type : String },
    top_competitor : { type : String },
    topCompetitorUserDescription : { type : String },
    chosenCustomerSegment : { type : String },
    customerSize : { type : Number },
    offeringType : {type : String },
    annualBurn : { type : Number },
    totalAddressableMarket : { type : Number },
    topCompetitors : [{ type : Schema.ObjectId}],
    totalCosts : [{type : Number}],
    totalRevenue : [{type : Number}],
    totalCustomers : [{type : Number}],
    annualCosts : { type : Number},
    annualProfit : { type : Number},
    profitToRevenueRatio : { type : Number},
    topSkill : { type : String },
    coSkill : { type : String },
    bizcompApplication : { 
        q1 : { type : String },
        q2 : { type : String },
        q3 : { type : String },
        q4 : { type : String }
    },
    submissionDate : { type : Date },
    submissionBotFlowMode : { type : String },
    businessModel : {
        subscriptionService : {type : Boolean, default : false},
        unitPrice : { type : Number },
        unitCost : { type : Number },
        customerAcquisitionCost : { type : Number },
        employees : [{ position : String , salary : Number }],
        otherExpenses : [{ expenseType : String , cost : Number }],
        annualCustomerAcquisitionCost : { type : Number },
        annualProductionCost : { type : Number },
        totalAnnualRevenue : { type : Number },
        annualRevenueFromSubscription : { type : Number },
        annualRevenueFromOtherSales : { type : Number },
        units : { type : Number },
        customersInFirstMonth : { type : Number },
        customerGrowth : { type : Number },
        customerPersistence : { type : Number },
        subscriptionPrice : { type : Number }
    },
});

KoSchema.index({
    ideaDescription : "text"
})



KoSchema.pre('save', async function(next){
    let ideaCategories = [];
    let freshness = [];
    let fundability = [];
    let competitorSize = [];
    let requiredSkills = [];
    let userCategories = [];
    let newCategories = [];
    let businessProbability = 0;
    let productProbability = 0;



    let promises = [];

    let fetchIdeaCategories = axios.get(`${process.env.IDEA_CLASSIFIER_API_URL}/categories?idea=${this.ideaDescription}`);
    let fetchFreshness = axios.get(`${process.env.IDEA_CLASSIFIER_API_URL}/freshness?idea=${this.ideaDescription}`);
    let fetchrequiredSkills = axios.get(`${process.env.IDEA_CLASSIFIER_API_URL}/startup-skills?idea=${this.ideaDescription}`);
    let fetchCompetitorSize = axios.get(`${process.env.IDEA_CLASSIFIER_API_URL}/size?idea=${this.ideaDescription}`);
    let fetchFundability = axios.get(`${process.env.IDEA_CLASSIFIER_API_URL}/fundability?idea=${this.ideaDescription}`);
    let fetchUserCategories = axios.get(`${process.env.IDEA_CLASSIFIER_API_URL}/user-categories?idea=${this.ideaDescription}`);
    let fetchNewCategories = axios.get(`${process.env.IDEA_CLASSIFIER_API_URL}/new-categories?idea=${this.ideaDescription}`);
    let fetchOfferingType = axios.get(`${process.env.IDEA_CLASSIFIER_API_URL}/offering-type?idea=${this.ideaDescription}`);
    let fetchTargetSegment = axios.get(`${process.env.IDEA_CLASSIFIER_API_URL}/ideaType?idea=${this.ideaDescription}`);


    promises.push(fetchIdeaCategories);
    promises.push(fetchFreshness);
    promises.push(fetchrequiredSkills);
    promises.push(fetchCompetitorSize);
    promises.push(fetchFundability);
    promises.push(fetchUserCategories);
    promises.push(fetchNewCategories);
    promises.push(fetchOfferingType);
    promises.push(fetchTargetSegment);


    try {
        let results = await Promise.all(promises);
        ideaCategories = results[0].data["PRED"].slice(0,10);
        freshness = results[1].data["PRED"].slice(0,5);
        requiredSkills = results[2].data["PRED"].slice(0,5);
        competitorSize = results[3].data["PRED"].slice(0,5);
        fundability = results[4].data["PRED"].slice(0,5);
        userCategories = results[5].data["PRED"].slice(0,10);
        newCategories = results[6].data["PRED"].slice(0,10);
        businessProbability = results[7].data["PRED"][0]["pred"];
        productProbability = results[8].data["PRED"][0]["pred"];
    }
    catch(error) {
        console.log("Error in idea predictor api", error);
        throw error;
    }




    this.ideaCategories = [];
    ideaCategories.forEach( ideaCategory => {
        this.ideaCategories.push(ideaCategory.topic);
    })


    this.freshness = freshness[0].pred;
    if(freshness[0].pred < 1) {
        this.freshness_criteria = "very_new_idea";
    }
    if(freshness[0].pred >=1 && freshness[0].pred <=3){
        this.freshness_criteria = "moderately_new_idea";
    }
    if(freshness[0].pred > 3) {
        this.freshness_criteria = "old_idea"
    }

    this.fundability = fundability[0].pred;
    let unscaledFundability = (Math.round(this.fundability*100)).toFixed(0);
    let fundabilityStars = "";
    if(unscaledFundability < 20) {
        fundabilityStars = "⭐"
    }
    if(unscaledFundability >=20 && unscaledFundability <40){
        fundabilityStars = "⭐⭐"
    }
    if(unscaledFundability >=40 && unscaledFundability <60){
        fundabilityStars = "⭐⭐⭐"
    }
    if(unscaledFundability >=60 && unscaledFundability <80){
        fundabilityStars = "⭐⭐⭐⭐"
    }
    if(unscaledFundability >=80 && unscaledFundability <100){
        fundabilityStars = "⭐⭐⭐⭐⭐"
    }
    this.fundabilityStars = fundabilityStars;

    this.competitorSize = [];
    competitorSize.forEach( val => {
        this.competitorSize.push(val.topic);
    })

    this.requiredSkills = [];
    requiredSkills.forEach( val => {
        this.requiredSkills.push(val.topic);
    })

    this.userCategories = [];
    userCategories.forEach( ideaCategory => {
        this.userCategories.push(ideaCategory.topic);
    })

    this.newCategories = [];
    newCategories.forEach( val => {
        this.newCategories.push(val.topic);
    })

    let targetSegment = (businessProbability > 0.5 ? "business" : "individual consumer");
    let offeringType = (productProbability > 0.5 ? "product" : "service");


    this.offeringType = offeringType;
    this.targetSegment = targetSegment;
    next();
})

// there are no hooks for updates --> discuss with titash. Right now we are only creating not updating.

module.exports = mongoose.model("Ko", KoSchema);
