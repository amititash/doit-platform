import React , { Component } from 'react'
import { Link } from "react-router-dom";
import Axios from 'axios';
import { coreModuleinstance } from '../axios';
import ReactHtmlParser, { processNodes, convertNodeToElement, htmlparser2 } from 'react-html-parser';
import queryString from 'query-string';

class IdeaDetail extends Component {

    state = {
        idea : {},
        html : '',
        loading : true
    }

    async componentDidMount() {
        // let user = localStorage.getItem('startiq_user');
        let query = queryString.parse(this.props.location.search)
        let user = {
            email : query.email
        }
        let idea = {};
        if(user){
            // user = JSON.parse(user);
            let idea_name_slug = this.props.match.params.id;
            let idea_id = "";
            try {
                let url = `/kos/ideaNameSlug?emailId=${user.email}&ideaNameSlug=${idea_name_slug}`;
                let ideaByNameResponse = await coreModuleinstance.get(url);
                if(!ideaByNameResponse.data){
                    console.log("idea not found");
                    throw new Error("idea not found");
                }
                idea_id = ideaByNameResponse.data._id;
                let reportUrl = `/kos/report?ko_id=${idea_id}&emailId=${user.email}` ;
                let response = await coreModuleinstance.get(reportUrl);
                let ideaUrl = `/kos/ko?id=${idea_id}`;
                let ideaResponse = await coreModuleinstance.get(ideaUrl);
                idea = ideaResponse.data;
                let html = response.data ? response.data.html : "<h1>No such idea exists</h1>";
                this.setState({
                    idea, html , loading : false
                });
            }
            catch(e){
                this.setState({
                    loading : false,
                    html : "<h1>No such idea exists</h1>"
                })
            }
        }
    }

    render() {
        // let user = localStorage.getItem('startiq_user');
        // if(!user){
        //     return (
        //         <div className="container">
        //                 <div className="row">
        //                     <div className="col-md-12">
        //                         <div className="stg-detail-blk">
        //                             <h1>Please login to see the results</h1>
        //                         </div>
        //                     </div>
        //                 </div>
        //         </div>
        //     )
        // }
        let report = this.state.html;
        if(this.state.loading){
            return (
                <div>
                    <img src="https://miro.medium.com/max/882/1*9EBHIOzhE1XfMYoKz1JcsQ.gif" alt="Loading..." height="42" width="42"></img>
                </div>
            )
        }
        return (
            <main className="main-section">
                <section className="stg-detail-section" style={{
                    paddingBottom: '100px'
                }}>
                    <div className="container">
                        <div className="row">
                            <div className="col-md-12">
                                <div className="stg-detail-blk">
                                    <div className="stg-art-img background-fit"
                                         style={{
                                             backgroundImage: "url(" + "https://i.stack.imgur.com/l60Hf.png" + ")",
                                             backgroundPosition: 'center',
                                             backgroundSize: 'cover',
                                             backgroundRepeat: 'no-repeat'
                                         }}></div>
                                    <div className="stg-art-detail"><h3>{(this.state.idea && this.state.idea.ideaName) || "Idea"}</h3> <p>
                                        <span>By {this.state.idea && this.state.idea.ideaOwner}</span><span></span><span></span></p></div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="row">
                            <div className="col-md-12">
                                <div>
                                    {ReactHtmlParser(report)}
                                </div>
                                {/* <iframe
                                    src="https://docs.google.com/presentation/d/e/2PACX-1vR4vAKnR6k1q6Su-sUkbvlW-kpj0WiJKs5AnajRTUwmo_VMuf1HuHjq9zLgDE1u-cQ3Bul-EJ-K0Tyj/embed?start=false&amp;loop=false&amp;delayms=15000"
                                    frameBorder="0" width="960" height="749" allowFullScreen="allowfullscreen"
                                    mozallowfullscreen="true" webkitallowfullscreen="true" className="stg-detail-i"
                                    style={{
                                        width: '100%'
                                    }}></iframe> */}
                            </div>
                        </div>
                        {/* <div className="row row-3">
                            <div className="col-md-6"><h3>Course Description</h3> <p>Introduction to the Gig Economy of
                                2020. Learn all about the white collar gig work and how can can kick-start your career as a
                                freelancer with this free course</p></div>
                            <div className="col-md-6"><h3>Tags</h3> <p>Gigs, Gig Economy, Gig Work, Gig Economy 101,
                                Freelance, Freelancer, Freelance Work</p></div>
                        </div> */}
                    </div>
                </section>
            </main>
        )
    }

}

export default IdeaDetail;