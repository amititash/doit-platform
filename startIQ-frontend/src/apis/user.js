import { coreModuleinstance } from '../axios';


export const updateUser = async (userEmailId, updateObj) => {
    try {
        let url = `/users`
        let data = {
            ...updateObj, 
            emailId : userEmailId
        }
        let response = await coreModuleinstance.patch(url, data);
    }
    catch(e){
        console.log(e);
    }
}

