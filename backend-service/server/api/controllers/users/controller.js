import UsersService from '../../services/users.service';


export class Controller {


  async assignRandomBotFlowMode(req, res) {
    let data = {};
    try {
      data.botFlowMode = await UsersService.assignRandomBotFlowMode();
    }
    catch(e) {
      console.log(e);
      res.send({
        error : e.message
      })
    }
    console.log("data return ", data);
    res.send(data);
  }

  async getBotFlowMode(req, res) {
    let data = {};
    try{
      data = await UsersService.getBotFlowMode(req.query);
    }
    catch(e){
      console.log(e);
      res.send({
        error : e.message
      })
    } 
    res.send(data);
  }

  async setBotFlowMode(req, res) {
    let data = {};
    try {
      data = await UsersService.setBotFlowMode(req.body);
    }
    catch(e){
      console.log(e);
      res.send({
        error : e.message
      });
    }
    res.send(data);
  }

  getUser(req, res) {
    let criteria = {
      _id : req.query.id
    }
    UsersService.getUser(criteria)
      .then ( r => {
        res
          .status(200)
          .json(r);
      })
    
  }

  getUserByEmail(req, res) {
    let criteria = {
      email : req.query.emailId
    }
    console.log(criteria);
    UsersService.getAllUsers(criteria)
      .then ( r => {
        res
          .status(200)
          .json(r);
      })
    
  }

  getAllUsers(req, res) {
    let criteria = {}
    //console.log(criteria);
    UsersService.getAllUsers(criteria)
      .then ( r => {
        res
          .status(200)
          .json(r);
      })
    
  }


  updateUserByEmail( req, res ) {

    let criteria = {
      email : req.body.emailId
    }

    let updateObj = {
      "$set" : {
        ...req.body
      }
    }

    let options = {
      new : true
    }
    
    UsersService.updateUser(criteria, updateObj, options)
      .then ( r => {
        res
          .status(200)
          .json(r);
      })
  }


  deleteUser( req, res) {
    let _criteria = {
      _id : req.query.id
    }
    UsersService.deleteUser(_criteria)
      .then ( r => {
        res
          .status(200)
          .json(r);
      })
  }

  createUser(req, res) {
    UsersService.createUser(req.body)
      .then(r =>
        res
          .status(201)
          .json(r)
      )
      .catch(e => {
        res
          .send({error : e.message})
      })
  }


  
  async storeCreativityScore(req, res) {
    let data = {};
    try{
      let response = await UsersService.storeCreativityScore(req.body);
      data.success = true;
      data.average = response.average;
      res
        .status(200)
        .json(data);
    }
    catch(e){
      res.json({
        error : e.message
      })
    }
  }


}




export default new Controller();
