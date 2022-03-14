import "./home.scss";
import Posts from "../Posts/Posts";
import Sidebar from "../SideBar/SideBar";
import Header from "../Header/Header";

const Home = () => {
   return (
      <>
         <Header />
         <main>
            <div className="container">
               <Posts />
               <Sidebar />
            </div>
         </main>
      </>
   );
};

export default Home;
