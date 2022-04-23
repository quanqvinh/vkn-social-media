import React, { useState } from "react";
import "./profilePage.scss";
import avatar from "../../assets/images/profile.jpg";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ModeCommentIcon from "@mui/icons-material/ModeComment";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import PostDetail from "../PostDetail/PostDetail";
import { Link } from "react-router-dom";

const ProfilePage = () => {
   const [isSelectedPost, setIsSelectedPost] = useState(false);
   const closePost = () => {
      setIsSelectedPost(false);
   };
   return (
      <>
         <Header />
         <div className="profile-container">
            <div className="profile__header">
               <div className="header__left">
                  <img src={avatar} alt="avatar" />
               </div>
               <div className="header__right">
                  <div className="right__header">
                     <p className="right__header-username">
                        kien.letrung.376258
                     </p>
                     <Link
                        to="/profile/edit"
                        className="right__header-btn-edit"
                     >
                        Edit Profile
                     </Link>
                  </div>
                  <div className="right__body">
                     <span className="right__body-posts">
                        <span>17</span> posts
                     </span>
                     <span className="right__body-friends">
                        <span>108</span> friends
                     </span>
                  </div>
                  <span className="header__right-name">Kien Letrung</span>
               </div>
            </div>

            <div
               className={`profile__body ${
                  isSelectedPost ? "profile__body--open-post" : ""
               }`}
            >
               <div className="list-posts">
                  {Array(10)
                     .fill(0)
                     .map((v, i) => (
                        <div
                           className="post"
                           key={i}
                           onClick={() => setIsSelectedPost(true)}
                        >
                           <div className="post__img">
                              <img src={avatar} alt="postImage" />
                           </div>
                           <div className="post__overlay">
                              <div className="post__react">
                                 <FavoriteIcon />
                                 <span>14</span>
                              </div>
                              <div className="post__comments">
                                 <ModeCommentIcon />
                                 <span>14</span>
                              </div>
                           </div>
                        </div>
                     ))}
               </div>

               {isSelectedPost && <PostDetail closePost={closePost} />}
            </div>
            <Footer className="profile__footer" />
         </div>
      </>
   );
};

export default ProfilePage;
