const axios = require('axios');

const updateUserData = (emailId , updateObj) => {
    return new Promise( async (resolve, reject) => {
        let url = `${process.env.BACKEND_API_URL}/api/v1/users`;
        let dataToUpdate = {
            emailId : emailId,
            ...updateObj
        };
        try {
            let response = await axios.patch(url, dataToUpdate);
            resolve(response.data);
        }   
        catch(e) {
            console.log(e.message);
            reject(e);
        }
    })
}

module.exports = {
    updateUserData
}