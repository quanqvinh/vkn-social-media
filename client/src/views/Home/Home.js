import "./home.scss";
import Posts from "../Posts/Posts";
import Sidebar from "../SideBar/SideBar";
import Header from "../Header/Header";
import { useSelector, useDispatch } from "react-redux";
import { saveUser, fetchProfileRequest } from "../../actions/user";
import { useEffect } from "react";
import userApi from "../../apis/userApi";
import { getCookie } from "../Global/cookie";

const Home = () => {
   const dispatch = useDispatch();
   useEffect(() => {
      const fetchUser = async () => {
         try {
            let action = fetchProfileRequest();
            dispatch(action);
         } catch (error) {
            console.log(error.message);
         }
      };
      fetchUser();
   }, [dispatch]);

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
