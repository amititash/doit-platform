import TestResultsService from '../../services/testResults/testResults.service';
const ABTestOutput = require('../../../../utils/abTestOutput');
const SubmittedIdeaOutput = require('../../../../utils/submittedIdeasOutput');
const axios = require('axios');

export class Controller {


  async getSubmittedIdeaOutput(req, res) {
    let outputJSON = [];
    let receiverEmail = req.query.emailId;
    let submittedIdeas = [];
    try {
      let response = await axios.get(`${process.env.BACKEND_API_URL}/api/v1/kos/allSubmittedIdeas`);
      submittedIdeas = response.data;
      outputJSON = await SubmittedIdeaOutput.generateJSONOutput(submittedIdeas, receiverEmail);
    }
    catch(e) {
      console.log(e);
      res.send({error : e.message});
    }

    res.send(outputJSON);
  } 


  async getABTestResults(req, res) {
    let outputJSON = [];
    let receiverEmail = req.query.emailId;
    let users = [];
    try {
      users = await TestResultsService.getABTestResults();
    }
    catch(e){
      console.log(e);
    }
    try {
      outputJSON = await ABTestOutput.generateJSONOutput(users , receiverEmail);
    }
    catch(e){
      console.log(e);
    }
    res.send(outputJSON);

  }

//   byId(req, res) {
//     ExamplesService.byId(req.params.id).then(r => {
//       if (r) res.json(r);
//       else res.status(404).end();
//     });
//   }

//   create(req, res) {
//     ExamplesService.create(req.body.name).then(r =>
//       res
//         .status(201)
//         .location(`/api/v1/examples/${r.id}`)
//         .json(r)
//     );
//   }
}
export default new Controller();
