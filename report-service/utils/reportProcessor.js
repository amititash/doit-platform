function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}


const reportProcessor = (user, ko, processedKo) => {
    return new Promise( async(resolve, reject) => {
        let obj = {};
        try {
            obj.idea_description = capitalizeFirstLetter(ko.ideaDescription) + '.';
            if(ko.ideaName){
                obj.idea_name = capitalizeFirstLetter(ko.ideaName);
            }
            obj.user_categories = capitalizeFirstLetter(processedKo.user_categories);
            obj.target_segment = processedKo.target_segment;
            obj.targetCustomer =  processedKo.targetCustomer.toLowerCase();
            obj.targetCustomerDescription = processedKo.targetCustomerDescription.toLowerCase();
            obj.total_addressable_market = ko.customerSize;
            obj.customerSize = ko.customerSize;
            obj.annualCosts = Math.round(ko.annualCosts);
            obj.freshness = Number(ko.freshness).toFixed(2);
            obj.fundability = Math.round(ko.fundability*100);
            obj.subscriptionService = ko.businessModel.subscriptionService;
            obj.totalAnnualRevenue = Math.round(ko.businessModel.totalAnnualRevenue);
            obj.totalCustomerAcquisitionAndProductionCost = Math.round(ko.businessModel.annualCustomerAcquisitionCost + ko.businessModel.annualProductionCost);
            obj.profitExcludingLabourAndInfraCosts = Math.round(ko.businessModel.totalAnnualRevenue - ko.businessModel.annualCustomerAcquisitionCost - ko.businessModel.annualProductionCost);
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


            let entrepreneurEfficacyScores = user.entrepreneurEfficacyScores;
            let entrepreneurEfficacyScoresArray = [];
            for(let key in entrepreneurEfficacyScores){
                if(entrepreneurEfficacyScores.hasOwnProperty(key)){
                    entrepreneurEfficacyScoresArray.push({skill: key , score : entrepreneurEfficacyScores[key]})
                }
            }
            entrepreneurEfficacyScoresArray.sort(function(a,b){ return b.score - a.score});
            obj.startupSkill1 = entrepreneurEfficacyScoresArray[0].skill;
            obj.startupSkill2 = entrepreneurEfficacyScoresArray[1].skill;
            entrepreneurEfficacyScoresArray.sort(function(a,b){return a.score - b.score});
            obj.teamMemberSkill1 = entrepreneurEfficacyScoresArray[0].skill;
            obj.teamMemberSkill2 = entrepreneurEfficacyScoresArray[1].skill;
            obj.teamMemberSkill3 = entrepreneurEfficacyScoresArray[2].skill;


            
            let topSkill = user.topSkill;
            if(topSkill){
                obj.topSkill = capitalizeFirstLetter(topSkill);
            }


            let antiSkills = user.antiSkills;
            obj.antiSkills = antiSkills;

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
            reject(e);
            //later reject error. If returns obj then mail will be sent without appropriate data
        }
        resolve(obj);
    })
}

module.exports = {
    reportProcessor
}

