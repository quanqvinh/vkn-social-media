import "./posts.scss";
import Post from "./Post/Post";
import { useEffect, useState } from "react";
import { getUserById } from "../../apis/user";
import postApi from "../../apis/postApi";

function Posts() {
   const commentsOne = [
      {
         user: "raffagrassetti",
         text: "Woah dude, this is awesome! 🔥",
         id: 1,
      },
      {
         user: "therealadamsavage",
         text: "Like!",
         id: 2,
      },
      {
         user: "mapvault",
         text: "Niceeeee!",
         id: 3,
      },
   ];

   const [posts, setPosts] = useState([]);

   useEffect(() => {
      const fetchPostList = async () => {
         try {
            // truyền params theo header
            const params = {
               _page: 1,
               _limit: 10,
            };

            const res = await postApi.getAll(params);
            if (res?.length > 0) {
               setPosts(res);
            }
         } catch (error) {
            console.log("failed to fetch post list", error.message);
         }
      };

      fetchPostList();
   }, []);

   const handelGetUserById = (userId) => {
      let user = getUserById(userId);

      if (!user) return;
      return user.username;
   };

   return (
      <div className="cards">
         {posts?.length > 0 &&
            posts.map((post) => (
               <Post
                  key={post.id}
                  // accountName={post.userId}
                  content={post.title}
                  storyBorder={true}
                  image="https://picsum.photos/800/900"
                  comments={commentsOne}
                  likedByText="dadatlacak"
                  likedByNumber={69}
                  hours={16}
               />
            ))}
      </div>
   );
}

export default Posts;
