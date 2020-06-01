import React from 'react';
import classes from './section2.module.css';
import img from '../../assets/images/screen2.png';

const ideaDetailSection2 = (props) => {




  let competitors_to_render = [];
  if(props.report.competitors && props.report.competitors.length){
    competitors_to_render = props.report.competitors.map( (element) => (
      <li key={element._id}> 
        {element.cname} : <a href={`http://${element.url}`}>{element.url}</a> (Relevance : {element.crel})
      </li>
    ));
  }


  let subscriptionInfo = "It looks like you make money through a subscription model. This means...";

   

  if(!props.report.subscriptionService){
    subscriptionInfo = "It looks like you make money through a non-subscription model. This means...";
  }




  let unitPriceInfo = null;
  if(props.report.unitPrice){
    unitPriceInfo = (
      <div>
        <h5 className={classes.subtitle}>How many customers will you serve each month?</h5>
        <p className={classes["description"]}>{props.report.customerSize}</p>
        <br />
      </div>
    )
  }




  let revenueFromSubscription = null;
  if(props.report.subscriptionService){
    revenueFromSubscription = (
      <div>
        <h5 className={classes.subtitle}>What is your anticipated revenue from subscriptions?</h5>
        <p className={classes["description"]}>${props.report.annualRevenueFromSubscription}</p>
        <br />
    </div>
    )
  }


  let annualRevenueFromOtherSales = null;
  if(props.report.annualRevenueFromOtherSales){
    annualRevenueFromOtherSales = (
      <div>
        <h5 className={classes.subtitle}>What is your anticipated revenue from other sales?</h5>
        <p className={classes["description"]}>${props.report.annualRevenueFromOtherSales}</p>
        <br />

      </div>
    )
  }




  let unitCostInfo = null;
  if(props.report.unitCostInfo){
    unitCostInfo = (
      <div>
        <h5 className={classes.subtitle}>How much does it cost you to produce a unit of your product?</h5>
        <p className={classes["description"]}>{props.report.unitCost}</p>
        <br />
      </div>
    )
  }




  let employeesInfo = [];
  if(props.report.employees && props.report.employees.length){
    employeesInfo = props.report.employees.map( (element) => (
      <li key={element._id}>
        You said you will hire or pay for {element.position} . This will cost you a total of ${element.salary} per year.
      </li>
    ))
  }



  let infrastructureCostInfo = [];
  if(props.report.otherExpenses && props.report.otherExpenses.length){
    infrastructureCostInfo = props.report.otherExpenses.map((element) => (
      <li key={element._id}>
        You said you will pay for {element.expenseType} . This will cost you a total of ${element.cost} per year.
      </li>
    ))
  }




  let profitBlock = null , lossBlock = null;
  if(props.report.inProfit){
    profitBlock = (
      <div>
        <h5 className={classes.subtitle}>PROFIT</h5>
        <p className={classes["description"]}>Based on the information you provided your total revenue is ${props.report.totalAnnualRevenue} and your total costs of acquiring customers and producing your good is ${props.report.totalCustomerAcquisitionAndProductionCost}. Your profit figure, excluding costs of labor and infrastructure is: ${props.report.profitExcludingLabourAndInfraCosts}. </p>
        <p className={classes["description"]}>If we include the cost of labor and infrastructure, the profits are ${props.report.annualProfit} </p>
        <p className={classes["description"]}>This is a profit margin of {props.report.profitToRevenueRatio} %</p>
      </div>
    )
  }
  else {
    lossBlock = (
      <div>
        <h5 className={classes.subtitle}>LOSS</h5>
        <p className={classes["description"]}>Based on the information you provided your total revenue is ${props.report.totalAnnualRevenue}} and your total costs of acquiring customers and producing your good is ${props.report.totalCustomerAcquisitionAndProductionCost}.  </p>
        {props.report.lossExcludingLabourAndInfraCosts ? 
        <p className={classes["description"]}>Your loss figure, excluding costs of labor and infrastructure is: ${props.report.lossExcludingLabourAndInfraCosts}.</p>
        : <p className={classes["description"]}>Your profit figure, excluding costs of labor and infrastructure is: ${props.report.profitExcludingLabourAndInfraCosts}.</p>}
        <p className={classes["description"]}>If we include the cost of labor and infrastructure, the losses are ${props.report.annualLoss}</p>
        <p className={classes["description"]}>This is a loss margin of {props.report.lossToRevenueRatio} %</p>
      </div>
    )
  }


  let antiSkillsInfo = [];
  if(props.report.antiSkills && props.report.antiSkills.length){
    antiSkillsInfo = props.report.antiSkills.map( (element) => (
      <li>
        {element}
      </li>
    ))
  }


  




  
    return (
        <div className={classes["body-class"]}>
          <div className={classes["page"]}>
            <div className={classes["page-content"]}>
              <div className={classes["head-section"]}>
                <div className={classes["head-box"]}>
                  DEEPDIVE ANALYSIS OF YOUR IDEA
                </div>
                {/* <div className={classes["head-box2"]}>
                  PAGE 2
                </div> */}
              </div>
            
              <div className={classes["main-content"]}>
                <div className={classes["content"]}>
                  <div className={classes["content-2"]}>
                    <div className={classes["our-mission"]}>
                      <h1>YOUR IDEA:</h1>
                      <div>
                        <p>
                          {props.report.idea_description}
                        </p>
                      </div>
                    </div>
                    <div className={classes["image-section"]}>
                      <img className={classes["image"]} src= {img} alt="" />
                    </div>
                  </div>  
                </div>
                <div className={classes["listings"]}>
                  <div className={classes["list"]}>
                    <div>
                      <h1 className={classes["list-no"]}>01</h1>
                    </div>
                    <div>
                      <h3 className={classes["title"]}>COMPETITORS AND EXISTING LANDSCAPE</h3>
                      <div>
                        <h5 className={classes.subtitle}>How old is this idea?</h5>
                        <p className={classes["description"]}>Ideas that are similar to yours are about {props.report.freshness} years old, other companies may have a head start.</p>
                      </div>
                      <br />
                      <div>
                        <h5 className={classes.subtitle}>What percentage of similar startups have been funded?</h5>
                        <p className={classes["description"]}>{props.report.fundability}% of companies that sound like yours have been funded either through angel investments or venture capital.</p>
                      </div>
                      <br />
                      <div>
                        <h5 className={classes.subtitle}>Are there companies providing similar products or services?</h5>
                        <p className={classes["description"]}>Based on our analysis, and your input. It seems like at least these companies are providing similar offerings in the market. It would be useful to research these and other similar companies to better define your value add.</p>
                        <br />
                        <p>
                          <ul className={classes["description"]}>
                          {competitors_to_render}
                          </ul>
                        </p>
                      </div>
                      <br />
                      
                    </div>
                  </div>
                  <div className={classes["list"]}>
                    <div>
                      <h1 className={classes["list-no"]}>02</h1>
                    </div>
                    <div>
                      <h3 className={classes["title"]}>TARGET CUSTOMERS</h3>
                      <div>
                        <h5 className={classes.subtitle}>Who are your target customers?</h5>
                        <p className={classes["description"]}>You are serving {props.report.target_segment}. Your target customer is a(n) {props.report.targetCustomer} and specifically {props.report.targetCustomerDescription} </p>
                      </div>
                      <br />
                      <div>
                        <h5 className={classes.subtitle}>What is the minimum size of the total market you can address?</h5>
                        <p className={classes["description"]}>{props.report.customerSize} {props.report.targetCustomerDescription}</p>
                      </div>
                      <br />
                      
                    </div>
                  </div>
                  <div className={classes["list"]}>
                    <div>
                      <h1 className={classes["list-no"]}>03</h1>
                    </div>
                    <div>
                      <h3 className={classes["title"]}>BUSINESS MODEL</h3>
                      <br />
                      <div>
                        <h5 className={classes.subtitle}>REVENUE</h5>
                        <div>
                          <h5 className={classes.subtitle}>What is your revenue model?</h5>
                          <p className={classes["description"]}>{subscriptionInfo}</p>
                        </div>
                        <br />
                        <div>
                          <h5 className={classes.subtitle}>How many customers will you serve each month?</h5>
                          <p className={classes["description"]}>{props.report.customerSize}</p>
                        </div>
                        <br />
                        {unitPriceInfo}
                        {revenueFromSubscription}
                        {annualRevenueFromOtherSales}
                      </div>
                      <div>
                        <h5 className={classes["subtitle"]}>COSTS</h5>
                        <div>
                          <h5 className={classes.subtitle}>How much does it cost you to acquire a customer?</h5>
                          <p className={classes["description"]}>${props.report.customerAcquisitionCost}</p>
                        </div>
                        <br />
                        {unitCostInfo}
                        <div>
                          <h5 className={classes.subtitle}>How much are your labor costs?</h5>
                          <ul className={classes["description"]}>
                            {employeesInfo}
                          </ul>
                          <p className={classes["description"]}>Your total cost of hiring employees will be <strong>${props.report.employeesCost}</strong></p>
                        </div>
                        <br />
                        <div>
                          <h5 className={classes.subtitle}>How much are your infrastructure and technology costs?</h5>
                          <ul className={classes["description"]}>
                            {infrastructureCostInfo}
                          </ul>
                          <p className={classes["description"]}>Your total cost of infrastructure and technology will be <strong>${props.report.otherExpensesCost}</strong></p>
                        </div>
                        <br />
                        <div>
                          <h5 className={classes.subtitle}>What are your annual total costs?</h5>
                          <p className={classes["description"]}>${props.report.annualCosts}</p>
                        </div>
                      </div>
                      <div>
                        <br />
                        {profitBlock}
                        {lossBlock}
                      </div>
                      <br />
                    </div>
                    
                  </div>
                  <div className={classes["list"]}>
                    <div>
                      <h1 className={classes["list-no"]}>04</h1>
                    </div>
                    <div>
                      <h3 className={classes["title"]}>TEAM</h3>
                      <br />
                      <div>
                        <h5 className={classes.subtitle}>YOUR CAPABILITIES</h5>
                        <p className={classes["description"]}><strong>Based on your responses to founder quiz your skillset includes the following management and startup skills:</strong></p>
                        <p className={classes["description"]}>These are your top skills:</p>
                        <ul className={classes["description"]}>
                            <li>{props.report.startupSkill1}</li>
                            <li>{props.report.startupSkill2}</li>
                        </ul>
                        <p className={classes["description"]}><strong>Based on your responses, it looks like your technical strength lies in the following skills:</strong></p>
                        <p className={classes["description"]}>{props.report.topSkill}</p>
                      </div>
                      <br />
                      <div>
                        <h5 className={classes.subtitle}>TEAM CAPABILITIES</h5>
                        <p className={classes["description"]}>This suggests that based on what this startup needs you may want to consider hiring people who are stronger in the following skills </p>
                        <ul className={classes["description"]}>
                            <li>{props.report.teamMemberSkill1}</li>
                            <li>{props.report.teamMemberSkill2}</li>
                            <li>{props.report.teamMemberSkill3}</li>
                        </ul>
                        <p className={classes["description"]}>In terms of technical skills, you may want to find people who have these skills that are different from you (experimental feature, currently for only tech-focused startups)</p>
                        <ul className={classes["description"]}>
                          {antiSkillsInfo}
                        </ul>
                      </div>
                      <br />
                    </div>
                  </div>
                  <div className={classes["list"]}>
                    <div>
                      <h1 className={classes["list-no"]}>05</h1>
                    </div>
                    <div>
                      <h3 className={classes["title"]}>BOTTOM LINE</h3>
                      <div>
                        <h5 className={classes["subtitle"]}>Based on what you provided, it looks like the following things are what you need to consider:</h5>
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                </div>
              </div>
            </div>
          </div>
</div>
    )   
}


export default ideaDetailSection2;