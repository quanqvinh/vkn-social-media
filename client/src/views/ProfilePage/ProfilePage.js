import React, { useCallback, useEffect, useState } from "react";
import "./profilePage.scss";
import avatar from "../../assets/images/profile.jpg";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ModeCommentIcon from "@mui/icons-material/ModeComment";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import PostDetail from "../PostDetail/PostDetail";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

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
