import React from 'react';
import './topnav.css';
import avatarDefault from '../../assets/images/avatar_default.png';
import { Link } from 'react-router-dom';
import Dropdown from '../dropdown/Dropdown';
import ThemeMenu from '../thememenu/ThemeMenu';
import notifications from '../../assets/JsonData/notification.json';
import user_menu from '../../assets/JsonData/user_menus.json';
import { useSelector } from 'react-redux';

const Topnav = () => {
  const user = useSelector(state => state.user);

  const renderNotificationItem = (item, index) => (
    <div className="notification-item" key={index}>
      <i className={item.icon}></i>
      <span>{item.content}</span>
    </div>
  );

  const renderUserToggle = user => (
    <div className="topnav__right-user">
      <div className="topnav__right-user__image">
        <img
          onError={setDefault}
          src={process.env.REACT_APP_STATIC_URL + `/avatars/${user._id}.png`}
          alt=""
        />
      </div>
      <div className="topnav__right-user__name">{user.username}</div>
    </div>
  );

  const renderUserMenu = (item, index) => (
    <Link to="/" key={index}>
      <div className="notification-item">
        <i className={item.icon}></i>
        <span>{item.content}</span>
      </div>
    </Link>
  );

  const setDefault = e => {
    console.clear();
    e.target.onerror = null;
    e.target.src = avatarDefault;
  };
  return (
    <div className="topnav">
      <div className="topnav__search">
        <input type="text" placeholder="Search here..." />
        <i className="bx bx-search"></i>
      </div>
      <div className="topnav__right">
        <div className="topnav__right-item">
          <Dropdown
            customToggle={() => renderUserToggle(user)}
            contentData={user_menu}
            renderItems={(item, index) => renderUserMenu(item, index)}
          />
        </div>
        <div className="topnav__right-item">
          <Dropdown
            icon="bx bx-bell"
            badge="12"
            contentData={notifications}
            renderItems={(item, index) => renderNotificationItem(item, index)}
            renderFooter={() => <Link to="/">View All</Link>}
          />
          {/* dropdown here */}
        </div>
        <div className="topnav__right-item">
          <ThemeMenu />
        </div>
      </div>
    </div>
  );
};

export default Topnav;
