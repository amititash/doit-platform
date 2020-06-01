import React , { Component } from 'react'
import { Link } from "react-router-dom";
import Axios from 'axios';
import { coreModuleinstance } from '../axios';
import ReactHtmlParser, { processNodes, convertNodeToElement, htmlparser2 } from 'react-html-parser';
import queryString from 'query-string';
import IdeaDetailSection1 from '../components/idea-detail/section1';
import IdeaDetailSection2 from '../components/idea-detail/section2';


class IdeaDetail extends Component {

    state = {
        report : {},
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
                let report = response.data && response.data.processedReport ? response.data.processedReport : {};
                this.setState({
                    report , loading : false
                });
            }
            catch(e){
                this.setState({
                    loading : false,
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
        // let report = this.state.html;
        // if(this.state.loading){
        //     return (
        //         <div>
        //             <img src="https://miro.medium.com/max/882/1*9EBHIOzhE1XfMYoKz1JcsQ.gif" alt="Loading..." height="42" width="42"></img>
        //         </div>
        //     )
        // }
        return (
            <main className="main-section">
                <section className="stg-detail-section" style={{
                    paddingBottom: '100px'
                }}>
                    <div style={{marginTop : '-150px'}} className="container">
                        {/* <div className="row">
                            <div className="col-md-12">
                                <div className="stg-detail-blk">
                                    <div className="stg-art-img background-fit"
                                         style={{
                                             backgroundImage: "url(" + "https://i.stack.imgur.com/l60Hf.png" + ")",
                                             backgroundPosition: 'center',
                                             backgroundSize: 'cover',
                                             backgroundRepeat: 'no-repeat'
                                         }}></div>
                                    <div className="stg-art-detail"><h3>{(this.state.report && this.state.report.idea_name) || "Idea"}</h3> <p>
                                        <span>By {this.state.report && this.state.report.idea_owner}</span><span></span><span></span></p></div>
                                </div>
                            </div>
                        </div> */}
                        
                        <div className="row">
                            <div className="col-md-12">
                                <div>
                                    <IdeaDetailSection1 report={this.state.report}/>
                                </div>
                            </div>
                            <div className="col-md-12">
                                <div>
                                    <IdeaDetailSection2 report={this.state.report} />
                                </div>
                            </div>
                        </div>
                       
                    </div>
                </section>
            </main>
        )
    }

}

export default IdeaDetail;