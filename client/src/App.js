import logo from "./logo.svg";
import "./App.scss";
import Home from "./views/Home/Home";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import Login from "./views/Login/Login";
import Signup from "./views/Signup/Signup";
import VerifyEmail from "./views/VerifyEmail/VerifyEmail";

function App() {
   return (
      <Router>
         <div className="App">
            <Switch>
               <Route exact path="/">
                  <Home />
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
