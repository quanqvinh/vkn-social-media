import React from "react";
import { NavLink, useHistory } from "react-router-dom";

const LeftNav = ({ handelSetChildForm }) => {
   const history = useHistory();

   return (
      <ul className="body__left-options">
         <NavLink
            exact
            to="/profile/edit"
            activeClassName="body__left-options--active"
         >
            <li className="body__left-options-edit-profile ">Edit Profile</li>
         </NavLink>

         <NavLink
            to="/profile/edit/password"
            activeClassName="body__left-options--active"
         >
            <li className="body__left-options-change-password">
               Change Password
            </li>
         </NavLink>
         <NavLink
            to="/profile/edit/email"
            activeClassName="body__left-options--active"
         >
            <li className="body__left-options-change-email">Change Email</li>
         </NavLink>
      </ul>
   );
};

export default LeftNav;
