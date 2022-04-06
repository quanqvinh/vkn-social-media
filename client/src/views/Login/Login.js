import "./login.scss";
import logo from "../../assets/images/instagramLogo.png";
import loginImg from "../../assets/images/login1.png";
import Footer from "../Footer/Footer";
import authApi from "../../apis/authApi";
import ResMessage from "../Global/ResMessage";
import { setCookie } from "../Global/cookie";

import { useState } from "react";
import { useHistory } from "react-router-dom";
import { Link } from "react-router-dom";
import { saveUser } from "../../actions/user";
import { useDispatch } from "react-redux";

export default function Login() {
   const [username, setUserName] = useState("");
   const [email, setEmail] = useState("");
   const [password, setPassword] = useState("");
   const [resMessage, setResMessage] = useState("");
   const history = useHistory();

   const dispatch = useDispatch();

   const handelCheckLogin = () => {
      if ((!username && !email) || !password) return false;
      return true;
   };

   const validEmail = (mail) => {
      let regex =
         /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()\.,;\s@\"]+\.{0,1})+([^<>()\.,;:\s@\"]{2,}|[\d\.]+))$/;

      return regex.test(mail);
   };

   const handelUserName = () => {
      if (validEmail(username)) {
         setEmail(username);
         setUserName("");
      }
   };

   const handelLogin = (e) => {
      e.preventDefault();

      let data = {
         email,
         username,
         password,
      };

      const login = async () => {
         try {
            let res = await authApi.login(data);
            let user = res?.data;
            let accessToken = res?.accessToken;
            let refreshToken = res?.refreshToken;

            setCookie("accessToken", accessToken, 3);
            setCookie("refreshToken", refreshToken, 3);

            let action = saveUser(user);
            dispatch(action);
            if (res.status === "success") history.push("/");
         } catch (error) {
            if (error.response) {
               console.log(error.message);
               let data = error.response.data;
               setResMessage(data.message);
            }
         }
      };
      login();
   };

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
                     <form onSubmit={handelLogin}>
                        <div className="form__field">
                           {resMessage && (
                              <ResMessage
                                 resMessage={resMessage}
                                 callBy="Login"
                              />
                           )}
                           <input
                              type="text"
                              id="Username"
                              name="Username"
                              required
                              placeholder="Username, or email"
                              value={username ? username : email}
                              onChange={(e) => setUserName(e.target.value)}
                              onBlur={() => handelUserName()}
                           />
                        </div>
                        <div className="form__field">
                           <input
                              type="password"
                              id="password"
                              name="Password"
                              required
                              placeholder="Password"
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                           />
                        </div>
                        {handelCheckLogin() ? (
                           <button className="primary-insta-btn primary-insta-btn--active">
                              Login
                           </button>
                        ) : (
                           <button className="primary-insta-btn">Login</button>
                        )}
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
