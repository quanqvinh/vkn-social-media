import "./posts.scss";
import Post from "./Post/Post";
import { useContext, useEffect, useState } from "react";
import postApi from "../../apis/postApi";
import { UserContext } from "../../App";
import { useSelector } from "react-redux";

function Posts(props) {
   const user = useSelector((state) => state.user);
   const [posts, setPosts] = useState([]);
   const [listImg, setListImg] = useState([]);

   useEffect(() => {
      const fetchPost = async () => {
         try {
            const res = await postApi.newFeeds();
            res?.status === "success" && setPosts([...res.posts]);
         } catch (error) {
            console.log(error.message);
         }
      };
      fetchPost();
   }, []);

   function isEmpty(obj) {
      for (var key in obj) {
         if (obj.hasOwnProperty(key)) return false;
      }
      return true;
   }
   return (
      <div className="cards">
         {!isEmpty(user) &&
            !isEmpty(posts) &&
            posts?.length > 0 &&
            posts.map((post) => (
               <Post
                  key={post._id}
                  accountName={post.username}
                  content={post.caption}
                  storyBorder={true}
                  id={post._id}
                  imgs={post.imgs}
                  comments={post.comments}
                  likedByText="dadatlacak"
                  likedByNumber={post.numberOfLikes}
                  hours={post.createdAt}
               />
            ))}
      </div>
   );
}

export default Posts;
