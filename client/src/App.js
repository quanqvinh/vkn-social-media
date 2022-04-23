import logo from "./logo.svg";
import "./App.scss";
import Home from "./views/Home/Home";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import Login from "./views/Login/Login";
import Signup from "./views/Signup/Signup";
import VerifyEmail from "./views/VerifyEmail/VerifyEmail";
import Inbox from "./views/Inbox/Inbox";

import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchProfileRequest } from "./actions/user";
import ProfilePage from "./views/ProfilePage/ProfilePage";
import EditProfile from "./views/EditProfile/EditProfile";

function App() {
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

   const user = useSelector((state) => state.user);

   return (
      <Router>
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
      </Router>
   );
}

export default App;
