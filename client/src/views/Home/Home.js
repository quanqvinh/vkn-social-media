import "./home.scss";
import Posts from "../Posts/Posts";
import Sidebar from "../SideBar/SideBar";
import Footer from "../Footer/Footer";

const Home = () => {
   return (
      <main>
         <div className="container">
            <Posts />
            <Sidebar />
         </div>
      </main>
   );
};

export default Home;
