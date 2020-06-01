import UsersService from '../../services/users.service';
import KoService from '../../services/kos.service';

export class Controller {

    async getAllDataForAdmin(req, res) {
        let data = [];
        let criteria = {};
        try {
            let users = await UsersService.getAllUsers(criteria);
            let promises = [];
            users.forEach( async (user) => {
                let criteria = {
                    ideaOwner : user.email
                }
                let promise = KoService.getAllKos(criteria);
                promises.push(promise);
            })

            data = await Promise.all(promises);
            let resp = {};
            users.forEach((user, index) => {
                resp[user.email] = data[index]
            })
            res.send({
                info : resp,
                success : true
            })
        }
        catch(e){
            res.send({
                success : false,
                error : e.message
            })
        }
        
        
    }

}




export default new Controller();
