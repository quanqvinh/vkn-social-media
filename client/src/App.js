import "./App.scss";
import Home from "./views/Home/Home";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import Login from "./views/Login/Login";
import Signup from "./views/Signup/Signup";
import VerifyEmail from "./views/VerifyEmail/VerifyEmail";
import Inbox from "./views/Inbox/Inbox";

import { createContext, useEffect } from "react";
import { useSelector, useStore } from "react-redux";
import ProfilePage from "./views/ProfilePage/ProfilePage";
import EditProfile from "./views/EditProfile/EditProfile";
import EditPassword from "./views/EditProfile/EditPassword/EditPassword";
import { io } from "socket.io-client";
import { getCookie } from "./views/Global/cookie";
import { useState } from "react";
import EditEmail from "./views/EditProfile/EditEmail/EditEmail";

export const SOCKET = createContext();
function App() {
   const user = useSelector((state) => state.user);
   const [socket, setSocket] = useState(null);

   useEffect(() => {
      if (!JSON.parse(sessionStorage.getItem("USER_INFO"))) return;
      const socket = io("http://localhost:7070", {
         auth: {
            "access-token": getCookie("accessToken"),
            userId: user._id,
            username: user.username,
         },
      });
      setSocket(socket);
   }, [user]);

   return (
      <Router>
         <SOCKET.Provider value={socket}>
            <div className="App">
               <Switch>
                  <Route exact path="/">
                     <Home />
                  </Route>
                  <Route path={"/inbox"}>
                     <Inbox />
                  </Route>

                  <Route exact path={"/profile"}>
                     <ProfilePage />
                  </Route>
                  <Route exact path={"/profile/edit"}>
                     <EditProfile />
                  </Route>
                  <Route path={"/profile/edit/password"}>
                     <EditPassword />
                  </Route>
                  <Route path={"/profile/edit/email"}>
                     <EditEmail />
                  </Route>
                  <Route path="/login">
                     <Login />
                  </Route>
                  <Route path="/signup">
                     <Signup />
                  </Route>
                  <Route path="/auth/verify-email">
                     <VerifyEmail />
                  </Route>
               </Switch>
            </div>
         </SOCKET.Provider>
      </Router>
   );
}

export default App;
