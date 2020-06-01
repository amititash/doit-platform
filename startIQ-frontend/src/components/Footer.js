import React, { Component, Suspense } from 'react';



class Footer extends Component {

    render() {
        let footerSection = <div className="container">
            <div className="row">
                <div className="col-md-12">
                    <h2>Reserve your spot in line for early access to StartIQ</h2>
                    <form>
                        <input type="email" placeholder="Enter your email here*" />
                        <button className="submit-btn orange-btn">Reserve your spot</button>
                    </form>
                    <ul className="list-inline">
                        <li>
                            <a href="#">
                                <img src="img/youtube.svg" />
                            </a>
                        </li>
                        <li>
                            <a href="#">
                                <img src="img/instagram.svg" />
                            </a>
                        </li>
                        <li>
                            <a href="#">
                                <img src="img/facebook.svg" />
                            </a>
                        </li>
                    </ul>
                </div>
            </div>
        </div>

        // let user = localStorage.getItem('startiq_user');
        // if(user){
        //     footerSection = ''
        // }

        return (
            <React.Fragment>
                <Suspense fallback={null}>
                    <footer>
                        {footerSection}
                        <div className="container-fluid">
                            <div className="row row-3">
                                <div className="col-md-12">
                                    <p>©2020 by StartIQ, Inc.</p>
                                </div>
                            </div>
                        </div>
                    </footer>
                </Suspense>
            </React.Fragment>
        );
    }
}

export default Footer;
