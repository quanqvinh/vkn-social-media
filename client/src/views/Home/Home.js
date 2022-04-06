import "./home.scss";
import Posts from "../Posts/Posts";
import Sidebar from "../SideBar/SideBar";
import Header from "../Header/Header";
import { useSelector } from "react-redux";

const Home = () => {
   const user = useSelector((state) => state.user);
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
