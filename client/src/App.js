import logo from "./logo.svg";
import "./App.scss";
import Home from "./views/Home/Home";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import Login from "./views/Login/Login";
import Signup from "./views/Signup/Signup";
import VerifyEmail from "./views/VerifyEmail/VerifyEmail";
import Inbox from "./views/Inbox/Inbox";

import { createContext, useContext, useEffect } from "react";
import { useSelector, useDispatch, Provider } from "react-redux";
import { fetchProfileRequest } from "./actions/user";

export const UserContext = createContext();
function App() {
   const dispatch = useDispatch();
   useEffect(() => {
      console.log("ahih");
      const fetchUser = async () => {
         try {
            let action = fetchProfileRequest();
            dispatch(action);
         } catch (error) {
            console.log(error.message);
         }
      };
      fetchUser();
   }, []);

   const user = useSelector((state) => state.user);

   return (
      <Router>
         <UserContext.Provider value={user}>
            <div className="App">
               <Switch>
                  <Route exact path="/">
                     <Home />
                  </Route>
                  <Route path={"/inbox"}>
                     <Inbox />
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
         </UserContext.Provider>
      </Router>
   );
}

export default App;
