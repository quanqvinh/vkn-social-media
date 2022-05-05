import "./posts.scss";
import Post from "./Post/Post";
import { useContext, useEffect, useState } from "react";
import postApi from "../../apis/postApi";
import { UserContext } from "../../App";
import { useSelector } from "react-redux";

function Posts(props) {
   const [firstRender, setFirstRender] = useState(true);
   const user = useSelector((state) => state.user);
   const [posts, setPosts] = useState([]);
   const [post, setPost] = useState(null);
   const [listImg, setListImg] = useState([]);

   useEffect(() => {
      const fetchPost = async () => {
         try {
            if (isEmpty(user)) {
               return;
            }
            const res = await postApi.get(user.posts[0]);
            res?.status === "success" && setPost(res.data);
         } catch (error) {
            console.log(error.message);
         }
      };
      fetchPost();
   }, [user]);

   function isEmpty(obj) {
      for (var key in obj) {
         if (obj.hasOwnProperty(key)) return false;
      }
      return true;
   }

   return (
      <div className="cards">
         {!isEmpty(user) && !isEmpty(post) && (
            <>
               <Post
                  key={post.id}
                  accountName={post.user.username}
                  content={post.caption}
                  storyBorder={true}
                  image="https://picsum.photos/800/900"
                  comments={post.comments}
                  likedByText="dadatlacak"
                  likedByNumber={post.numberOfLikes}
                  hours={16}
               />
               <Post
                  key={post.id}
                  accountName={post.user.username}
                  content={post.caption}
                  storyBorder={true}
                  image="https://picsum.photos/800/900"
                  comments={post.comments}
                  likedByText="dadatlacak"
                  likedByNumber={post.numberOfLikes}
                  hours={16}
               />
               <Post
                  key={post.id}
                  accountName={post.user.username}
                  content={post.caption}
                  storyBorder={true}
                  image="https://picsum.photos/800/900"
                  comments={post.comments}
                  likedByText="dadatlacak"
                  likedByNumber={post.numberOfLikes}
                  hours={16}
               />
            </>
         )}
      </div>
      // <div className="cards">
      //    {" "}
      //    {posts?.length > 0 &&
      //       posts.map((post) => (
      //          <Post
      //             key={post.id}
      //             // accountName={post.userId}
      //             content={post.title}
      //             storyBorder={true}
      //             image="https://picsum.photos/800/900"
      //             comments={commentsOne}
      //             likedByText="dadatlacak"
      //             likedByNumber={69}
      //             hours={16}
      //          />
      //       ))}{" "}
      // </div>
   );
}

export default Posts;
