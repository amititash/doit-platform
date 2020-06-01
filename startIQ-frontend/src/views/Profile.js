import React , { Component } from 'react'
import { Link } from "react-router-dom";
import Axios from 'axios';
import { useAuth0 } from "../react-auth0-spa";
import noContent from '../components/NoContent';
import { coreModuleinstance } from '../axios';
import { updateUser } from '../apis/user';
import { Accordion , Card, Button } from 'react-bootstrap'
import { useAccordionToggle } from 'react-bootstrap/AccordionToggle';
import { Redirect } from 'react-router';
// import Acc from '../components/example';


class Profile extends Component {

    // state = {
    //     userProfile : {},
    //     ideas : []
    // }

    constructor(props){
        super(props);
        this.state = {
            userProfile : {},
            ideas : [],
            name: '',
            email: '',
            optResult: false,
            successResponse: false,
            otp: ''
        }
    }

    
    async componentDidMount () {

        let user = localStorage.getItem('startiq_user');
        if(user){
            user = JSON.parse(user)
            let userProfileData = {};
            let ideas = [];
            if(user.email === "engineering@startiq.org"){
                this.props.history.push('/admin');
                return ;
            }
            // user.email = 'engineering@startiq.org';
            try {
                let userProfileResponse = await coreModuleinstance.get(`/users/byEmail?emailId=`+user.email);
                let ideaResponse = await coreModuleinstance.get(`/kos?emailId=`+user.email);
                userProfileData = userProfileResponse.data;
                
                if(!userProfileData[0].profilePic){
                    console.log("profile pic not found");
                    updateUser(user.email, {profilePic : user.picture })
                }
                ideas = ideaResponse.data;
                this.setState({
                    userProfile : userProfileData[0],
                    ideas
                })
            }
            catch(e){
                console.log(e);
            }
        }
    }




   

    render() {
        let userLoginData = localStorage.getItem('startiq_user');
        userLoginData = JSON.parse(userLoginData);


        let ideasList = [];
        if(this.state.ideas.length){
            this.state.ideas.forEach( (element, index) =>  {
                ideasList.push(
                    <tr>
                        <td><h3>{element.ideaName || `No Idea Name`}</h3> <span></span></td>
                        <td><a href={`mailto:${element.ideaOwner}`}>{element.ideaOwner}</a> </td>
                        <td>{ (element.progress && element.progress == 5) ? <Link to={`/report?idea=${element.ideaNameSlug}&email=${userLoginData.email}`}>Show Report</Link> : <a target="_blank" href={`https://startiq-duke.slack.com/archives/DP26RHX1D`}>Research this idea</a>}</td>
                    </tr>
                    // <div className="col-md-6 col-lg-4" key={element._id}>
                    //     <div className="gig-blk">
                    //         <div><h3>{element.ideaName || `No Idea Name`}</h3> <span></span></div>
                    //         <div>
                    //             <p><a href={`mailto:${element.ideaOwner}`}>{element.ideaOwner}</a> </p>
                    //             <div>
                    //                 {/*/!* <span>Free</span> *!/*/}
                    //                 { (element.progress && element.progress == 5) ? <Link to={`/report?idea=${element.ideaNameSlug}&email=${userLoginData.email}`}>Show Report</Link> : <a target="_blank" href={`https://startiq-duke.slack.com/archives/DP26RHX1D`}>Research this idea</a>}
                    //                     {/**/}
                    //             </div>
                    //         </div>
                    //     </div>
                    // </div>
                    // <div className="col-md-12" key={element._id}>
                    //     <h1>{element.ideaName || `No Idea Name`}</h1>
                    // </div>
                )
            })
        } 
        // else {
        //     ideasList = <p>No Ideas Yet. Go to Slack bot and get started.</p>;
        // }

        let entrepreneurEfficacyEntries = [];

        if(this.state.userProfile.entrepreneurEfficacyScores){
            for(let key in this.state.userProfile.entrepreneurEfficacyScores){
                entrepreneurEfficacyEntries.push((<li>{key} <span>{this.state.userProfile.entrepreneurEfficacyScores[key]}</span></li>))
            }
        }


        let founderMotivationEntries = [];
        if(this.state.userProfile.founderMotivationScores){
            for(let key in this.state.userProfile.founderMotivationScores){
                let scoreParam = key;
                switch(key){
                    case "motivation_money" : 
                        scoreParam = "Motivation";
                        break;
                    case "motivation_challenge" : 
                        scoreParam = "Challenge";
                        break;
                    case "motivation_advancement" : 
                        scoreParam = "Advancement";
                        break;
                    case "motivation_society" : 
                        scoreParam = "Society";
                        break;
                }
                founderMotivationEntries.push((<li>{scoreParam} <span>{this.state.userProfile.founderMotivationScores[key]}</span></li>))
            }
        }
        

        return (
            <main className="main-section">
                <section className="profile-section">
                    <div className="container">
                        <div className="row">
                            <div className="col-md-5 welcome-col">
                                <div>
                                    <h1>Welcome</h1>
                                    <h3>{this.state.userProfile && this.state.userProfile.username}</h3>
                                    <p>{this.state.userProfile.demographicData && this.state.userProfile.demographicData.major}</p>
                                </div>
                                {/* <ul className="list-inline">
                                    <li><span>40%</span>
                                        Profile Score
                                    </li>
                                    <li><span>0</span>
                                        Profile Views
                                    </li>
                                </ul> */}
                                {/* <h3>Share Your Profile:</h3>
                                <div className="social-m">
                                    <span tabIndex="0" data-link="#share-facebook">
                                        <img src="img/facebook.webp" width="30" />
                                    </span>
                                    <span tabIndex="0" data-link="#share-linkedin">
                                        <img src="img/facebook.webp" width="30" />
                                    </span>
                                    <span tabIndex="0" data-link="#share-twitter">
                                        <img src="img/facebook.webp" width="30" />
                                    </span>
                                </div> */}
                            </div>
                            <div className="col-md-5 col-p hidden-sm">
                                <div className="profile-pic background-fit"
                                     style={{
                                         backgroundImage: "url(" + `${userLoginData.picture}` + ")",
                                         backgroundPosition: 'center',
                                         backgroundSize: 'cover',
                                         backgroundRepeat: 'no-repeat'
                                     }}>
                                    <a href="javascript:void(0)">Edit</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                <section className="profile-strength-section">
                    <div className="container">
                        <div className="row" style={{
                            marginBottom: '20px'
                        }}>
                            {/* <div className="col-md-4">
                                <h2 style={{
                                    marginBottom: '10px'
                                }}><span>View Your Profile</span></h2>
                                <div className="copy-link">
                                    <span>https://stg.gigsfor.me/pankaj_sharma_bkc</span>
                                    <img src="img/facebook.webp" width="30" />
                                </div>
                                <p className="text-center">Copy Link</p>
                            </div> */}
                        </div>
                        <div className="row">
                            <div className="col-md-8">
                                {/* <div className="row hidden-sm">
                                    <div className="col-md-12">
                                        <h2><span>Strengthen Your Profile</span></h2>
                                        <p>The more
                                            information you add, the better!
                                        </p>
                                        <div className="progress-show">
                                            <span style={{
                                            width: '40%'
                                        }}></span>
                                        </div>
                                    </div>
                                </div> */}
                                {/* <div className="row update-profile-blk">
                                    <div className="col-md-12">
                                        <h2 className="hidden-lg hidden-md"
                                            style={{
                                                marginBottom: '10px'
                                            }}>
                                            <span>Increase Your Score</span>
                                        </h2>
                                        <ul className="profile-list">
                                            <li>
                                                <a href="javascript:void(0)" data-toggle="modal" data-target=".bio-modal">
                                                    <div>
                                                        <img src="img/facebook.webp" width="50" className="checkmark" />
                                                        <img src="img/facebook.webp" width="50" style={{
                                                            width: '30px',
                                                            marginBottom: '10px'
                                                        }} />
                                                        <span>Write Your Bio</span>
                                                    </div>
                                                </a>
                                            </li>
                                            <li>
                                                <a href="javascript:void(0)" data-toggle="modal" data-target=".about-modal">
                                                    <div>
                                                        <img src="img/facebook.webp" width="50" style={{
                                                            width: '30px',
                                                            marginBottom: '15px'
                                                        }} />
                                                        <span>Write About Me</span>
                                                    </div>
                                                </a>
                                            </li>
                                            <li>
                                                <a href="javascript:void(0)" data-toggle="modal"
                                                   data-target=".supper-modal">
                                                    <div>
                                                        <img src="img/facebook.webp" width="50" style={{
                                                            width: '30px',
                                                            marginBottom: '3px'
                                                        }} />
                                                        <span>Add Your Superpowers</span>
                                                    </div>
                                                </a>
                                            </li>
                                            <li>
                                                <a href="javascript:void(0)" data-toggle="modal"
                                                   data-target=".hashtag-modal">
                                                    <div>
                                                        <img src="img/facebook.webp" width="50" className="checkmark" />
                                                        <img src="img/facebook.webp" width="50" style={{
                                                            width: '30px',
                                                            marginBottom: '15px'
                                                        }} />
                                                        <span>Add #Tag</span>
                                                    </div>
                                                </a>
                                            </li>
                                            <li>
                                                <a href="javascript:void(0)" data-toggle="modal" data-target=".name-modal">
                                                    <div>
                                                        <img src="img/facebook.webp" width="50" className="checkmark" />
                                                        <img src="img/facebook.webp" width="50" style={{
                                                            width: '35px',
                                                            marginBottom: '15px'
                                                        }} />
                                                        <span>Add Name</span>
                                                    </div>
                                                </a>
                                            </li>
                                            <li>
                                                <a href="javascript:void(0)" data-toggle="modal"
                                                   data-target=".location-modal">
                                                    <div>
                                                        <img src="img/facebook.webp" width="50" className="checkmark" />
                                                        <img src="img/facebook.webp" width="50" style={{
                                                            width: '28px',
                                                            marginBottom: '2px'
                                                        }} />
                                                        <span>Add Location</span>
                                                    </div>
                                                </a>
                                            </li>
                                            <li>
                                                <a href="javascript:void(0)" data-toggle="modal" data-target=".email-modal">
                                                    <div>
                                                        <img src="img/facebook.webp" width="50" className="checkmark" />
                                                        <img src="img/facebook.webp" width="50" style={{
                                                            width: '30px',
                                                            marginBottom: '8px'
                                                        }} />
                                                        <span>Email</span>
                                                    </div>
                                                </a>
                                            </li>
                                        </ul>
                                        <div tabIndex="-1" role="dialog" aria-labelledby="myLargeModalLabel"
                                             aria-hidden="true" className="modal fade bio-modal">
                                            <div role="document" className="modal-dialog modal-md">
                                                <div className="modal-content">
                                                    <h2>Write Your Bio
                                                        <button type="button" data-dismiss="modal" aria-label="Close"
                                                                className="close"><span aria-hidden="true">×</span></button>
                                                    </h2>
                                                    <form className="form">
                                                        <div className="input-textarea-field form-input"><label
                                                            htmlFor="your-oneLineBio">Write Your Bio</label>
                                                            <textarea placeholder="One Line Bio" id="your-oneLineBio" maxLength="80"></textarea>
                                                        </div>
                                                        <div className="input-submit">
                                                            <button type="submit">SUBMIT</button>
                                                        </div>
                                                    </form>
                                                </div>
                                            </div>
                                        </div>
                                        <div tabIndex="-1" role="dialog" aria-labelledby="myLargeModalLabel"
                                             aria-hidden="true" className="modal fade about-modal">
                                            <div role="document" className="modal-dialog modal-md">
                                                <div className="modal-content">
                                                    <h2>About Me
                                                        <button type="button" data-dismiss="modal" aria-label="Close" className="close"><span aria-hidden="true">×</span></button>
                                                    </h2>
                                                    <form className="form">
                                                        <div className="input-textarea-field form-input"><label
                                                            htmlFor="your-oneLineBio">About Me</label> <textarea
                                                            placeholder="About Me" id="your-aboutMe"
                                                            maxLength="250"></textarea></div>
                                                        <div className="input-field form-input"><label
                                                            htmlFor="your-fbUrl">Facebook</label> <input
                                                            placeholder="Eg: https://www.facebook.com/abc" id="your-fbUrl" />
                                                        </div>
                                                        <div className="input-field form-input"><label
                                                            htmlFor="your-twitterUrl">Twitter</label> <input
                                                            placeholder="Eg: https://twitter.com/@abc" id="your-twitterUrl" />
                                                        </div>
                                                        <div className="input-field form-input"><label
                                                            htmlFor="your-instagramUrl">Instagram</label> <input
                                                            placeholder="Eg: https://www.instagram.com/abc/"
                                                            id="your-instagramUrl" /></div>
                                                        <div className="input-submit">
                                                            <button type="submit">SUBMIT</button>
                                                        </div>
                                                    </form>
                                                </div>
                                            </div>
                                        </div>
                                        <div tabIndex="-1" role="dialog" aria-labelledby="myLargeModalLabel"
                                             aria-hidden="true" className="modal fade expertise-modal">
                                            <div role="document" className="modal-dialog modal-md">
                                                <div className="modal-content">
                                                    <h2>Add Your Expertise Level
                                                        <button type="button" data-dismiss="modal" aria-label="Close"
                                                                className="close"><span aria-hidden="true">×</span></button>
                                                    </h2>
                                                    <form className="form">
                                                        <div className="input-select-field form-input">
                                                            <label>Expertise</label>
                                                            <select>
                                                                <option value="">Choose Experience</option>
                                                                <option value="New kid on the block - Beginner">New kid on the
                                                                    block - Beginner
                                                                </option>
                                                                <option value="Done a few projects on my own - Pro">Done a few
                                                                    projects on my own - Pro
                                                                </option>
                                                                <option value="Been There, Done That - Guru">Been There, Done
                                                                    That - Guru
                                                                </option>
                                                            </select>
                                                        </div>
                                                        <div className="input-submit">
                                                            <button type="submit">SUBMIT</button>
                                                        </div>
                                                    </form>
                                                </div>
                                            </div>
                                        </div>
                                        <div tabIndex="-1" role="dialog" aria-labelledby="myLargeModalLabel"
                                             aria-hidden="true" className="modal fade supper-modal">
                                            <div role="document" className="modal-dialog modal-md">
                                                <div className="modal-content">
                                                    <h2>Add Your Superpowers
                                                        <button type="button" data-dismiss="modal" aria-label="Close"
                                                                className="close"><span aria-hidden="true">×</span></button>
                                                    </h2>
                                                    <form className="form">
                                                        <div className="input-tags-field form-input">
                                                            <div className="tags-input-root">
                                                                <div className="tags-input-wrapper-default tags-input">
                                                                    <input type="text" placeholder="Add a tag" />
                                                                    <input type="hidden" name="tags" id="tags" />
                                                                </div>
                                                                <div style={{
                                                                    display: 'none'
                                                                }}>
                                                                    <p
                                                                        className="typeahead-badges">
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="input-submit">
                                                            <button type="submit">SUBMIT</button>
                                                        </div>
                                                    </form>
                                                </div>
                                            </div>
                                        </div>
                                        <div tabIndex="-1" role="dialog" aria-labelledby="myLargeModalLabel"
                                             aria-hidden="true" className="modal fade video-modal">
                                            <div role="document" className="modal-dialog modal-md">
                                                <div className="modal-content">
                                                    <h2>Add your youtube video
                                                        <button type="button" data-dismiss="modal" aria-label="Close"
                                                                className="close"><span aria-hidden="true">×</span></button>
                                                    </h2>
                                                    <form className="form">
                                                        <div className="input-field form-input">
                                                            <input type="text" placeholder="Video Url" />
                                                        </div>
                                                        <div className="input-submit">
                                                            <button type="submit">SUBMIT</button>
                                                        </div>
                                                    </form>
                                                </div>
                                            </div>
                                        </div>
                                        <div tabIndex="-1" role="dialog" aria-labelledby="myLargeModalLabel"
                                             aria-hidden="true" className="modal fade hashtag-modal">
                                            <div role="document" className="modal-dialog modal-md">
                                                <div className="modal-content">
                                                    <h2>Add your #Tag
                                                        <button type="button" data-dismiss="modal" aria-label="Close"
                                                                className="close"><span aria-hidden="true">×</span></button>
                                                    </h2>
                                                    <form className="form">
                                                        <div className="input-field form-input"><input type="text"
                                                                                                       placeholder="#Tag" />
                                                        </div>
                                                        <div className="input-submit">
                                                            <button type="submit">SUBMIT</button>
                                                        </div>
                                                    </form>
                                                </div>
                                            </div>
                                        </div>
                                        <div tabIndex="-1" role="dialog" aria-labelledby="myLargeModalLabel"
                                             aria-hidden="true" className="modal fade name-modal">
                                            <div role="document" className="modal-dialog modal-md">
                                                <div className="modal-content">
                                                    <h2>Add your name
                                                        <button type="button" data-dismiss="modal" aria-label="Close"
                                                                className="close"><span aria-hidden="true">×</span></button>
                                                    </h2>
                                                    <form className="form">
                                                        <div className="input-field form-input"><input type="text"
                                                                                                       placeholder="First Name" />
                                                        </div>
                                                        <div className="input-field form-input"><input type="text"
                                                                                                       placeholder="Last Name" />
                                                        </div>
                                                        <div className="input-submit">
                                                            <button type="submit">SUBMIT</button>
                                                        </div>
                                                    </form>
                                                </div>
                                            </div>
                                        </div>
                                        <div tabIndex="-1" role="dialog" aria-labelledby="myLargeModalLabel"
                                             aria-hidden="true" className="modal fade location-modal">
                                            <div role="document" className="modal-dialog modal-md">
                                                <div className="modal-content">
                                                    <h2>Add your location
                                                        <button type="button" data-dismiss="modal" aria-label="Close"
                                                                className="close"><span aria-hidden="true">×</span></button>
                                                    </h2>
                                                    <form className="form">
                                                        <div className="input-field form-input">
                                                            <input type="text" placeholder="Your Location" />
                                                        </div>
                                                        <div className="input-submit">
                                                            <button type="submit">SUBMIT</button>
                                                        </div>
                                                    </form>
                                                </div>
                                            </div>
                                        </div>
                                        <div tabIndex="-1" role="dialog" aria-labelledby="myLargeModalLabel"
                                             aria-hidden="true" className="modal fade email-modal">
                                            <div role="document" className="modal-dialog modal-md">
                                                <div className="modal-content">
                                                    <h2>Email
                                                        <button type="button" data-dismiss="modal" aria-label="Close"
                                                                className="close"><span aria-hidden="true">×</span></button>
                                                    </h2>
                                                    <form className="form">
                                                        <h3 className="email-title">Email:
                                                            me.pankaj.s@gmail.com
                                                        </h3>
                                                        <div className="input-select-field form-input">
                                                            <label>Make your
                                                                email public</label>
                                                            <select>
                                                                <option value="Hide">No</option>
                                                                <option value="Show">Yes</option>
                                                            </select>
                                                        </div>
                                                        <div className="input-submit">
                                                            <button type="submit">SUBMIT</button>
                                                        </div>
                                                    </form>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div> */}
                            </div>
                        </div>
                    </div>
                </section>
                <section className="e-f-section">
                    <div className="container">
                        <div className="row">
                            <div className="col-md-6 c-1">
                                <h2>
                                    <img src="/img/score.svg" width="93" />
                                    entrepreneur Efficacy Scores
                                </h2>
                                <ul className="list-unstyled">
                                    {/* <li>
                                        
                                    </li>
                                    <li>
                                        Innovation <span>0</span>
                                    </li>
                                    <li>
                                        Management <span>4</span>
                                    </li>
                                    <li>
                                        Risktaking <span>4</span>
                                    </li>
                                    <li>
                                        Financial control <span>0</span>
                                    </li> */}
                                    {entrepreneurEfficacyEntries}
                                </ul>
                            </div>
                            <div className="col-md-6 c-2">
                                <h2>
                                    <img src="/img/score.svg" width="93" />
                                    founder Motivation Scores
                                </h2>
                                <ul className="list-unstyled">
                                    {founderMotivationEntries}
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>
                <section className="skills-section">
                    <div className="container">
                        <div className="row">
                            <div className="col-md-12">
                                <ul className="list-inline">
                                    <li>top Skill</li>
                                    <li><a href="#">sales</a></li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>
                {/* <section className="course-recom-section">
                    <div className="container">
                        <div className="row">
    <div className="col-md-12">{ideasList.length ? <h2>Ideas in your binder</h2> : <h2>No Ideas Yet. Go to Slack bot and get started.</h2>}</div>
                        </div>
                        <div className="row">
                            {ideasList}
                        </div>
                    </div>
                </section> */}

                <section className="course-recom-section">
                    <div className="container">
                        <div className="row">
    <div className="col-md-12">{ideasList.length ? <h2>Ideas in your binder</h2> : <h2>No Ideas Yet. Go to Slack bot and get started.</h2>}</div>
                        </div>
                        <table class="table table-striped">
                            <thead>
                            <tr>
                                <th>Name</th>
                                <th>Owner</th>
                                <th>Deepdive Status</th>
                            </tr>
                            </thead>
                            <tbody>
                            {ideasList}
                            </tbody>
                        </table>
                    </div>
                    <div className="container">
                        <div className="row">
                            <div className="col-md-12">
                                {/* <Accordion defaultActiveKey="0">
                                    <Card>
                                        <Card.Header>
                                        <Accordion.Toggle as={Button} variant="link" eventKey="0" onClick={this.accordionClick}>
                                            Click me!
                                        </Accordion.Toggle>
                                        </Card.Header>    
                                        <Accordion.Collapse eventKey="0">
                                        <Card.Body>Hello! I'm the body</Card.Body>
                                        </Accordion.Collapse>
                                    </Card>
                                    <Card>
                                        <Card.Header>
                                        <Accordion.Toggle as={Button} variant="link" eventKey="1">
                                            Click me!
                                        </Accordion.Toggle>
                                        </Card.Header>
                                        <Accordion.Collapse eventKey="1">
                                        <Card.Body>Hello! I'm another body</Card.Body>
                                        </Accordion.Collapse>
                                    </Card>
                                </Accordion> */}
                                {/* <Acc /> */}
                            </div>
                        </div>
                    </div>
                    
                </section>
                
            </main>
        )
    }
}


export default Profile