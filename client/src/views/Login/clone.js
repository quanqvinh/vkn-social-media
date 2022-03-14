import { useState, useContext, useEffect } from "react";
import { Link } from "react-router-dom";
import { Context } from "../Context/GlobalState";
import CircularProgress from "@material-ui/core/CircularProgress";
import LoadingInstagram from "./LoadingInstagram";

export default function Login({ history }) {
   const [email, setEmail] = useState("");
   const [password, setPassword] = useState("");
   const [isLoading, setIsLoading] = useState(false);

   // To get the data from the Context
   const {
      login,
      loginWithGoogle,
      isPageLoading,
      setIsPageLoading,
      authError,
      OAuthError,
   } = useContext(Context);

   useEffect(() => {
      setIsPageLoading(true);
   }, [setIsPageLoading]);

   const handlelogin = (e) => {
      e.preventDefault();

      setIsLoading(true);

      login(
         email,
         password,
         () => history.push("/home"),
         () => setIsLoading(false)
      );
   };

   const handleGoogleLogin = () => {
      loginWithGoogle(() => history.push("/set-profile"));
   };

   // To show a loading page when page loads on re-authentication
   if (isPageLoading) {
      return <LoadingInstagram />;
   }

   return (
      <div className="login__container">
         <h1>Instagram Clone</h1>
         <div className="form__area">
            <div className="form">
               <form onSubmit={handlelogin}>
                  <div className="form__field">
                     <input
                        type="email"
                        id="Email"
                        name="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                     />
                     <label htmlFor="Email">Email</label>
                  </div>
                  <div className="form__field">
                     <input
                        type="password"
                        id="password"
                        name="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                     />
                     <label htmlFor="Password">Password</label>
                  </div>
                  <button className="primary-insta-btn" disabled={isLoading}>
                     {!isLoading ? (
                        "Log In"
                     ) : (
                        <CircularProgress size={20} color="inherit" />
                     )}
                  </button>
                  {authError && (
                     <div className="auth__error">
                        <small>{authError}</small>
                     </div>
                  )}
                  {OAuthError && (
                     <div className="auth__error">
                        <small>{OAuthError}</small>
                     </div>
                  )}
                  <div className="google__login">
                     <button
                        className="btn__authGoogle"
                        onClick={handleGoogleLogin}
                     >
                        Log in with Google
                     </button>
                  </div>
                  <a href="#!" className="forgotPassword">
                     Forgot Password?
                  </a>
               </form>
            </div>
            <div className="signup__area">
               <p>
                  Don't have and account? <Link to="/signup">Signup</Link>
               </p>
            </div>
         </div>
      </div>
   );
}
