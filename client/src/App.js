import logo from "./logo.svg";
import "./App.scss";
import Home from "./views/Home/Home";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Login from "./views/Login/Login";
import Signup from "./views/Signup/Signup";

function App() {
   return (
      <Router>
         <div className="App">
            <Routes>
               <Route exact path="/" element={<Home />} />
               <Route path="/login" element={<Login />} />
               <Route path="/signup" element={<Signup />} />
            </Routes>
         </div>
      </Router>
   );
}

export default App;
