import "./posts.scss";
import Post from "./Post/Post";
import { useEffect, useState } from "react";
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

   // useEffect(() => {
   //    const fetchPostList = async () => {
   //       try {
   //          const post = {
   //             name: "kien",
   //             email: "aihi",
   //          };
   //          // truyền params theo header
   //          const params = {
   //             _page: 1,
   //             _limit: 10,
   //             array: post,
   //          };

   //          const res = await postApi.getAll(params);
   //          if (res?.length > 0) {
   //             setPosts(res);
   //          }
   //       } catch (error) {
   //          console.log("failed to fetch post list", error.message);
   //       }
   //    };

   //    fetchPostList();
   // }, []);

   return (
      <div className="cards">
         {" "}
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
            ))}{" "}
      </div>
   );
}

export default Posts;
