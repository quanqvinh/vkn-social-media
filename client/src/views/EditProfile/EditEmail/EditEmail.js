import React from 'react';
import Header from '../../Header/Header';
import Footer from '../../Footer/Footer';
import LeftNav from '../LeftNav/LeftNav';
import ProfilePreview from '../../Profile/ProfilePreview/ProfilePreview';
import { useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import userApi from '../../../apis/userApi';
import env from 'react-dotenv';

const EditEmail = () => {
    const user = useSelector(state => state.user);
    const notifyRef = useRef(null);
    const [formInfos, setFormInfos] = useState({
        email: user.email,
        newEmail: ''
    });

    const handelSubmit = e => {
        e.preventDefault();
        const requestEditEmail = async () => {
            try {
                let data = {
                    username: user.username,
                    email: formInfos.newEmail
                };
                let res = await userApi.requestEditEmail(data);
                console.log(res);
                notifyRef.current.innerHTML = 'Verify email has been sent to your email';
                notifyRef.current.style.color = 'green';
            } catch (error) {
                console.log(error.message);
                notifyRef.current.innerHTML = 'Change email failed';
            }
        };
        requestEditEmail();
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
                        <p
                            ref={notifyRef}
                            className="body__right-notify"
                            style={{ marginLeft: 130 }}></p>
                        <form className="right__form" onSubmit={e => handelSubmit(e)}>
                            <div className="form__email">
                                <span className="form__email-label">Old Email</span>
                                <div className="form__email-content">
                                    <input
                                        type="text"
                                        value={formInfos.email}
                                        onChange={e =>
                                            setFormInfos({
                                                ...formInfos,
                                                email: e.target.value
                                            })
                                        }
                                    />
                                </div>
                            </div>
                            <div className="form__email">
                                <span className="form__email-label">New Email</span>
                                <div className="form__email-content">
                                    <input
                                        type="text"
                                        value={formInfos.newEmail}
                                        onChange={e =>
                                            setFormInfos({
                                                ...formInfos,
                                                newEmail: e.target.value
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

export default EditEmail;
