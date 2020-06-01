import React from 'react'
import { Link } from "react-router-dom";

const Home = () => {

  return (
      <main className="main-section">
          <section className="first-section">
              <div className="container">
                  <div className="row">
                      <div className="col-md-7 col-left">
                          <h1>Helping you startup smarter!</h1>
                          <p>StartIQ is a digital co-founder for early-stage entrepreneurs.</p>
                          <p>It is perfect for entrepreneurship classes, university startup labs, co-working spaces and incubators aiming to provide scalable advice to members.</p>
                          <p>Best of all, it's free</p>
                          <Link to={`/`} className="orange-btn">Reserve Your Spot</Link>
                      </div>
                      <div className="col-md-5 col-right">
                          <div className="hero-image" style={{
                              backgroundImage: "url(" + "/img/slack.webp" + ")",
                              backgroundPosition: 'center',
                              backgroundSize: 'cover',
                              backgroundRepeat: 'no-repeat'
                          }}></div>
                          <p>We leverage conversational AI from within <span>slack</span> to help startup founders launch better ventures via data-driven advice and support.</p>
                      </div>
                  </div>
              </div>
          </section>
          <section className="second-section">
              <div className="container">
                  <div className="row">
                      <div className="col-md-3">
                          <div className="s-inner-blk">
                              <img src="/img/img1.svg" width="220" />
                              <h3>Research<br/> Competitors</h3>
                          </div>
                      </div>
                      <div className="col-md-3">
                          <div className="s-inner-blk">
                              <img src="/img/img2.svg" width="200" />
                              <h3>Track relevant<br/> media</h3>
                          </div>
                      </div>
                      <div className="col-md-3">
                          <div className="s-inner-blk">
                              <img src="/img/img3.svg" width="200" />
                              <h3>Founder<br/> Diagnostics</h3>
                          </div>
                      </div>
                      <div className="col-md-3">
                          <div className="s-inner-blk">
                              <img src="/img/img4.svg" width="200" />
                              <h3>Get<br/> Funded</h3>
                          </div>
                      </div>
                  </div>
                  <div className="row">
                      <div className="col-md-12">
                          <p>Founders can use StartIQ through <span>slack</span> and immediately test, improve, and get support for their business ideas.</p>
                      </div>
                  </div>
              </div>
          </section>
          <section className="third-section" id="how-it-work">
              <div className="container">
                  <div className="row">
                      <div className="col-md-12">
                          <h2>How Founders Use startIQ</h2>
                      </div>
                  </div>
                  <div className="row">
                      <div className="col-md-6">
                          <img src="/img/img5.svg" />
                      </div>
                      <div className="col-md-6">
                          <p>StartIQ is easy to use! Just add the app to your Slack instance and dm <span>@startiq-bot</span>. StartIQ will guide you through all the steps of developing your startup idea.</p>
                      </div>
                  </div>
              </div>
          </section>
      </main>
  )
}

export default Home