import "./nav.scss";
import { ReactComponent as Home } from "../../../assets/images/home.svg";
import { ReactComponent as Inbox } from "../../../assets/images/inbox.svg";
import { ReactComponent as Notifications } from "../../../assets/images/notifications.svg";
import ProfileIcon from "../../Profile/ProfilePreview/ProfileIcon";
import image from "../../../assets/images/profile.jpg";
import { useState } from "react";
import { Link } from "react-router-dom";

function Nav() {
   const [isDropDown, setIsDropDown] = useState(false);

   return (
      <div className="menu">
         <Home className="icon" />
         <Inbox className="icon" />
         <Notifications className="icon" />

         <div className="profile" onClick={() => setIsDropDown(!isDropDown)}>
            <ProfileIcon iconSize="small" image={image} />
         </div>

         <div
            className={`profile__option ${
               isDropDown ? "profile__option--active" : ""
            }`}
         >
            <div className="arrow"></div>
            <ul className="dropdown">
               <li>
                  <svg
                     aria-label="Profile"
                     class="_8-yf5 "
                     color="#262626"
                     fill="#262626"
                     height="16"
                     role="img"
                     viewBox="0 0 24 24"
                     width="16"
                  >
                     <circle
                        cx="12.004"
                        cy="12.004"
                        fill="none"
                        r="10.5"
                        stroke="currentColor"
                        stroke-linecap="round"
                        stroke-miterlimit="10"
                        stroke-width="2"
                     ></circle>
                     <path
                        d="M18.793 20.014a6.08 6.08 0 00-1.778-2.447 3.991 3.991 0 00-2.386-.791H9.38a3.994 3.994 0 00-2.386.791 6.09 6.09 0 00-1.779 2.447"
                        fill="none"
                        stroke="currentColor"
                        stroke-linecap="round"
                        stroke-miterlimit="10"
                        stroke-width="2"
                     ></path>
                     <circle
                        cx="12.006"
                        cy="9.718"
                        fill="none"
                        r="4.109"
                        stroke="currentColor"
                        stroke-linecap="round"
                        stroke-miterlimit="10"
                        stroke-width="2"
                     ></circle>
                  </svg>

                  <span>Profile</span>
               </li>
               <li>
                  <Link to="/login" className="login">
                     Log Out
                  </Link>
               </li>
            </ul>
         </div>
      </div>
   );
}

export default Nav;
