const axios = require('axios');


const storeIdea = async (userEmailId, ideaObj) => {
    return new Promise( async(resolve, reject) => {
        let url = `${process.env.BACKEND_API_URL}/api/v1/kos`;
        let response = null;
        let snapshotResponse = null;
        ideaObj.ideaOwner = userEmailId;

        try {
            // ideaObj.totalAddressableMarket = Number(ideaObj.customerSize) * Number(ideaObj.pricePerUser) ;
            let data = ideaObj;
            console.log("data before saving", data);
            response = await axios.post(url,data);
            // snapshotResponse = await axios.get(`${process.env.SNAPSHOT_API_URL}?id=${response.data._id}`);
            // imageUrl = snapshotResponse.data.image;
            // for now imageUrl is following
            imageUrl = `https://startiq.org/get-report?ko=${response.data._id}`
        }
        catch(e) {
            console.log(e);
            reject(e);
        }
        resolve({
            success : true,
            koResponse : response.data
        });
    })
}



const fetchIdea = async (id) => {
    return new Promise( async (resolve, reject) => {
        let idea = {};
        let url = `${process.env.BACKEND_API_URL}/api/v1/kos/ko?id=${id}`;
        try {
            let response  = await axios.get(url);
            idea = response.data;
        }
        catch(e){
            console.log(e);
            reject(e);
        }
        resolve(idea);
    })
}




const justSaveIdea = async (userEmailId, ideaObj) => {
    return new Promise( async(resolve, reject) => {
        ideaObj.ideaOwner = userEmailId;
        let url = `${process.env.BACKEND_API_URL}/api/v1/kos`;
        let data = {};
        try {
            let response = await axios.post(url, ideaObj);
            data = response.data;
        }
        catch(e) {
            console.log(e);
            reject(e);
        }
        resolve(data);
    })
}



module.exports = {
    justSaveIdea,
    storeIdea,
    fetchIdea
}