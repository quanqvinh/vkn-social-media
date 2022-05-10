import "./login.scss";
import logo from "../../assets/images/instagramLogo.png";
import loginImg from "../../assets/images/login1.png";
import Footer from "../Footer/Footer";
import authApi from "../../apis/authApi";
import ResMessage from "../Global/ResMessage";
import { setCookie } from "../Global/cookie";
import { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { Link } from "react-router-dom";
import RemoveRedEyeIcon from "@mui/icons-material/RemoveRedEye";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";

export default function Login() {
   const [username, setUserName] = useState("");
   const [email, setEmail] = useState("");
   const [password, setPassword] = useState("");
   const [resMessage, setResMessage] = useState("");
   const [showPassword, setShowPassword] = useState(false);

   const history = useHistory();

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
            let accessToken = res?.accessToken;
            let refreshToken = res?.refreshToken;

            setCookie("accessToken", accessToken, 3);
            setCookie("refreshToken", refreshToken, 3);
            sessionStorage.setItem("USER_INFO", null);
            sessionStorage.setItem("STATE_PAGE", "home");

            console.log(res);
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

   const handelShowPassword = () => {
      var passwordElement = document.getElementById("password");
      if (passwordElement.type === "password") {
         passwordElement.type = "text";
      } else {
         passwordElement.type = "password";
      }
      setShowPassword((prev) => !prev);
   };

   useEffect(() => {
      sessionStorage.removeItem("USER_INFO");
   }, []);
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
                           <p className="form__field-password-container">
                              <input
                                 type="password"
                                 id="password"
                                 name="Password"
                                 required
                                 placeholder="Password"
                                 value={password}
                                 onChange={(e) => setPassword(e.target.value)}
                              />
                              {showPassword ? (
                                 <VisibilityOffIcon
                                    onClick={handelShowPassword}
                                    sx={{ color: "#555" }}
                                 />
                              ) : (
                                 <RemoveRedEyeIcon
                                    onClick={handelShowPassword}
                                    sx={{ color: "#555" }}
                                 />
                              )}
                           </p>
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
