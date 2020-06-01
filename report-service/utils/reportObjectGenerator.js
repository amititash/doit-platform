const axios = require('axios');


function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}



const generate = (ko_id , userEmailId ) => {
    return new Promise( async(resolve, reject) => {
        let user = {};
        let ko = {};
        let obj = {};
        try {
            let userUrl = `${process.env.BACKEND_API_URL}/api/v1/users/byEmail?emailId=${userEmailId}`;
            let koUrl = `${process.env.BACKEND_API_URL}/api/v1/kos/ko?id=${ko_id}`;
            let userResponse = await axios.get(userUrl);
            let koResponse = await axios.get(koUrl);
            user = userResponse.data[0];
            ko = koResponse.data;
            if(!user){
                reject(new Error("user doesn't exist in the database"));
            }   
            if(!ko){
                reject(new Error("ko with this _id doesn't exist in the database"));
            }
            obj.idea_owner = ko.ideaOwner;
            obj.idea_description = ko.ideaDescription ? capitalizeFirstLetter(ko.ideaDescription) + '.' : "Idea description not found!";
            if(ko.ideaName){
                obj.idea_name = capitalizeFirstLetter(ko.ideaName);
            }
            if(ko.userCategory){
                obj.user_categories = capitalizeFirstLetter(ko.userCategory);
            }
            if(ko.targetSegment){
                obj.target_segment = ko.targetSegment;
            }
            if(ko.targetCustomer){
                obj.targetCustomer =  ko.targetCustomer.toLowerCase();
            }

            if(ko.targetCustomerDescription){
                obj.targetCustomerDescription = ko.targetCustomerDescription.toLowerCase();
            }
            obj.total_addressable_market = ko.customerSize;
            obj.customerSize = ko.customerSize;

            if(ko.annualCosts){
                obj.annualCosts = Math.round(ko.annualCosts);
            }
            if(ko.freshness){
                obj.freshness = Number(ko.freshness).toFixed(2);
            }

            if(ko.fundability){
                obj.fundability = Math.round(ko.fundability*100);
            }

            if(ko.businessModel){
                obj.subscriptionService = ko.businessModel.subscriptionService;
                obj.totalAnnualRevenue = Math.round(ko.businessModel.totalAnnualRevenue);
                obj.totalCustomerAcquisitionAndProductionCost = Math.round(ko.businessModel.annualCustomerAcquisitionCost + ko.businessModel.annualProductionCost);
                obj.profitExcludingLabourAndInfraCosts = Math.round(ko.businessModel.totalAnnualRevenue - ko.businessModel.annualCustomerAcquisitionCost - ko.businessModel.annualProductionCost);
            }
            
            
            obj.annualProfit = Math.round(ko.annualProfit);


            if(ko.businessModel.annualRevenueFromSubscription){
                obj.annualRevenueFromSubscription = Math.round(ko.businessModel.annualRevenueFromSubscription);
            }

            if(ko.businessModel.annualRevenueFromOtherSales){
                obj.annualRevenueFromOtherSales = Math.round(ko.businessModel.annualRevenueFromOtherSales);
            }


            if(ko.profitToRevenueRatio){
                obj.profitToRevenueRatio = Math.round(100 * ko.profitToRevenueRatio);
            }

            if(ko.businessModel.unitPrice){
                obj.unitPrice = ko.businessModel.unitPrice ;
            }
            if(ko.businessModel.unitCost){
                obj.unitCost = ko.businessModel.unitCost ;
            }
            if(ko.businessModel.customerAcquisitionCost){
                obj.customerAcquisitionCost = ko.businessModel.customerAcquisitionCost ;
            }



            obj.competitors = ko.competitors;


            if(ko.businessModel.customersInFirstMonth){
                obj.customers_in_first_month = ko.businessModel.customersInFirstMonth;
            }


            obj.customer_growth_rate = ko.businessModel.customerGrowth;

            obj.customer_persistence = ko.businessModel.customerPersistence;

            obj.total_customers = ko.totalCustomers;

            obj.subscription_price = ko.businessModel.subscriptionPrice;

            obj.co_categories = ko.userCoCategories;

            obj.subscriptionService = ko.businessModel.subscriptionService;

            obj.units = ko.businessModel.units;

            obj.employees = ko.businessModel.employees;
            let employeesCost = 0;
            ko.businessModel.employees.forEach( (element) => {
                employeesCost += element.salary;
            })
            obj.employeesCost = employeesCost;



            obj.otherExpenses = ko.businessModel.otherExpenses;
            let otherExpensesCost = 0;
            ko.businessModel.otherExpenses.forEach( (element) => {
                otherExpensesCost += element.cost;
            })
            obj.otherExpensesCost = otherExpensesCost;




            obj.user_name = user.username;


            

            let entrepreneurEfficacyScores = user.entrepreneurEfficacyScores;
            let entrepreneurEfficacyScoresArray = [];
            if(entrepreneurEfficacyScores){
                for(let key in entrepreneurEfficacyScores){
                    if(entrepreneurEfficacyScores.hasOwnProperty(key)){
                        entrepreneurEfficacyScoresArray.push({skill: key , score : entrepreneurEfficacyScores[key]})
                    }
                }
            }
            
            entrepreneurEfficacyScoresArray.sort(function(a,b){ return b.score - a.score});
            
            obj.startupSkill1 = entrepreneurEfficacyScoresArray[0] ? entrepreneurEfficacyScoresArray[0].skill : "Skill data not found. Please complete founderquiz." ;
            obj.startupSkill2 = entrepreneurEfficacyScoresArray[1] ? entrepreneurEfficacyScoresArray[1].skill : "Skill data not found. Please complete founderquiz." ;
            entrepreneurEfficacyScoresArray.sort(function(a,b){return a.score - b.score});
            obj.teamMemberSkill1 = entrepreneurEfficacyScoresArray[0] ? entrepreneurEfficacyScoresArray[0].skill : "Skill data not found. Please complete founderquiz." ;
            obj.teamMemberSkill2 = entrepreneurEfficacyScoresArray[1] ? entrepreneurEfficacyScoresArray[1].skill : "Skill data not found. Please complete founderquiz." ;
            obj.teamMemberSkill3 = entrepreneurEfficacyScoresArray[2] ? entrepreneurEfficacyScoresArray[2].skill : "Skill data not found. Please complete founderquiz." ;




            let topSkill = user.topSkill;
            if(topSkill){
                obj.topSkill = capitalizeFirstLetter(topSkill);
            }


            let antiSkills = user.antiSkills;
            obj.antiSkills = antiSkills;


            obj.coSkills = user.coSkills;


            obj.inProfit = true;
            if(ko.profitToRevenueRatio < 0){
                obj.inProfit = false;
                obj.annualLoss = obj.annualProfit * -1;
                obj.lossToRevenueRatio = -1 * obj.profitToRevenueRatio;
                if(obj.profitExcludingLabourAndInfraCosts < 0){
                    obj.lossExcludingLabourAndInfraCosts = -1 * obj.profitExcludingLabourAndInfraCosts;
                }
            }

            console.log("report object", obj);

        }
        catch(e){
            console.log(e);
            reject(e);
        }
        resolve(obj);
    })
}

module.exports = {
    generate
}