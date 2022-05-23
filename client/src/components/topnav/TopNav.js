import React, { useState, useRef } from 'react';
import './topnav.scss';
import avatarDefault from '../../assets/images/avatar_default.png';
import { Link } from 'react-router-dom';
import Dropdown from '../dropdown/Dropdown';
import ThemeMenu from '../thememenu/ThemeMenu';
import notifications from '../../assets/JsonData/notification.json';
import user_menu from '../../assets/JsonData/user_menus.json';
import { useHistory } from 'react-router-dom';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import { userApiAdmin } from '../../apis/userApiAdmin';

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

const Topnav = props => {
    const user = JSON.parse(sessionStorage.getItem('USER_INFO'));
    const history = useHistory();
    const [open, setOpen] = useState(false);
    const notificationRef = useRef(null);
    const [formInfos, setFormInfos] = useState({});

    const handleOpen = () => setOpen(true);
    const handleClose = () => {
        setOpen(false);
        setFormInfos({});
    };

    const handelClickUserMenu = item => {
        if (item.content.includes('password')) {
            console.log('item');
            handleOpen();
        } else {
            history.push('/login');
            window.location.reload();
        }
    };

    const handelChangePassword = () => {
        const changePassword = async () => {
            let { oldPassword, newPassword } = formInfos;
            if (!oldPassword || !newPassword) {
                notificationRef.current.innerHTML = 'Please fill in all fields';
                return;
            }

            try {
                let res = await userApiAdmin.changePassword({
                    oldPassword,
                    newPassword
                });
                console.log(res);
                notificationRef.current.innerHTML = `Your password has been changed successful`;
                notificationRef.current.style.color = 'green';

                setTimeout(() => {
                    handleClose();
                }, 3000);
            } catch (error) {
                console.log(error.response.data.message);
                if (error.response.data.message.includes('Password')) {
                    notificationRef.current.innerHTML = 'Password is incorrect';
                } else {
                    notificationRef.current.innerHTML = 'This email already in use';
                }
            }
        };
        changePassword();
    };

    const renderNotificationItem = (item, index) => (
        <div className="notification-item" key={index}>
            <i className={item.icon}></i>
            <span>{item.content}</span>
        </div>
    );

    const renderUserToggle = user => (
        <div className="topnav__right-user">
            <div className="topnav__right-user__image">
                <img
                    onError={setDefault}
                    src={process.env.REACT_APP_STATIC_URL + `/avatars/${user._id}.png`}
                    alt=""
                />
            </div>
            <div className="topnav__right-user__name">{user.username}</div>
        </div>
    );

    const renderUserMenu = (item, index) => (
        <div className="notification-item" key={index} onClick={() => handelClickUserMenu(item)}>
            <i className={item.icon}></i>
            <span>{item.content}</span>
        </div>
    );

    const setDefault = e => {
        // console.clear();
        e.target.onerror = null;
        e.target.src = avatarDefault;
    };

    return (
        <div className="topnav">
            <div className="topnav__right">
                <div className="topnav__right-item">
                    <Dropdown
                        customToggle={() => renderUserToggle(user)}
                        contentData={user_menu}
                        renderItems={(item, index) => renderUserMenu(item, index)}
                    />
                    <Modal
                        open={open}
                        onClose={handleClose}
                        aria-labelledby="modal-modal-title"
                        aria-describedby="modal-modal-description">
                        <Box sx={style}>
                            <p className="forgot__notification" ref={notificationRef}></p>
                            <span className="forgot__title">New User</span>

                            <div className="forgot__content">
                                <div className="forgot__content-item">
                                    <label className="forgot__label">Old Password:</label>
                                    <input
                                        onChange={e =>
                                            setFormInfos({
                                                ...formInfos,
                                                oldPassword: e.target.value
                                            })
                                        }
                                        value={formInfos.oldPassword || ''}
                                        type="text"
                                        className="forgot__email"
                                        placeholder="Old Password"
                                    />
                                </div>
                                <div className="forgot__content-item">
                                    <label className="forgot__label">New Password:</label>
                                    <input
                                        onChange={e =>
                                            setFormInfos({
                                                ...formInfos,
                                                newPassword: e.target.value
                                            })
                                        }
                                        value={formInfos.newPassword || ''}
                                        type="text"
                                        className="forgot__email"
                                        placeholder="New Password"
                                    />
                                </div>
                            </div>
                            <button className="forgot__send" onClick={handelChangePassword}>
                                Change Password
                            </button>
                        </Box>
                    </Modal>
                </div>
                <div className="topnav__right-item">
                    <Dropdown
                        icon="bx bx-bell"
                        badge="12"
                        contentData={notifications}
                        renderItems={(item, index) => renderNotificationItem(item, index)}
                        renderFooter={() => <Link to="/">View All</Link>}
                    />
                    {/* dropdown here */}
                </div>
                <div className="topnav__right-item">
                    <ThemeMenu />
                </div>
            </div>
        </div>
    );
};

export default Topnav;
