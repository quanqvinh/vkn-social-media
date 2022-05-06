import "./home.scss";
import Posts from "../Posts/Posts";
import Sidebar from "../SideBar/SideBar";
import Header from "../Header/Header";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { fetchProfileRequest } from "../../actions/user";
import { getCookie } from "../Global/cookie";
import { useHistory } from "react-router-dom";

const Home = () => {
   const history = useHistory();
   const accessToken = getCookie("accessToken");
   const SESSION_USER = sessionStorage.getItem("USER_INFO");
   if (!SESSION_USER) {
      history.push("/login");
   }

   const dispatch = useDispatch();
   useEffect(() => {
      const fetchUser = async () => {
         try {
            console.log("call api");
            dispatch(fetchProfileRequest());
         } catch (error) {
            console.log(error.message);
         }
      };
      if (accessToken) {
         fetchUser();
      }
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
