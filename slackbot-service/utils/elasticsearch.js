const elasticsearch = require('elasticsearch');
require('dotenv').config();

const client = new elasticsearch.Client({
    host : `${process.env.ELASTIC_CLOUD_URL}`
    // host : `http://3.94.21.126:9200`
});

let search = function(keyword , alreadyDisplayedCompanyIds) {
    return new Promise( async (resolve, reject) => {
        let response = [];
        let esResult = {};
        let query = {
            index : 'companies',
            body : {
                "query": {
                    "more_like_this" : {
                        "fields" : ["description","company_name"],
                        "like" : `${keyword}`,
                        "min_term_freq" : 1,
                        "max_query_terms" : 12
                    }
                }
            },
            size : 50
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
        let filteredCompanies = removeDuplicates(response , alreadyDisplayedCompanyIds);
        resolve(filteredCompanies);
    })
}

const removeDuplicates = (companies, alreadyDisplayedCompanyIds) => {
    let filteredCompanies = companies.filter( (element) => !alreadyDisplayedCompanyIds.includes(element._id));
    return filteredCompanies;
}
// search("an app for parents for school")
//     .then (r => {
//         console.log(r.length);
//     })
//     .catch(e => {
//         console.log(e);
//     })



module.exports = { search }