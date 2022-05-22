import React, { useState } from 'react';

import '../../assets/styles/index.css';
import './layout.css';
import Sidebar from '../sidebar/Sidebar';
import TopNav from '../topnav/TopNav';
import Routes from '../Routes';

import { BrowserRouter as Router, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { userApiAdmin } from '../../apis/userApiAdmin';
const Layout = () => {
  const themeReducer = useSelector(state => state.themeReducer);
  const history = useHistory();
  const [checkAdmin, setCheckAdmin] = useState(false);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        await userApiAdmin.analytics();
        setCheckAdmin(true);
      } catch (error) {
        history.push('/');
        window.location.reload();
      }
    };
    fetchAnalytics();
  }, []);

  return (
    <Router>
      <Route
        render={props => (
          <div className={`layout ${themeReducer.mode} ${themeReducer.color}`}>
            {checkAdmin && (
              <>
                <Sidebar {...props} />
                <div className="layout__content">
                  <TopNav />
                  <div className="layout__content-main">
                    <Routes />
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      />
    </Router>
  );
};

export default Layout;
