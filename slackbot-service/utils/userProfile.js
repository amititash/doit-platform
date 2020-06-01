const axios = require('axios');

const slackUserProfile = async (userid) => {
    return new Promise( async (resolve, reject) => {
        let userEmail = "";
        try {
            let response = await axios.get(`https://slack.com/api/users.profile.get?token=${process.env.token}&user=${userid}`)
            userEmail = response.data.profile.email;
            userRealName = response.data.profile.real_name;
            userDisplayName = response.data.profile.display_name;
        }
        catch(e){
            console.log(e.message);
            reject(e);
        }
        resolve({
            userEmail,
            userRealName,
            userDisplayName
        });
    })
}

module.exports = {
    slackUserProfile
}
