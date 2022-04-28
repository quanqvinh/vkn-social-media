import "./home.scss";
import Posts from "../Posts/Posts";
import Sidebar from "../SideBar/SideBar";
import Header from "../Header/Header";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { fetchProfileRequest } from "../../actions/user";

const Home = () => {
   const dispatch = useDispatch();
   useEffect(() => {
      const fetchUser = async () => {
         try {
            dispatch(fetchProfileRequest());
         } catch (error) {
            console.log(error.message);
         }
      };
      fetchUser();
   }, []);

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
