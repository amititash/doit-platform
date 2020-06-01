import React , { useState, Component } from 'react';
import { coreModuleinstance } from '../axios';
import queryString from 'query-string';
import Numeral from 'numeral';
import {number_formatter , skills_formatter , capitalize} from '../utils/formatter';
import createPlotlyComponent from 'react-plotly.js/factory';
const Plotly = window.Plotly;
const Plot = createPlotlyComponent(Plotly);

class Report extends Component {

    state = {
        report : {},
        html : '',
        loading : true
    }

    async componentDidMount() {
        // let user = localStorage.getItem('startiq_user');
        let query = queryString.parse(this.props.location.search)
        let user = {
            email : query.email,
        }
        let idea = {};
        if(user){
            // user = JSON.parse(user);
            // let idea_name_slug = this.props.match.params.id;
            let idea_name_slug = query.idea;
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
                console.log(report);
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

        let ideaAnalysisTip1 = null;
        if(this.state.report.freshness && this.state.report.fundability){
            if(this.state.report.freshness > 5 && this.state.report.fundability > 0.25){
                ideaAnalysisTip1 = <li>Your idea is well-established and other companies have a headstart, and incumbents have raised considerable funds already.</li>
            }
        }


        let ideaAnalysisTip2 = null;
        if(this.state.report.customerSize){
            if(this.state.report.customerSize < 100000 ){
                if(this.state.report.totalAnnualRevenue < 500000) {
                    ideaAnalysisTip2 = <li>Your target segment and market size are both small, and the total annual revenue you can make at your peak is ${number_formatter(this.state.report.totalAnnualRevenue)}</li>
                }
                else {
                    ideaAnalysisTip2 = <li>Your target segment is small but market size based on revenue are big , and the total annual revenue you can make at your peak is ${number_formatter(this.state.report.totalAnnualRevenue)}</li>
                }
            }
            else {
                if(this.state.report.totalAnnualRevenue < 500000){
                    ideaAnalysisTip2 = <li>Your target segment is big but looks like your market size based on revenue is small, and the total annual revenue you can make at your peak is ${number_formatter(this.state.report.totalAnnualRevenue)}</li>
                }
                else {
                    ideaAnalysisTip2 = <li>Your target segment and market size based on revenue are pretty big and the total annual revenue you can make at your peak is ${number_formatter(this.state.report.totalAnnualRevenue)}</li>
                }
            }
        }

        
        

        let competitors_to_render = [];
        if(this.state.report.competitors && this.state.report.competitors.length){
            competitors_to_render = this.state.report.competitors.filter((el) => el.crel >= 3);
            competitors_to_render.sort((a,b)=>b.crel-a.crel);
            competitors_to_render = competitors_to_render.map( (element) => (
            <li key={element._id}> 
                {element.cname} : <a href={`http://${element.url}`}>{element.url}</a> (Relevance : {element.crel})
            </li>
            ));
        }

        let ideaAnalysisTip3 = null;
        if(competitors_to_render.length > 5){
            ideaAnalysisTip3 = <li>Lots of competitors, important to find a niche where you can win.</li>
        }
        else {
            ideaAnalysisTip3 = <li>Not much competition</li>
        }



        let subscriptionInfo = "It looks like you make money through a subscription model.";
        if(!this.state.report.subscriptionService){
            subscriptionInfo = "It looks like you make money through a non-subscription model.";
        }


        let unitPriceInfo = null;
        if(this.state.report.unitPrice){
          unitPriceInfo = (
            <div>
              <h3 >How much will you charge for each unit of your product?</h3>
              <p>${Numeral(this.state.report.unitPrice).format('0,0')}</p>
            </div>  
          )
        }
      
      
      
      
        let revenueFromSubscription = null;
        if(this.state.report.subscriptionService){
          revenueFromSubscription = (
            <div>
              <h3>FROM SUBSCRIPTIONS</h3>
              <h3>How much will you charge a customer for one month’s subscription?</h3>
              <p>${Numeral(this.state.report.subscription_price).format('0,0')}</p>
            </div>
          )
        }
      
      
        let annualRevenueFromOtherSales = null;
        if(this.state.report.annualRevenueFromOtherSales){
          annualRevenueFromOtherSales = (
            <div>
              <h3>What is your anticipated revenue from other sales?</h3>
              <p>${Numeral(this.state.report.annualRevenueFromOtherSales).format('0,0')}</p>
              <br />
      
            </div>
          )
        }


        let unitCostInfo = null;
        if(this.state.report.unitCostInfo){
            unitCostInfo = (
            <div>
                <h3>How much does it cost you to produce a unit of your product?</h3>
                <p>{Numeral(this.state.report.unitCost).format('0,0')}</p>
                <br />
            </div>
            )
        }


        let employeesInfo = [];
        if(this.state.report.employees && this.state.report.employees.length){
          employeesInfo = this.state.report.employees.map( (element) => (
            <li key={element._id}>
              You said you will hire or pay for a {element.position} . <br />This will cost you a total of ${Numeral(element.salary).format('0,0')} per year.
            </li>
          ))
        }
      
      
      
        let infrastructureCostInfo = [];
        if(this.state.report.otherExpenses && this.state.report.otherExpenses.length){
          infrastructureCostInfo = this.state.report.otherExpenses.map((element) => (
            <li key={element._id}>
              You said you will pay for {element.expenseType} . <br /> This will cost you a total of ${Numeral(element.cost).format('0,0')} per year.
            </li>
          ))
        }


        let profitBlock = null , lossBlock = null;
        if(this.state.report.inProfit){
            profitBlock = (
            <div>
                <h3>PROFITABILITY</h3>
                <p>Based on the numbers you provided, if your business grows at the rate you anticipate here is your overall profitability in the next two years.</p>
                <p>Based on the information you provided your total revenue is ${Numeral(this.state.report.totalAnnualRevenue).format('0,0')} and your total costs of acquiring customers and producing your good is ${Numeral(this.state.report.totalCustomerAcquisitionAndProductionCost).format('0,0')}. Your profit figure, excluding costs of labor and infrastructure is: ${Numeral(this.state.report.profitExcludingLabourAndInfraCosts).format('0,0')}. </p>
                <p>If we include the cost of labor and infrastructure, the profits are ${Numeral(this.state.report.annualProfit).format('0,0')} </p>
                <p>This is a profit margin of {Numeral(this.state.report.profitToRevenueRatio).format('0,0')} %</p>
            </div>
            )
        }
        else {
            lossBlock = (
            <div>
                <h3>PROFITABILITY</h3>
                <p>Based on the numbers you provided, if your business grows at the rate you anticipate here is your overall profitability in the next two years.</p>
                <p>Based on the information you provided your total revenue is ${Numeral(this.state.report.totalAnnualRevenue).format('0,0')} and your total costs of acquiring customers and producing your good is ${Numeral(this.state.report.totalCustomerAcquisitionAndProductionCost).format('0,0')}.  </p>
                {this.state.report.lossExcludingLabourAndInfraCosts ? 
                <p>Your loss figure, excluding costs of labor and infrastructure is: ${number_formatter(this.state.report.lossExcludingLabourAndInfraCosts)}.</p>
                : <p>Your profit figure, excluding costs of labor and infrastructure is: ${number_formatter(this.state.report.profitExcludingLabourAndInfraCosts)}.</p>}
                <p>If we include the cost of labor and infrastructure, the losses are ${number_formatter(this.state.report.annualLoss)}</p>
                <p>This is a loss margin of {number_formatter(this.state.report.lossToRevenueRatio)} %</p>
            </div>
            )
        }


        
        let antiSkillsInfo = [];
        if(this.state.report.antiSkills && this.state.report.antiSkills.length){
            antiSkillsInfo = this.state.report.antiSkills.map( (element) => (
            <li>
                {capitalize(element)}
            </li>
            ))
        }

        let coSkillsInfo = [];
        if(this.state.report.coSkills && this.state.report.coSkills.length){
            coSkillsInfo = this.state.report.coSkills.map( (el) => <li>{capitalize(el.coSkill)}</li>)
        }


        let numberOfCustomers = [];
        let totalCustomersGraphData = {
            type : 'bar',
            x : [1,2,3,4,5,6,7,8,9,10,11,12],
            y : []
        };
        if(this.state.report.total_customers){
            numberOfCustomers = this.state.report.total_customers.map( (el,index) => <p>Month {index+1}: {el} </p>);
            this.state.report.total_customers.forEach((el)=> totalCustomersGraphData.y.push(el));
        }
        


        return (
            <main className="main-section report-main">
                <section className="report-section-1">
                    <div className="container">
                        <div className="row">
                            <div className="col-md-12">
                                <h1>DEEPDIVE ANALYSIS OF YOUR IDEA</h1>
                            </div>
                        </div>
                    </div>
                </section>
                <section className="report-section-2">
                    <div className="container">
                        <div className="row">
                            <div className="col-md-6">
                                <div>
                                    <h2>{this.state.report.idea_name}</h2>
                                    <p>{this.state.report.idea_description}</p>
                                    <span>PREPARED BY Quinn<br/>IDEA SUBMITTED BY {this.state.report.user_name || this.state.report.idea_owner}</span>
                                </div>
                            </div>
                            <div className="col-md-6">
                                <img src="/img/img6.svg" />
                            </div>
                        </div>
                    </div>
                </section>
                <section className="report-section-3">
                    <div className="container">
                        <div className="row">
                            <div className="col-md-12">
                                <div className="question-blk">
                                    <h2 style={{textAlign : 'center'}}><span></span>THE BIG PICTURE</h2>
                                    <h3>We evaluated your idea on 5 critical dimensions. Here are some top-line insights:</h3>
                                    <ul>
                                        {ideaAnalysisTip1}
                                        {ideaAnalysisTip2}
                                        {ideaAnalysisTip3}
                                    </ul>
                                    
                                    
                                </div>
                                <div className="question-blk">
                                    <h2><span>01</span>YOUR IDEA</h2>
                                    <h3>What is your idea?</h3>
                                    <p>{this.state.report.idea_description}</p>
                                    <h3>What do you call your product or service?</h3>
                                    <p>{this.state.report.idea_name}</p>
                                    <h3>What market categories are you competing in?</h3>
                                    <p>{this.state.report.user_categories}, {this.state.report.co_categories && this.state.report.co_categories[0]}</p>
                                </div>
                                <div className="question-blk">
                                    <h2><span>02</span>COMPETITORS AND EXISTING LANDSCAPE</h2>
                                    <h3>How Old Is This Idea?</h3>
                                    <p>Ideas that are similar to yours are about {this.state.report.freshness} years old, other companies may have a head start.</p>
                                    <h3>What Percentage Of Similar Startups Have Been Funded?</h3>
                                    <p>{this.state.report.fundability}% of companies that sound like yours have been funded either through angel investments or venture capital.</p>
                                    <h3>Are There Companies Providing Similar Products Or Services?</h3>
                                    <p>Based on our analysis, and your input. It seems like at least these companies are providing similar offerings in the market. It would be useful to research these and other similar companies to better define your value add.</p>
                                    <ul>
                                        {competitors_to_render}
                                    </ul>
                                </div>
                                <div className="question-blk">
                                    <h2><span>03</span> TARGET CUSTOMERS</h2>
                                    <h3>Who Are Your Target Customers?</h3>
                                    <p>You are serving: <strong>{this.state.report.target_segment}</strong>.</p>
                                    <p>Your target customer: <strong>{this.state.report.targetCustomer}</strong></p>
                                    <p>Niche: <strong>{this.state.report.targetCustomerDescription}</strong></p>
                                    <h3>What Is The Size Of The Market You Can Address With Your Business?</h3>
                                    <p>{Numeral(this.state.report.customerSize).format('0,0')} {this.state.report.targetCustomerDescription}</p>
                                </div>
                                <div className="question-blk">
                                    <h2><span>04</span> BUSINESS MODEL</h2>
                                    <h3>What Is Your Revenue Model?</h3>
                                    <p>{subscriptionInfo}</p>
                                    <h3>CUSTOMER ACQUISITION</h3>
                                    <h3>Here are some of the assumptions about customer acquisition and churn you’ve made in your model.</h3>
                                    <p><strong>Customers in the first month:</strong> {this.state.report.customers_in_first_month}</p>
                                    <p><strong>Expected growth rate of customer acquisition:</strong> {this.state.report.customer_growth_rate*100}%</p>
                                    <p><strong>Customer retention:</strong> {this.state.report.customer_persistence*100}%</p>
                                    <p>With these assumptions, we should expect:</p>
                                    {/* <p>Customers in the first 12 months:</p> */}
                                    {/* {numberOfCustomers} */}
                                    <Plot
                                        data={[
                                        // {type: 'bar', x: [1, 2, 3], y: [2, 5, 3]},
                                        totalCustomersGraphData
                                        ]}
                                        layout={{
                                            width: 720, 
                                            height: 640,
                                            title: 'Customers in the first 12 months:',
                                            font: {
                                                family: 'Courier New, monospace',
                                                size: 18,
                                                color: '#7f7f7f'
                                            },
                                            xaxis : {
                                                title: {
                                                    text: 'Months',
                                                    font: {
                                                      family: 'Courier New, monospace',
                                                      size: 18,
                                                      color: '#7f7f7f'
                                                    }
                                                }
                                            },
                                            yaxis : {
                                                title: {
                                                  text: 'Total customers',
                                                  font: {
                                                    family: 'Courier New, monospace',
                                                    size: 18,
                                                    color: '#7f7f7f'
                                                  }
                                                }
                                            }
                                        }}
                                    />
                                    {/* {revenueFromSubscription} */}
                                    {/* {annualRevenueFromOtherSales}         */}
                                    <h3>REVENUE</h3>  
                                    {revenueFromSubscription }
                                    <h3>FROM OTHER PRODUCTS</h3>
                                    <h3>How many units of a product or service will one customer purchase each month?</h3>
                                    <p>{number_formatter(this.state.report.units || 0)} units</p>
                                    {unitPriceInfo}
                                    {/* {this.state.report.subscriptionService && }  */}
                                    <h3>COSTS</h3>
                                    <h3>How Much Does It Cost You To Acquire A Customer?</h3>
                                    <p>${number_formatter(this.state.report.customerAcquisitionCost)}</p>
                                    {unitCostInfo}
                                    <h3><strong>LABOR COSTS</strong></h3>
                                    <h3>How Much Are Your Labor Costs?</h3>
                                    <ul>
                                        {employeesInfo}
                                    </ul>
                                    <p>Your total cost of labor will be <strong>${number_formatter(this.state.report.employeesCost)} for the first year, which will be about ${number_formatter(this.state.report.employeesCost/12)} per month.</strong></p>
                                    <h3>INFRASTRUCTURE AND TECHNOLOGY COSTS</h3>
                                    <h3>How Much Are Your Infrastructure And Technology Costs?</h3>
                                    <ul>
                                        {infrastructureCostInfo}
                                    </ul>
                                    <p>Your total cost of infrastructure and technology will be <strong>${number_formatter(this.state.report.otherExpensesCost)} for the first year, which will be about ${number_formatter(this.state.report.otherExpensesCost/12)} per month.</strong></p>
                                    <h3>What Are Your Annual Total Costs?</h3>
                                    <p>${number_formatter(this.state.report.annualCosts)}</p>
                                    {profitBlock}
                                    {lossBlock}
                                </div>
                                <div className="question-blk">
                                    <h2><span>05</span> TEAM</h2>
                                    <h4>YOUR CAPABILITIES</h4>
                                    <h3>Based on your responses to the initial founder assessment, your skill set includes the following management and startup skills:</h3>
                                    <p>These are your top skills:</p>
                                    <ul>
                                        <li>{skills_formatter(this.state.report.startupSkill1)}</li>
                                        <li>{skills_formatter(this.state.report.startupSkill2)}</li>
                                    </ul>
                                    <h3>Based on your responses, it looks like your technical strength lies in the following skills:</h3>
                                    <ul>
                                        {coSkillsInfo}
                                    </ul>
                                        {/* <p>{this.state.report.topSkill}</p> */}
                                    <h3>WHO YOU NEED ON YOUR TEAM</h3>
                                    <h3>This suggests that based on what this startup needs you may want to consider hiring people who are stronger in the following skills</h3>
                                    <ul>
                                        <li>{skills_formatter(this.state.report.teamMemberSkill1)}</li>
                                        <li>{skills_formatter(this.state.report.teamMemberSkill2)}</li>
                                        <li>{skills_formatter(this.state.report.teamMemberSkill3)}</li>
                                    </ul>
                                    <h3>In terms of technical skills, you may want to find people who have these skills that are different from you (experimental feature, currently for only tech-focused startups)</h3>
                                    <ul>
                                        {antiSkillsInfo}
                                    </ul>
                                </div>
                                {/* <div className="question-blk">
                                    <h2><span>06</span> BOTTOM LINE</h2>
                                    <h3>Based On What You Provided, It Looks Like The Following Things Are What You Need To Consider:</h3>
                                </div> */}
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        )
    }
}



export default Report