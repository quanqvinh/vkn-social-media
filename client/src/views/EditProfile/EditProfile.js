import "./editProfile.scss";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import React from "react";
import ProfilePreview from "../Profile/ProfilePreview/ProfilePreview";
import { useSelector } from "react-redux";
import { NavLink } from "react-router-dom";
const EditProfile = () => {
   const user = useSelector((state) => state.user);

   return (
      <>
         <Header />
         <div className="edit-profile-container">
            <div className="edit-profile__body">
               <div className="body__left">
                  <ul className="body__left-options">
                     <NavLink
                        exact
                        to="/profile/edit"
                        activeClassName="body__left-options--active"
                     >
                        <li className="body__left-options-edit-profile ">
                           Edit Profile
                        </li>
                     </NavLink>

                     <NavLink
                        to="/profile/edit/password"
                        activeClassName="body__left-options--active"
                     >
                        <li className="body__left-options-change-password">
                           Change Password
                        </li>
                     </NavLink>
                  </ul>
               </div>
               <div className="body__right">
                  <ProfilePreview
                     username={user.username}
                     name="Change Profile Photo"
                     iconSize="medium"
                     captionSize="big"
                  />
                  <form className="right__form">
                     <div className="form__name">
                        <span className="form__name-label">Name</span>
                        <div className="form__name-content">
                           <input type="text" value={user.name || "kien108"} />
                           <span className="form__name-description">
                              Help people discover your account by using the
                              name you're known by: either your full name,
                              nickname, or business name.
                           </span>
                        </div>
                     </div>
                     <div className="form__username">
                        <span className="form__username-label">Username</span>
                        <div className="form__username-content">
                           <input
                              type="text"
                              value={user.username || "kien.letrung.376258"}
                           />
                           <span className="form__name-description">
                              In most cases, you'll be able to change your
                              username back to undefined for another undefined
                              days.
                           </span>
                        </div>
                     </div>
                     <div className="form__bio">
                        <span className="form__bio-label">Bio</span>
                        <div className="form__bio-content">
                           <input
                              type="text"
                              value={user.bio || "Front-end web developer"}
                           />
                           <span className="form__name-description">
                              In most cases, you'll be able to change your
                              username back to undefined for another undefined
                              days.
                           </span>
                        </div>
                     </div>
                     <div className="form__email">
                        <span className="form__email-label">Email</span>
                        <div className="form__email-content">
                           <span className="form__email-description">
                              <span className="form__email-description-title">
                                 Personal Information
                              </span>
                              <span>
                                 Provide your personal information, even if the
                                 account is used for a business, a pet or
                                 something else. This won't be a part of your
                                 public profile.
                              </span>
                           </span>
                           <input
                              type="text"
                              value={user.email || "trungkien2062001@gmail.com"}
                           />
                           <button className="form__email-confirm">
                              Confirm Email
                           </button>
                        </div>
                     </div>
                     <div className="form__dob">
                        <span className="form__dob-label">DoB</span>
                        <input type="text" value={user.dob || "20/06/2001"} />
                     </div>
                     <div className="form__phone">
                        <span className="form__phone-label">Phone Number</span>
                        <input type="text" value={user.gender || "Male"} />
                     </div>
                     <button className="form__submit">Submit</button>
                  </form>
               </div>
            </div>
         </div>
         <Footer />
      </>
   );
};

export default EditProfile;
