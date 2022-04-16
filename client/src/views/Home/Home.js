import "./home.scss";
import Posts from "../Posts/Posts";
import Sidebar from "../SideBar/SideBar";
import Header from "../Header/Header";
import { useContext } from "react";
import { UserContext } from "../../App";

const Home = () => {
   const user = useContext(UserContext);

   console.log(user);
   return (
      <>
         <Header />
         <main>
            <div className="container">
               <Posts />
               <Sidebar user={user} />
            </div>
         </main>
      </>
   );
};

export default Home;
