

module.exports = () => {
    const botFlowSet = ["deepdive", "ideastorm", "both", "none" ,"deepdive", "ideastorm", "both", "none" ,"deepdive", "ideastorm", "both", "none" ,"deepdive", "ideastorm", "both", "none" ,"deepdive", "ideastorm", "both", "none" ,"deepdive", "ideastorm", "both", "none" ,"deepdive", "ideastorm", "both", "none" ,"deepdive", "ideastorm", "both", "none" ,"deepdive", "ideastorm", "both", "none" ,"deepdive", "ideastorm", "both", "none" ,"deepdive", "ideastorm", "both", "none" ,"deepdive", "ideastorm", "both", "none" ,"deepdive", "ideastorm", "both", "none" ,"deepdive", "ideastorm", "both", "none" ,"deepdive", "ideastorm", "both", "none" ,"deepdive", "ideastorm", "both", "none" ,"deepdive", "ideastorm", "both", "none" ,"deepdive", "ideastorm", "both", "none" ,"deepdive", "ideastorm", "both", "none" ,"deepdive", "ideastorm", "both", "none" ,"deepdive", "ideastorm", "both", "none" ,"deepdive", "ideastorm", "both", "none" ,"deepdive", "ideastorm", "both", "none" ,"deepdive", "ideastorm", "both", "none" ,"deepdive", "ideastorm", "both", "none" ,]
    const randomizedBotFlowSet = [];
    for(let i = 1; i<= 100 ; i++){
        randomizedBotFlowSet.push(botFlowSet[Math.floor(Math.random()*25)]);
    }
    return randomizedBotFlowSet[Math.floor(Math.random()*100)];
}