import "./post.scss";
import ProfilePreview from "../../Profile/ProfilePreview/ProfilePreview";
import { ReactComponent as PostButton } from "../../../assets/images/cardButton.svg";
import PostMenu from "./PostMenu";
import Comment from "./Comment";
import Slider from "react-slick";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { useEffect, useState, useRef, useCallback } from "react";
import PostDetail from "../../PostDetail/PostDetail";

function Post(props) {
   const {
      handelLike,
      post,
      avatar,
      id,
      storyBorder,
      imgs,
      comments,
      likedByNumber,
      hours,
      accountName,
      content,
   } = props;

   const [like, setLike] = useState(likedByNumber);
   const [isShowPost, setIsShowPost] = useState(false);
   const [isCmt, setIsCmt] = useState(false);
   const [comment, setComment] = useState("");

   const SlickArrowLeft = ({ currentSlide, slideCount, ...props }) => (
      <button
         {...props}
         className={
            "slick-prev slick-arrow" +
            (currentSlide === 0 ? " slick-disabled" : "")
         }
         aria-hidden="true"
         aria-disabled={currentSlide === 0 ? true : false}
         type="button"
      >
         <ArrowBackIosNewIcon sx={{ fontSize: 40 }} />
      </button>
   );
   const SlickArrowRight = ({ currentSlide, slideCount, ...props }) => (
      <button
         {...props}
         className={
            "slick-next slick-arrow" +
            (currentSlide === slideCount - 1 ? " slick-disabled" : "")
         }
         aria-hidden="true"
         aria-disabled={currentSlide === slideCount - 1 ? true : false}
         type="button"
      >
         <ArrowForwardIosIcon sx={{ fontSize: 40 }} />
      </button>
   );

   const settings = {
      dots: true,
      infinite: true,
      speed: 300,
      slidesToShow: 1,
      slidesToScroll: 1,
      nextArrow: <SlickArrowRight />,
      prevArrow: <SlickArrowLeft />,
   };

   const handelViewPostDetail = () => {
      setIsShowPost(!isShowPost);
   };

   const handelLikePost = useCallback((like) => {
      setLike(like);
   }, []);

   return (
      <div className="card">
         <header>
            <ProfilePreview
               image={avatar}
               iconSize="medium"
               storyBorder={storyBorder}
               username={post.username}
            />
            <PostButton className="cardButton" />
         </header>
         <Slider {...settings} className="post__body-img cardImage">
            {imgs?.length > 0 &&
               imgs.map((img) => (
                  <img
                     style={{ height: 600 }}
                     onClick={handelViewPostDetail}
                     key={img}
                     src={
                        process.env.REACT_APP_STATIC_URL + `/posts/${id}/${img}`
                     }
                     alt="postImg"
                  />
               ))}
         </Slider>
         <PostMenu
            postId={post._id}
            handelLikePost={handelLikePost}
            like={like}
         />
         <div className="likedBy">
            <span>
               {like} {like > 1 ? "likes" : "like"}
            </span>
         </div>
         <div className="post__author">
            <span className="post__author-username">{accountName}</span>
            <span className="post__author-content">{content}</span>
         </div>
         <div className="timePosted">{hours} hours ago</div>
         {isShowPost && (
            <PostDetail post={post} closePost={handelViewPostDetail} />
         )}
      </div>
   );
}

export default Post;
