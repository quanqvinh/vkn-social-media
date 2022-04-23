import "./postDetail.scss";
import React from "react";
import avatar from "../../assets/images/profile.jpg";
import ProfilePreview from "../Profile/ProfilePreview/ProfilePreview";
import { useSelector } from "react-redux";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import Comment from "./Comment/Comment";
import PostMenu from "../Posts/Post/PostMenu";

const PostDetail = (props) => {
   const user = useSelector((state) => state.user);
   const { closePost } = props;

   const handelClosePost = (e) => {
      if (!e.target.classList.contains("post__overlay")) return;
      closePost();
   };
   return (
      <>
         <div className="post__overlay" onClick={handelClosePost}>
            <div className="post-detail__container">
               <div className="post__left">
                  <img src={avatar} alt="postImgs" />
               </div>
               <div className="post__right">
                  <div className="right__header">
                     <ProfilePreview
                        username={user.username}
                        iconSize="medium"
                        image={avatar}
                     />
                     <MoreHorizIcon className="right__header-options" />
                  </div>
                  <div className="right__body">
                     <div className="right__body-list-messages">
                        {Array(3)
                           .fill(0)
                           .map((v, i) => (
                              <div className="message" key={i}>
                                 <Comment user={user} />

                                 <div className="message-list-reply">
                                    <Comment
                                       user={user}
                                       hideSubComments={true}
                                    />
                                 </div>
                              </div>
                           ))}
                     </div>
                  </div>
                  <div className="right__footer">
                     <div className="footer__header">
                        <PostMenu />
                        <div className="footer__title">
                           <p>
                              Liked by <span>trungkien</span> and{" "}
                              <span>19 others</span>
                           </p>
                           <p className="footer__title-time">JUNE 5, 2019</p>
                        </div>
                     </div>
                     <div className="footer__input">
                        <input type="text" placeholder="Add a comment..." />
                        <span className="footer__input-post">Post</span>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </>
   );
};

export default PostDetail;
