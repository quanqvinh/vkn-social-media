import "./post.scss";
import ProfilePreview from "../../Profile/ProfilePreview/ProfilePreview";
import { ReactComponent as PostButton } from "../../../assets/images/cardButton.svg";
import PostMenu from "./PostMenu";
import Comment from "./Comment";

import { useState } from "react";

function Post(props) {
   const {
      storyBorder,
      image,
      comments,
      likedByNumber,
      hours,
      accountName,
      content,
   } = props;

   const [isShowCmt, setIsShowCmt] = useState(false);
   const [isCmt, setIsCmt] = useState(false);
   const [comment, setComment] = useState("");

   const handelShowCmts = () => {
      setIsShowCmt(!isShowCmt);
   };

   const handelCmt = (e) => {
      setComment(e.target.value);
      setIsCmt(true);
   };

   return (
      <div className="card">
         <header>
            <ProfilePreview
               iconSize="medium"
               storyBorder={storyBorder}
               username={accountName}
            />
            <PostButton className="cardButton" />
         </header>
         <img className="cardImage" src={image} alt="card content" />
         <PostMenu />
         <div className="likedBy">
            <span>
               {likedByNumber} {likedByNumber > 1 ? "likes" : "like"}
            </span>
         </div>
         <div className="post__author">
            {/* <span className="post__author-username">{accountName}</span> */}
            <span className="post__author-username">kien108</span>
            <span className="post__author-content">{content}</span>
         </div>
         <span className="view__comments" onClick={handelShowCmts}>
            {comments?.length > 0 ? `View all ${comments.length} comments` : ""}
         </span>
         {isShowCmt && (
            <div className="comments">
               {comments.map((comment) => {
                  return (
                     <Comment
                        key={comment.id}
                        accountName={comment.user}
                        comment={comment.text}
                     />
                  );
               })}
            </div>
         )}

         <div className="timePosted">{hours} HOURS AGO</div>
         <div className="addComment">
            <textarea
               onChange={(e) => handelCmt(e)}
               value={comment}
               className="commentText"
               aria-label="Add a comment…"
               placeholder="Add a comment…"
               autoComplete="off"
               autoCorrect="off"
            ></textarea>
            <div
               className={`postText ${
                  isCmt && comment ? "postText--active" : ""
               }`}
            >
               Post
            </div>
         </div>
      </div>
   );
}

export default Post;
