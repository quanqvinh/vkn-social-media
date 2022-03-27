import "./signup.scss";

import { Link } from "react-router-dom";
import logo from "../../assets/images/instagramLogo.png";
import Footer from "../Footer/Footer";
import ResMessage from "../Global/ResMessage";
import authApi from "../../apis/authApi";

import axios from "axios";
import { useState, useEffect } from "react";

export default function Signup() {
   const [email, setEmail] = useState("");
   const [fullname, setFullname] = useState("");
   const [username, setUsername] = useState("");
   const [password, setPassword] = useState("");
   const [isSignUp, setIsSignUp] = useState(false);
   const [resMessage, setResMessage] = useState("");

   const handelCheckSignUp = () => {
      if (!email || !fullname || !username || !password) return false;

      return true;
   };

   const handelSignUp = (e) => {
      e.preventDefault();

      let data = {
         email,
         name: fullname,
         username,
         password,
      };

      const signUp = async () => {
         try {
            let res = await authApi.signUp(data);

            setResMessage(res.message);
         } catch (error) {
            if (error.response) {
               let data = error.response.data;
               setResMessage(data.message);
            }

            // } else if (error.request) {
            //    console.log("else if", error.request);
            // } else {
            //    // Something happened in setting up the request that triggered an Error
            //    console.log("Error", error.message);
            // }
         }
      };

      signUp();
   };

   return (
      <>
         <div className="wrapper">
            <div className="signup__container">
               <div className="form__area">
                  <div className="form">
                     <div className="form__logo">
                        <img src={logo} alt="" />
                     </div>
                     <h4>
                        Sign up to see photos and videos from your friends.
                     </h4>
                     <form onSubmit={handelSignUp}>
                        <div className="form__field">
                           {resMessage && (
                              <ResMessage
                                 resMessage={resMessage}
                                 callBy="Signup"
                              />
                           )}
                           <input
                              type="email"
                              id="Email"
                              name="Email"
                              required
                              placeholder="Email"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                           />
                        </div>
                        <div className="form__field">
                           <input
                              type="text"
                              id="FullName"
                              name="FullName"
                              placeholder="Full Name"
                              required
                              value={fullname}
                              onChange={(e) => setFullname(e.target.value)}
                           />
                        </div>
                        <div className="form__field">
                           <input
                              type="text"
                              id="Username"
                              name="Username"
                              placeholder="Username"
                              required
                              value={username}
                              onChange={(e) => setUsername(e.target.value)}
                           />
                        </div>
                        <div className="form__field">
                           <input
                              type="password"
                              id="password"
                              name="Password"
                              placeholder="Password"
                              required
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                           />
                        </div>

                        {handelCheckSignUp() ? (
                           <button className="primary-insta-btn primary-insta-btn--active">
                              Sign Up
                           </button>
                        ) : (
                           <button className="primary-insta-btn">
                              Sign Up
                           </button>
                        )}
                     </form>
                     <p className="policies">
                        By signing up, you agree to our <strong>Terms</strong>,
                        <strong> Data Policy</strong> and{" "}
                        <strong>Cookies Policy</strong> .
                     </p>
                  </div>
                  <div className="signup__area">
                     <p>
                        Have an account? <Link to="/login">Log in</Link>
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
