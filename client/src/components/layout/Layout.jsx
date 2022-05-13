import React from 'react';

import '../../assets/styles/index.css';
import './layout.css';
import Sidebar from '../sidebar/Sidebar';
import TopNav from '../topnav/TopNav';
import Routes from '../Routes';

import { BrowserRouter as Router, Route } from 'react-router-dom';

import { useSelector } from 'react-redux';

const Layout = () => {
  const themeReducer = useSelector(state => state.themeReducer);

  return (
    <Router>
      <Route
        render={props => (
          <div className={`layout ${themeReducer.mode} ${themeReducer.color}`}>
            <Sidebar {...props} />
            <div className="layout__content">
              <TopNav />
              <div className="layout__content-main">
                <Routes />
              </div>
            </div>
          </div>
        )}
      />
    </Router>
  );
};

export default Layout;
