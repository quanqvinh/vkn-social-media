import React from "react";
import { NavLink, useParams } from "react-router-dom";

const LeftNav = ({ handelSetChildForm }) => {
   const { id } = useParams();
   return (
      <ul className="body__left-options">
         <NavLink
            exact
            to={`/profile/${id}/edit`}
            activeClassName="body__left-options--active"
         >
            <li className="body__left-options-edit-profile ">Edit Profile</li>
         </NavLink>

         <NavLink
            to={`/profile/${id}/edit/password`}
            activeClassName="body__left-options--active"
         >
            <li className="body__left-options-change-password">
               Change Password
            </li>
         </NavLink>
         <NavLink
            to={`/profile/${id}/edit/email`}
            activeClassName="body__left-options--active"
         >
            <li className="body__left-options-change-email">Change Email</li>
         </NavLink>
      </ul>
   );
};

export default LeftNav;
