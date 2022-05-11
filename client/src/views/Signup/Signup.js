import './signup.scss';

import { Link } from 'react-router-dom';
import logo from '../../assets/images/instagramLogo.png';
import Footer from '../Footer/Footer';
import ResMessage from '../Global/ResMessage';
import authApi from '../../apis/authApi';

import { useForm } from 'react-hook-form';
import { useState, useEffect } from 'react';

export default function Signup() {
    const [resMessage, setResMessage] = useState('');
    const [isEmailError, setIsEmailError] = useState(false);
    const [isFullNameError, setIsFullNameError] = useState(false);
    const [isUserNameError, setIsUserNameError] = useState(false);
    const [isPasswordError, setIsPasswordError] = useState(false);

    const [isSignUp, setIsSignUp] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm();

    const onSubmit = data => {
        const signUp = async () => {
            try {
                let res = await authApi.signUp(data);

                setResMessage(res.message);
            } catch (error) {
                if (error.response) {
                    let data = error.response.data;
                    setResMessage(data.message);
                }
            }
        };

        signUp();
    };

    if (isSignUp) {
        if (errors?.email?.type && !isEmailError) {
            setIsEmailError(true);
        }
        if (!errors?.email?.type && isEmailError) {
            setIsEmailError(false);
        }

        if (errors?.name?.type && !isFullNameError) {
            setIsFullNameError(true);
        }
        if (!errors?.name?.type && isFullNameError) {
            setIsFullNameError(false);
        }

        if (errors?.username?.type && !isUserNameError) {
            setIsUserNameError(true);
        }
        if (!errors?.username?.type && isUserNameError) {
            setIsUserNameError(false);
        }

        if (errors?.password?.type && !isPasswordError) {
            setIsPasswordError(true);
        }
        if (!errors?.password?.type && isPasswordError) {
            setIsPasswordError(false);
        }
    }

    console.log('render');
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
                                Sign up to see photos and videos from your
                                friends.
                            </h4>
                            <form onSubmit={handleSubmit(onSubmit)}>
                                <div className="form__field">
                                    {resMessage && (
                                        <ResMessage
                                            resMessage={resMessage}
                                            callBy="Signup"
                                        />
                                    )}
                                    <input
                                        className={
                                            isEmailError
                                                ? 'input--error'
                                                : 'none'
                                        }
                                        {...register('email', {
                                            required: true,
                                            pattern:
                                                /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()\.,;\s@\"]+\.{0,1})+([^<>()\.,;:\s@\"]{2,}|[\d\.]+))$/,
                                        })}
                                        id="Email"
                                        placeholder="Email"
                                    />
                                    {errors?.email?.type === 'required' && (
                                        <p className="input__error">
                                            This field is required
                                        </p>
                                    )}
                                    {errors?.email?.type === 'pattern' && (
                                        <p className="input__error">
                                            This field must fill in email
                                        </p>
                                    )}
                                </div>
                                <div className="form__field">
                                    <input
                                        className={
                                            isFullNameError
                                                ? 'input--error'
                                                : 'none'
                                        }
                                        {...register('name', {
                                            required: true,
                                            maxLength: 30,
                                            minLength: 5,
                                        })}
                                        type="text"
                                        id="Name"
                                        placeholder="Full Name"
                                    />

                                    {errors?.name?.type === 'maxLength' && (
                                        <p className="input__error">
                                            Full name cannot exceed 30
                                            characters
                                        </p>
                                    )}
                                </div>
                                <div className="form__field">
                                    <input
                                        className={
                                            isUserNameError
                                                ? 'input--error'
                                                : 'none'
                                        }
                                        {...register('username', {
                                            required: true,
                                            maxLength: 20,
                                            pattern: /^[a-z0-9_.]+$/,
                                        })}
                                        type="text"
                                        id="Username"
                                        placeholder="Username"
                                    />
                                    {errors?.username?.type === 'required' && (
                                        <p className="input__error">
                                            This field is required
                                        </p>
                                    )}
                                    {errors?.username?.type === 'maxLength' && (
                                        <p className="input__error">
                                            User name cannot exceed 20
                                            characters
                                        </p>
                                    )}
                                    {errors?.username?.type === 'pattern' && (
                                        <p className="input__error">
                                            Usernames can only use letters,
                                            numbers, underscores, and periods.
                                        </p>
                                    )}
                                </div>
                                <div className="form__field">
                                    <input
                                        className={
                                            isPasswordError
                                                ? 'input--error'
                                                : 'none'
                                        }
                                        {...register('password', {
                                            required: true,
                                            minLength: 8,
                                            maxLength: 30,
                                            pattern:
                                                /(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[@$!%*#?&^_-]).{8,}/,
                                        })}
                                        type="password"
                                        id="password"
                                        placeholder="Password"
                                    />
                                    {errors?.password?.type === 'required' && (
                                        <p className="input__error">
                                            This field is required
                                        </p>
                                    )}
                                    {errors?.password?.type === 'minLength' && (
                                        <p className="input__error">
                                            Password must have at least 8
                                            characters
                                        </p>
                                    )}
                                    {errors?.password?.type === 'maxLength' && (
                                        <p className="input__error">
                                            Password cannot exceed 30 characters
                                        </p>
                                    )}
                                    {errors?.password?.type === 'pattern' && (
                                        <p className="input__error">
                                            Password must contain upper case,
                                            lower case character, digit and
                                            symbol/special character.
                                        </p>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    className="primary-insta-btn primary-insta-btn--active"
                                    onClick={() => setIsSignUp(true)}>
                                    Sign Up
                                </button>
                            </form>
                            <p className="policies">
                                By signing up, you agree to our{' '}
                                <strong>Terms</strong>,
                                <strong> Data Policy</strong> and{' '}
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
