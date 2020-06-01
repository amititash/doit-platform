import React, { Component, Suspense } from 'react';
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import Hello from '../views/Hello';
import Home from '../views/Home';
import Team from '../views/Team';
import Research from '../views/Research';
import Profile from '../views/Profile';
import IdeaDetail from '../views/idea_detail2';
import PrivacyPage from '../views/Privacy/Privacy';
import TermsPage from '../views/TermsAndConditions/TermsAndConditions';


import Header from '../components/Header';
import Footer from '../components/Footer';
import { useAuth0 } from "../react-auth0-spa";
import Intermediate from "../views/intermediate";
import HowItWork from "../views/HowItWork";
import Report from "../views/Report";
import Dashboard from '../views/Dashboard';


class Desktop extends Component {
    render() {
        // const { loading } = useAuth0();
        // if (loading) {
        //     return <div>Loading...</div>;
        // }
        return (
            <React.Fragment>
                <Suspense fallback={null}>
                    <Router>
                        <Header />
                        <Switch>
                            <Route path="/" exact component={Home} />
                            <Route path="/intermediate" exact component={Intermediate} />
                            <Route path="/team" component={Team} />
                            <Route path="/how-it-work" component={HowItWork} />
                            <Route path="/research" component={Research} />
                            <Route path="/home" component={Profile} />
                            <Route path="/idea/:id" component={IdeaDetail} />
                            <Route path="/report" component={Report} />
                            <Route path="/admin" component={Dashboard} />
                            <Route path="/privacy" component={PrivacyPage} />
                            <Route path="/termsandconditions" component={TermsPage} />
                            {/* <Route path="/idea2/:id" component={IdeaDetail2} /> */}
                        </Switch>
                        <Footer />
                    </Router>
                </Suspense>        
            </React.Fragment>
        );
    }
}

export default Desktop;
