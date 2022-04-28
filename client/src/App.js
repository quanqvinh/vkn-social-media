import "./App.scss";
import Home from "./views/Home/Home";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import Login from "./views/Login/Login";
import Signup from "./views/Signup/Signup";
import VerifyEmail from "./views/VerifyEmail/VerifyEmail";
import Inbox from "./views/Inbox/Inbox";

import { createContext } from "react";
import { useSelector } from "react-redux";
import ProfilePage from "./views/ProfilePage/ProfilePage";
import EditProfile from "./views/EditProfile/EditProfile";
import { io } from "socket.io-client";
import { getCookie } from "./views/Global/cookie";

export const SOCKET = createContext();
function App() {
   const user = useSelector((state) => state.user);
   console.log(user._id, user.username);
   const socket = io("http://localhost:7070", {
      auth: {
         "access-token": getCookie("accessToken"),
         userId: user._id,
         username: user.username,
      },
   });

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
                  <Route path={"/profile/edit"}>
                     <EditProfile />
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
