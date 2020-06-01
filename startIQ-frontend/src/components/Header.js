import React, { Component, Suspense } from 'react';
import { NavLink } from "react-router-dom";
import Home from "../views/Home";
import Hello from "../views/Hello";
import { useAuth0 } from "../react-auth0-spa";
import $ from 'jquery';


const Header = () => {
    const { isAuthenticated, loginWithRedirect, logout } = useAuth0();
    let user = localStorage.getItem('startiq_user');
    let auth = <a href="javascript:void(0)" onClick={() => loginWithRedirect({})}>Log in</a>;
    let navLogo = <h2><NavLink exact to={`/`}>startIQ</NavLink></h2> ;
    let navLinks = <ul className="list-inline nav-links">
        <li>
            <NavLink exact to={`/`}>Home</NavLink>
        </li>
        <li>
            <NavLink exact to={`/research`}>The Science</NavLink>
        </li>
        <li>
            <NavLink exact to={`/team`}>Team</NavLink>
        </li>
        <li>
            <NavLink exact to={`/how-it-work`}>How It Works</NavLink>
        </li>
        <li>
            <NavLink exact to={`/contact`}>Contact</NavLink>
        </li>
        <li className="auth-blk">
            {auth}
        </li>
    </ul>
    if(user){
        navLinks = <ul className="list-inline nav-links">
                <li className="auth-blk">
                    <a href="javascript:void(0)" onClick={() => logout()}>Log out</a>
                </li>
            </ul>
        navLogo = <h2><NavLink exact to={`/home`}>startIQ</NavLink></h2> ;
    }
    $('.menu-open').click(function () {
        $('.sidebar').fadeIn();
    });
    $('.menu-close').click(function () {
        $('.sidebar').fadeOut();
    });
    if($(window).width() < 1000){
        $('.sidebar ul li a').click(function () {
            $('.sidebar').fadeOut();
        });
    }


    return (
        <React.Fragment>
            <Suspense fallback={null}>
                <header className="header">
                    <div className="container">
                        <div className="row">
                            <div className="col-md-4">
                                {navLogo}
                            </div>
                            <div className="col-md-8 text-right">
                                <a href="javascript:void(0)" className="menu-open"><img src="img/menu.svg" width="40" /></a>
                                <div className="sidebar">
                                    <a href="javascript:void(0)" className="menu-close"><img src="img/close.svg" width="30" /></a>
                                    {navLinks}
                                </div>
                            </div>
                        </div>
                    </div>
                </header>
            </Suspense>
        </React.Fragment>
    );
}

export default Header;
