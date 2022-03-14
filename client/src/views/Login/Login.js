import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./login.scss";
import logo from "../../assets/images/instagramLogo.png";
import loginImg from "../../assets/images/login1.png";
import Footer from "../Footer/Footer";

export default function Login() {
   return (
      <>
         <div className="wrapper">
            <div className="login__container">
               <div className="login__left">
                  <div className="login__left-img">
                     <img src={loginImg} alt="login img" />
                  </div>
               </div>
               <div className="form__area">
                  <div className="form">
                     <div className="form__logo">
                        <img src={logo} alt="" />
                     </div>
                     <form>
                        <div className="form__field">
                           <input
                              type="email"
                              id="Email"
                              name="Email"
                              required
                              placeholder="Phone number, username, or email"
                           />
                        </div>
                        <div className="form__field">
                           <input
                              type="password"
                              id="password"
                              name="Password"
                              required
                              placeholder="Password"
                           />
                        </div>
                        <button className="primary-insta-btn">Log In</button>
                        <a href="#!" className="forgotPassword">
                           Forgot Password?
                        </a>
                     </form>
                  </div>
                  <div className="signup__area">
                     <p>
                        Don't have an account? <Link to="/signup">Sign up</Link>
                     </p>
                  </div>
               </div>
            </div>
            <div className="login__footer">
               <Footer />
            </div>
         </div>
      </>
   );
}
