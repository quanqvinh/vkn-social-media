import './login.scss';
import logo from '../../assets/images/instagramLogo.png';
import loginImg from '../../assets/images/login1.png';
import Footer from '../Footer/Footer';
import authApi from '../../apis/authApi';
import ResMessage from '../Global/ResMessage';
import { setCookie } from '../Global/cookie';
import { useEffect, useState, useRef } from 'react';
import { useHistory } from 'react-router-dom';
import { Link } from 'react-router-dom';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { getCookie } from '../Global/cookie';

import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4
};

export default function Login() {
    const [username, setUserName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [resMessage, setResMessage] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [open, setOpen] = useState(false);
    const [emailForgotPassword, setEmailForgotPassword] = useState('');
    const notificationRef = useRef(null);
    const history = useHistory();

    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const handelCheckLogin = () => {
        if ((!username && !email) || !password) return false;
        return true;
    };

    const validEmail = mail => {
        let regex =
            /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()\.,;\s@\"]+\.{0,1})+([^<>()\.,;:\s@\"]{2,}|[\d\.]+))$/;

        return regex.test(mail);
    };

    const handelUserName = () => {
        if (validEmail(username)) {
            setEmail(username);
            setUserName('');
        }
    };

    const handelLogin = e => {
        e.preventDefault();

        let data = {
            email,
            username,
            password
        };

        console.log('click');
        const login = async () => {
            try {
                let res = await authApi.login(data);
                let accessToken = res?.accessToken;
                let refreshToken = res?.refreshToken;

                setCookie('accessToken', accessToken, 3);
                setCookie('refreshToken', refreshToken, 3);
                sessionStorage.setItem('STATE_PAGE', 'home');

                console.log(res);
                if (res.data.isAdmin) {
                    sessionStorage.setItem('USER_INFO', JSON.stringify({ ...res.data }));

                    history.push('/dashboard');
                } else {
                    sessionStorage.setItem('USER_INFO', null);
                    history.push('/');
                }
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
        var passwordElement = document.getElementById('password');
        if (passwordElement.type === 'password') {
            passwordElement.type = 'text';
        } else {
            passwordElement.type = 'password';
        }
        setShowPassword(prev => !prev);
    };

    const handelForgotPassword = () => {
        if (!emailForgotPassword) return;

        const sendRequestPassword = async () => {
            try {
                let res = await authApi.requestResetPassword({ email: emailForgotPassword });
                console.log(res);

                if (res.status.includes('success')) {
                    notificationRef.current.innerHTML = 'Reset password email has been sent';
                    notificationRef.current.style.color = 'green';
                } else {
                    notificationRef.current.innerHTML = 'Not found any account using this username';
                    notificationRef.current.style.color = 'red';
                }
            } catch (error) {
                console.log(error.message);
            }
        };
        sendRequestPassword();
    };
    useEffect(() => {
        sessionStorage.removeItem('USER_INFO');
        sessionStorage.removeItem('NOTIFICATIONS');
        sessionStorage.removeItem('STATE_PAGE');

        getCookie('accessToken') && setCookie('accessToken', '', 0);
        getCookie('refreshToken') && setCookie('refreshToken', '', 0);
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
                                        <ResMessage resMessage={resMessage} callBy="Login" />
                                    )}
                                    <input
                                        type="text"
                                        id="Username"
                                        name="Username"
                                        required
                                        placeholder="Username, or email"
                                        value={username ? username : email}
                                        onChange={e => setUserName(e.target.value)}
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
                                            onChange={e => setPassword(e.target.value)}
                                        />
                                        {showPassword ? (
                                            <VisibilityOffIcon
                                                onClick={handelShowPassword}
                                                sx={{ color: '#555' }}
                                            />
                                        ) : (
                                            <RemoveRedEyeIcon
                                                onClick={handelShowPassword}
                                                sx={{ color: '#555' }}
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

                                <div>
                                    <span className="forgotPassword" onClick={handleOpen}>
                                        Forgot Password?
                                    </span>
                                    <Modal
                                        open={open}
                                        onClose={handleClose}
                                        aria-labelledby="modal-modal-title"
                                        aria-describedby="modal-modal-description">
                                        <Box sx={style}>
                                            <div className="form__forgotPassword-login">
                                                <p
                                                    className="forgot__notification"
                                                    ref={notificationRef}></p>
                                                <span className="forgot__title">
                                                    Please fill in your email
                                                </span>

                                                <div className="forgot__content-login">
                                                    <label className="forgot__label">Email:</label>
                                                    <input
                                                        onChange={e =>
                                                            setEmailForgotPassword(e.target.value)
                                                        }
                                                        value={emailForgotPassword}
                                                        type="text"
                                                        className="forgot__email"
                                                        placeholder="Your email..."
                                                    />
                                                </div>
                                                <button
                                                    className="forgot__send"
                                                    onClick={handelForgotPassword}>
                                                    Ok
                                                </button>
                                            </div>
                                        </Box>
                                    </Modal>
                                </div>
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
