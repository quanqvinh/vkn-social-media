import "./home.scss";
import Posts from "../Posts/Posts";
import Sidebar from "../SideBar/SideBar";
import Header from "../Header/Header";
import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useStore } from "react-redux";
import { fetchProfileRequest } from "../../actions/user";
import { getCookie } from "../Global/cookie";
import { useHistory } from "react-router-dom";
import { SOCKET } from "../../App";
import { useContext } from "react";

const Home = () => {
   const history = useHistory();
   const accessToken = getCookie("accessToken");
   const SESSION_USER = sessionStorage.getItem("USER_INFO");
   const socket = useContext(SOCKET);
   const [listOnline, setListOnline] = useState([]);

   if (!SESSION_USER) {
      history.push("/login");
   }

   const dispatch = useDispatch();
   useEffect(() => {
      const fetchUser = async () => {
         try {
            dispatch(fetchProfileRequest());
         } catch (error) {
            console.log(error.message);
         }
      };
      if (accessToken) {
         fetchUser();
      }
   }, []);

   useEffect(() => {
      socket &&
         socket.on("home:list_friend_online", (payload) => {
            setListOnline([...payload]);
         });
   }, [socket]);

   useEffect(() => {
      socket &&
         socket.on("home:friend_connect", (payload) => {
            setListOnline([...listOnline, payload]);
         });
   }, [socket]);

   const removeOnline = (userId) => {
      const newList = listOnline.filter((user) => user._id !== userId);
      setListOnline([...newList]);
   };

   useEffect(() => {
      socket &&
         socket.on("home:friend_disconnect", (payload) => {
            removeOnline(payload._id);
         });
   }, [socket]);

   return (
      <>
         <Header />
         <main>
            <div className="container">
               <Posts />
               <Sidebar listOnline={listOnline} />
            </div>
         </main>
      </>
   );
};

export default Home;
