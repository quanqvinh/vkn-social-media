import "./signup.scss";

import { Link } from "react-router-dom";
import logo from "../../assets/images/instagramLogo.png";
import Footer from "../Footer/Footer";

export default function Signup() {
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
                     <form>
                        <div className="form__field">
                           <input
                              type="email"
                              id="Email"
                              name="Email"
                              required
                              placeholder="Email"
                           />
                        </div>
                        <div className="form__field">
                           <input
                              type="text"
                              id="Username"
                              name="Username"
                              placeholder="Full Name"
                              required
                           />
                        </div>
                        <div className="form__field">
                           <input
                              type="text"
                              id="FullName"
                              name="FullName"
                              placeholder="Username"
                              required
                           />
                        </div>
                        <div className="form__field">
                           <input
                              type="password"
                              id="password"
                              name="Password"
                              placeholder="Password"
                              required
                           />
                        </div>
                        <button className="primary-insta-btn">Sign Up</button>
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
