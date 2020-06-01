import React from 'react'
import { Link } from "react-router-dom";

const Team = () => {

  return (
      <main className="main-section">
          <section className="t-section">
              <div className="container">
                  <div className="row">
                      <div className="col-md-12">
                          <h1>Meet The Team</h1>
                      </div>
                  </div>
                  <div className="row row-2">
                      <div className="col-md-4 col-lg-3">
                          <div className="t-blk">
                              <div className="p-pic" style={{
                                  backgroundImage: "url(" + "img/team/ronnie.webp" + ")",
                                  backgroundPosition: 'center',
                                  backgroundSize: 'cover',
                                  backgroundRepeat: 'no-repeat'
                              }}></div>
                              <h3>Aaron<br/> Chatterji</h3>
                              <a href="https://www.linkedin.com/in/aaron-chatterji-458272/" target="_blank"><img src="img/linkedin.webp" width="50" /> </a>
                              <p>Ronnie is a strategy professor at Duke who studies entrepreneurship. He served as Senior Economist on the White House Council of Economic Advisors focusing on entrepreneurship. He has a Ph.D. from UC Berkeley and a degree in Economics from Cornell.</p>
                          </div>
                      </div>
                      <div className="col-md-4 col-lg-3">
                          <div className="t-blk">
                              <div className="p-pic" style={{
                                  backgroundImage: "url(" + "img/team/sharique.webp" + ")",
                                  backgroundPosition: 'center',
                                  backgroundSize: 'cover',
                                  backgroundRepeat: 'no-repeat'
                              }}></div>
                              <h3>Sharique<br/>
                                  Hasan</h3>
                              <a href="https://www.linkedin.com/company/wix-com" target="_blank"><img src="img/linkedin.webp" width="50" /> </a>
                              <p>Sharique is a strategy professor at Duke who studies entrepreneurship and innovation with a focus on tech ventures and developing countries. He was previously a professor at Stanford GSB and has a Ph.D. from Carnegie Mellon and a degree in Computer Science from Rutgers.</p>
                          </div>
                      </div>
                      <div className="col-md-4 col-lg-3">
                          <div className="t-blk">
                              <div className="p-pic" style={{
                                  backgroundImage: "url(" + "img/team/steve.webp" + ")",
                                  backgroundPosition: 'center',
                                  backgroundSize: 'cover',
                                  backgroundRepeat: 'no-repeat'
                              }}></div>
                              <h3>Steven<br/> McClelland</h3>
                              <a href="https://www.linkedin.com/company/wix-com" target="_blank"><img src="img/linkedin.webp" width="50" /> </a>
                              <p>Steve is an Executive in Residence at Duke University. He was previously Director of Product Management at Twitter, Head of Social and Personalization Products at Yahoo!, VP of User Experience at Citizen Sports (Acquired by Yahoo). He has a bachelors in Biomedical and Electrical Engineering from Duke. </p>
                          </div>
                      </div>
                      <div className="col-md-4 col-lg-3">
                          <div className="t-blk">
                              <div className="p-pic" style={{
                                  backgroundImage: "url(" + "img/team/titash.webp" + ")",
                                  backgroundPosition: 'center',
                                  backgroundSize: 'cover',
                                  backgroundRepeat: 'no-repeat'
                              }}></div>
                              <h3>Titash<br/>
                                  Neogi</h3>
                              <a href="https://www.linkedin.com/company/wix-com" target="_blank"><img src="img/linkedin.webp" width="50" /> </a>
                              <p>Titash has been building consumer internet products for over a decade. He was previously chief architect at Kontiki labs, founding CTO of FactorDaily, funded by Accel Ventures. Titash was also the founder and CPO of Themeefy which was sold to ChromaUp in 2015. He has a master's in IT from ICFAI and a degree in information systems from MDSU. </p>
                          </div>
                      </div>
                  </div>
              </div>
          </section>
      </main>
  )
}

export default Team