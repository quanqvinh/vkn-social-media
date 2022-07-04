import React from 'react';

import { Link, useHistory } from 'react-router-dom';

import './sidebar.css';

import sidebar_items from '../../assets/JsonData/sidebar_routes.json';

import env from 'react-dotenv';

import { useSelector } from 'react-redux';
const SidebarItem = props => {
  const active = props.active ? 'active' : '';

  return (
    <div className="sidebar__item">
      <div className={`sidebar__item-inner ${active}`}>
        <i className={props.icon}></i>
        <span>{props.title}</span>
      </div>
    </div>
  );
};

const Sidebar = props => {
  const history = useHistory();
  const activeItem = sidebar_items.findIndex(item => item.route === props.location.pathname);
  const theme = useSelector(state => state.themeReducer);

  return (
    <div className="sidebar">
      <div className="sidebar__logo">
        <img
          src={
            theme.mode === 'theme-mode-dark'
              ? process.env.REACT_APP_STATIC_URL + `/defaults/logo_light.png`
              : process.env.REACT_APP_STATIC_URL + `/defaults/logo_dark.png`
          }
          alt="company logo"
          onClick={() => history.push('/dashboard')}
        />
      </div>
      {sidebar_items.map((item, index) => (
        <Link to={item.route} key={index}>
          <SidebarItem title={item.display_name} icon={item.icon} active={index === activeItem} />
        </Link>
      ))}
    </div>
  );
};

export default Sidebar;
