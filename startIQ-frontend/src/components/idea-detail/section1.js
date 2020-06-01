import React from 'react';
import classes from './section1.module.css';


const ideaDetailSection1 = (props) => {
    return (
        <div className={classes["body-class"]}>
            <div className= {classes.page}>
                <div className={classes["page-content"]}>
                    <div className={classes["head-box"]}>
                        DEEPDIVE ANALYSIS OF YOUR IDEA
                    </div>
                    <div className={classes["main-content"]}>
                        <div className={classes["content"]}>
                            <div className={classes["content2"]}>
                                {/* <h1 className={classes.title}>Social <br /> Media <br /> Analytics</h1> */}
                                <h1 style={{fontSize : '20px'}}className={classes.title}>{props.report.idea_name}</h1>
                                {/* <p className={classes.date}>MARCH 2020</p> */}
                            </div>
                            <div className={classes["sub-content"]}>
                                <div>
                                    <b>
                                        <p>PREPARED BY</p>
                                    </b>
                                    <p className={classes.value}>QUINN</p>
                                    {/* <p className={classes.value}>Digital Marketing Strategist</p> */}
                                </div>
                                <br /><br />
                                <div>
                                    <b>
                                        <p>IDEA SUBMITTED BY</p>
                                    </b>
                                    <p className={classes.value}>{props.report && (props.report.user_name || props.report.idea_owner) }</p>
                                    {/* <p className={classes.value}>Digital Marketing Strategist</p> */}
                                </div>
                            </div>  
                        </div>
                    </div>
                </div>
            </div>
           



        </div>
        
    )
}


export default ideaDetailSection1;