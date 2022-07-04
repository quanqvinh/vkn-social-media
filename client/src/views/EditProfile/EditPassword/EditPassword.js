import React from 'react';
import Header from '../../Header/Header';
import Footer from '../../Footer/Footer';
import LeftNav from '../LeftNav/LeftNav';
import ProfilePreview from '../../Profile/ProfilePreview/ProfilePreview';
import { useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import userApi from '../../../apis/userApi';
import env from 'react-dotenv';
const EditPassword = () => {
    const user = useSelector(state => state.user);
    const notifyRef = useRef(null);
    const [formInfos, setFormInfos] = useState({
        password: '',
        newPassword: '',
        passwordConfirm: ''
    });

    const handelSubmit = e => {
        e.preventDefault();
        if (!(formInfos.newPassword === formInfos.passwordConfirm)) {
            notifyRef.current.innerHTML = "Password confirm doesn't match";
            return;
        }

        const editPassword = async () => {
            try {
                let res = await userApi.editPassword(formInfos);
                console.log(res);
                notifyRef.current.innerHTML = 'Change password successful';
                notifyRef.current.style.color = 'green';
            } catch (error) {
                console.log(error.message);
                notifyRef.current.innerHTML = 'Your old password is incorrect';
            }
        };
        editPassword();
    };
    return (
        <>
            <Header />
            <div className="edit-profile-container">
                <div className="edit-profile__body" style={{ height: 570 }}>
                    <div className="body__left">
                        <LeftNav />
                    </div>
                    <div className="body__right">
                        <ProfilePreview
                            image={process.env.REACT_APP_STATIC_URL + `/avatars/${user._id}.png`}
                            username={user.username}
                            iconSize="medium"
                            captionSize="small"
                        />
                        <p className="body__right-notify" ref={notifyRef}></p>
                        <form className="right__form" onSubmit={e => handelSubmit(e)}>
                            <div className="form__password">
                                <span className="form__password-label">Old Password</span>
                                <div className="form__password-content">
                                    <input
                                        type="password"
                                        value={formInfos.password}
                                        onChange={e =>
                                            setFormInfos({
                                                ...formInfos,
                                                password: e.target.value
                                            })
                                        }
                                    />
                                </div>
                            </div>
                            <div className="form__password">
                                <span className="form__password-label">New Password</span>
                                <div className="form__password-content">
                                    <input
                                        type="password"
                                        value={formInfos.newPassword}
                                        onChange={e =>
                                            setFormInfos({
                                                ...formInfos,
                                                newPassword: e.target.value
                                            })
                                        }
                                    />
                                </div>
                            </div>
                            <div className="form__password">
                                <span className="form__password-label">Confirm New Password</span>
                                <div className="form__password-content">
                                    <input
                                        type="password"
                                        value={formInfos.passwordConfirm}
                                        onChange={e =>
                                            setFormInfos({
                                                ...formInfos,
                                                passwordConfirm: e.target.value
                                            })
                                        }
                                    />
                                </div>
                            </div>
                            <button className="form__submit">Submit</button>
                        </form>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default EditPassword;
