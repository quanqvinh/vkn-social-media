import React, { useCallback, useEffect, useState } from "react";
import "./profilePage.scss";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ModeCommentIcon from "@mui/icons-material/ModeComment";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import PostDetail from "../PostDetail/PostDetail";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import userApi from "../../apis/userApi";
import avatarDefault from "../../assets/images/avatar_default.png";

const $ = document.querySelector.bind(document);

const ProfilePage = () => {
   const [postSelected, setPostSelected] = useState({
      isSelected: false,
      post: null,
   });
   const [posts, setPosts] = useState([]);

   const closePost = useCallback(() => {
      setPostSelected({ isSelected: false, post: null });
   }, [postSelected]);

   const user = useSelector((state) => state.user);

   useEffect(() => {
      setPosts([...user.posts]);
   }, []);

   const openModal = () => {
      const overlay = $(".overlay");
      const modal = $(".modal");
      modal.classList.add("modal--open");
      overlay.classList.add("overlay--open");
   };

   const closeModal = () => {
      const overlay = $(".overlay");
      const modal = $(".modal");
      modal.classList.remove("modal--open");
      overlay.classList.remove("overlay--open");
   };

   const handelChangeAvatar = (e) => {
      const fileAvatar = e.target.files[0];
      console.log(fileAvatar);
      const formData = new FormData();
      formData.append("avatar", fileAvatar);

      const changeImg = async () => {
         try {
            let res = await userApi.changeAvatar(formData);
            window.location.reload();
         } catch (error) {
            console.log(error.message);
         }
      };
      changeImg();

      const overlay = $(".overlay");
      const modal = $(".modal");
      modal.classList.remove("modal--open");
      overlay.classList.remove("overlay--open");
   };

   const defaltAvatar = (e) => {
      console.log(avatarDefault);
      e.target.src = avatarDefault;
   };
   return (
      <>
         <Header />
         <div className="overlay" onClick={closeModal}></div>
         <div className="modal">
            <p className="modal__title">Change Profile Photo</p>
            <input
               type="file"
               name=""
               id="input-file-avatar"
               hidden
               onChange={(e) => handelChangeAvatar(e)}
            />
            <label htmlFor="input-file-avatar" className="modal__upload">
               Upload Photo
            </label>
            <p className="modal__cancel" onClick={closeModal}>
               Cancel
            </p>
         </div>
         <div className="profile-container">
            <div className="profile__header">
               <div className="header__left">
                  <img
                     onError={(e) => defaltAvatar(e)}
                     src={
                        process.env.REACT_APP_STATIC_URL +
                        `/avatars/${user._id}.png`
                     }
                     alt="avatar"
                     onClick={openModal}
                  />
               </div>
               <div className="header__right">
                  <div className="right__header">
                     <p className="right__header-username">{user.username}</p>
                     <Link
                        to="/profile/edit"
                        className="right__header-btn-edit"
                     >
                        Edit Profile
                     </Link>
                  </div>
                  <div className="right__body">
                     <span className="right__body-posts">
                        <span>{user.posts.length}</span> posts
                     </span>
                     <span className="right__body-friends">
                        <span>{user.friends.length}</span> friends
                     </span>
                  </div>
                  <span className="header__right-name">{user.name}</span>
               </div>
            </div>

            <div
               className={`profile__body ${
                  postSelected.isSelected ? "profile__body--open-post" : ""
               }`}
            >
               <div className="list-posts">
                  {posts?.length &&
                     posts.map((post) => (
                        <div
                           className="post"
                           key={post._id}
                           onClick={() =>
                              setPostSelected({ isSelected: true, post })
                           }
                        >
                           <div className="post__img">
                              <img
                                 src={
                                    process.env.REACT_APP_STATIC_URL +
                                    `/posts/${post._id}/${post.imgs[0]}`
                                 }
                                 alt="postImage"
                              />
                           </div>
                           <div className="post__overlay">
                              <div className="post__react">
                                 <FavoriteIcon />
                                 <span>{post.likes.length}</span>
                              </div>
                              <div className="post__comments">
                                 <ModeCommentIcon />
                                 <span>{post.comments.length}</span>
                              </div>
                           </div>
                        </div>
                     ))}
               </div>

               {postSelected.isSelected && (
                  <PostDetail post={postSelected.post} closePost={closePost} />
               )}
            </div>
            <Footer className="profile__footer" />
         </div>
      </>
   );
};

export default ProfilePage;
