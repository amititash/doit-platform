const elasticsearch = require('elasticsearch');

const client = new elasticsearch.Client({
    host : `${process.env.STARTUP_QUESTIONS_ES_URL}`
});


let questionSearch = function(question){
    return new Promise( async (resolve, reject) => {
        let response = [];
        let esResult = {};
        let query = {
            index : 'startiq-questions',
            body : {
                "query": {
                    "match": {
                      "Question": question
                    }
                }
            },
            size : 10
        }
        try {
            esResult = await client.search(query);
        }
        catch(e) {
            console.log(e);
            reject(e);
        }
        if(esResult.hits) {
            response = esResult.hits.hits || [];
        }
        resolve(response);
    })
}


module.exports = {
    questionSearch
}
