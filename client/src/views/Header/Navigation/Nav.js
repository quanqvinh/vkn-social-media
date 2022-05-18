import './nav.scss';

import NewPost from '../../NewPost/NewPost';
import ProfileIcon from '../../Profile/ProfilePreview/ProfileIcon';
import ProfilePreview from '../../Profile/ProfilePreview/ProfilePreview';

import { useEffect, useState, useContext, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useHistory } from 'react-router-dom';
import { getCookie, setCookie } from '../../Global/cookie';
import { NavLink } from 'react-router-dom';
import { SOCKET } from '../../../App';

import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import AddBoxIcon from '@mui/icons-material/AddBox';
import AddIcon from '@mui/icons-material/Add';
import ChatBubbleOutlineOutlinedIcon from '@mui/icons-material/ChatBubbleOutlineOutlined';
import ChatIcon from '@mui/icons-material/Chat';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import HomeIcon from '@mui/icons-material/Home';

import friendApi from '../../../apis/friendApi';
import { checkNotifications, formatNotifications } from '../../../actions/notification';
import PostDetail from '../../PostDetail/PostDetail';

const clickOutsideRef = (content_ref, toggle_ref) => {
    document.addEventListener('mousedown', e => {
        // user click toggle
        if (
            toggle_ref.current &&
            toggle_ref.current.contains(e.target) &&
            !e.target.closest('.dropdown__notification-item')
        ) {
            toggle_ref.current.classList.toggle('notification--open');
        } else {
            // user click outside toggle and content
            if (content_ref.current && !content_ref.current.contains(e.target)) {
                toggle_ref.current.classList.remove('notification--open');
            }
        }
    });
};

function Nav() {
    const user = useSelector(state => state.user);
    const [isDropDown, setIsDropDown] = useState(false);
    const [currentOption, setCurrentOption] = useState({
        newPost: false,
        notification: false
    });
    const statePage = useRef(sessionStorage.getItem('STATE_PAGE'));
    const notificationRef = useRef(null);
    const notificationContentRef = useRef(null);
    const notificationInit = useSelector(user => user.notifications);
    const [notifications, setNotifications] = useState({});
    const [postSelected, setPostSelected] = useState({
        isSelected: false,
        postId: null
    });

    const socket = useContext(SOCKET);
    const history = useHistory();
    const dispatch = useDispatch();

    const handelLogout = () => {
        getCookie('accessToken') && setCookie('accessToken', '', 0);
        getCookie('refreshToken') && setCookie('refreshToken', '', 0);
        sessionStorage.removeItem('USER_INFO');
        sessionStorage.removeItem('NOTIFICATIONS');
        sessionStorage.removeItem('STATE_PAGE');
        socket.disconnect();
    };

    const handelClickNotification = () => {
        setCurrentOption({
            ...currentOption,
            notification: !currentOption.notification,
            newPost: false
        });
    };

    const handelClickNewPost = () => {
        setCurrentOption({
            ...currentOption,
            newPost: !currentOption.newPost,
            notification: false
        });
    };

    const handelClickInbox = () => {
        sessionStorage.setItem('STATE_PAGE', 'inbox');
    };

    const handelClickHome = () => {
        sessionStorage.setItem('STATE_PAGE', 'home');
    };

    const handelClickNotify = (e, notiId, type, userId) => {
        e.stopPropagation();

        if (type.includes('add_friend')) {
            history.push(`/profile/${userId}`);
        } else {
            const checkNotify = async () => {
                try {
                    let res = await friendApi.check({
                        notificationId: notiId
                    });
                    console.log(res);
                    setPostSelected({ isSelected: true, postId: res.post._id });
                    notificationRef.current.classList.remove('notification--open');
                    dispatch(checkNotifications(notiId));
                } catch (error) {
                    console.log(error.message);
                }
            };
            checkNotify();
        }
    };

    const clickAccept = (e, notiId, reqUId, reqUname) => {
        e.stopPropagation();
        const acceptAddFriendRequest = async () => {
            try {
                let res = await friendApi.accept({
                    requestedUserId: reqUId,
                    requestedUsername: reqUname
                });

                if (res.status.includes('success')) {
                    dispatch(checkNotifications(notiId));
                }
            } catch (error) {
                console.log(error.message);
            }
        };
        acceptAddFriendRequest();
    };

    const clickDecline = (e, notiId, reqUId, reqUname) => {
        e.stopPropagation();
        const declineAddFriendRequest = async () => {
            try {
                let res = await friendApi.decline({
                    requestedUserId: reqUId,
                    requestedUsername: reqUname
                });
                if (res.status.includes('success')) {
                    dispatch(checkNotifications(notiId));
                }
            } catch (error) {
                console.log(error.message);
            }
        };
        declineAddFriendRequest();
    };

    console.log(notifications);
    // open drop-down notifications
    clickOutsideRef(notificationContentRef, notificationRef);

    useEffect(() => {
        setNotifications({ ...notificationInit });
    }, [notificationInit]);

    const closePost = useCallback(() => {
        setPostSelected({ isSelected: false, postId: null });
    }, [postSelected]);

    return (
        <>
            <div className="menu">
                <NavLink exact to="/" activeClassName="navLink--active">
                    {statePage.current === 'home' ? (
                        <HomeIcon
                            className={'icon icon--active'}
                            onClick={() => handelClickHome()}
                        />
                    ) : (
                        <HomeOutlinedIcon className={'icon'} onClick={() => handelClickHome()} />
                    )}
                </NavLink>
                <NavLink to="/inbox" activeClassName="navLink--active">
                    {statePage.current === 'inbox' ? (
                        <ChatIcon
                            className={'icon icon--active'}
                            onClick={() => handelClickInbox()}
                        />
                    ) : (
                        <ChatBubbleOutlineOutlinedIcon
                            className={'icon'}
                            onClick={() => handelClickInbox()}
                        />
                    )}
                </NavLink>
                {currentOption.newPost ? (
                    <AddBoxIcon
                        className={'icon icon--active'}
                        onClick={() => handelClickNewPost()}
                    />
                ) : (
                    <AddIcon className={'icon'} onClick={() => handelClickNewPost()} />
                )}

                <div className="notification" ref={notificationRef}>
                    <FavoriteIcon
                        className={'icon icon--active'}
                        onClick={() => handelClickNotification()}
                    />
                    <FavoriteBorderIcon
                        className={'icon icon--dont-active'}
                        onClick={() => handelClickNotification()}
                    />
                    {notifications?.uncheck > 0 && (
                        <span className="notification-quantity">{notifications.uncheck}</span>
                    )}

                    <div className="arrow"></div>
                    <ul className="dropdown dropdown__notification" ref={notificationContentRef}>
                        {notifications?.listNotifications?.length > 0 &&
                            notifications.listNotifications.map(noti => (
                                <li
                                    className={`dropdown__notification-item ${
                                        noti.isChecked ? 'dropdown__notification-item--checked' : ''
                                    } ${
                                        !noti.type.includes('add_friend') ? 'max-width-280px' : ''
                                    }`}
                                    key={noti._id}
                                    onClick={e =>
                                        handelClickNotify(e, noti._id, noti.type, noti.tag)
                                    }>
                                    <ProfilePreview
                                        username={noti.relatedUsers.from}
                                        name={noti.content}
                                        iconSize="medium"
                                        image={
                                            process.env.REACT_APP_STATIC_URL +
                                            `/avatars/${noti.requestedUserId}.png`
                                        }
                                    />
                                    {noti.type.includes('add_friend') && (
                                        <div className="dropdown__notification-item-action">
                                            <button
                                                className="btn btn-accept"
                                                onClick={e =>
                                                    clickAccept(
                                                        e,
                                                        noti._id,
                                                        noti.tag[0],
                                                        noti.relatedUsers.from
                                                    )
                                                }>
                                                Accept
                                            </button>
                                            <button
                                                className="btn btn-decline"
                                                onClick={e =>
                                                    clickDecline(
                                                        e,
                                                        noti._id,
                                                        noti.tag[0],
                                                        noti.relatedUsers.from
                                                    )
                                                }>
                                                Decline
                                            </button>
                                        </div>
                                    )}
                                </li>
                            ))}
                    </ul>
                </div>

                <div className="profile" onClick={() => setIsDropDown(!isDropDown)}>
                    <ProfileIcon
                        iconSize="small"
                        image={process.env.REACT_APP_STATIC_URL + `/avatars/${user._id}.png`}
                    />
                </div>

                <div className={`profile__option ${isDropDown ? 'profile__option--active' : ''}`}>
                    <div className="arrow"></div>
                    <ul className="dropdown">
                        <li>
                            <svg
                                aria-label="Profile"
                                className="_8-yf5 "
                                color="#262626"
                                fill="#262626"
                                height="16"
                                role="img"
                                viewBox="0 0 24 24"
                                width="16">
                                <circle
                                    cx="12.004"
                                    cy="12.004"
                                    fill="none"
                                    r="10.5"
                                    stroke="currentColor"
                                    strokeLinecap="round"
                                    strokeMiterlimit="10"
                                    strokeWidth="2"></circle>
                                <path
                                    d="M18.793 20.014a6.08 6.08 0 00-1.778-2.447 3.991 3.991 0 00-2.386-.791H9.38a3.994 3.994 0 00-2.386.791 6.09 6.09 0 00-1.779 2.447"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeLinecap="round"
                                    strokeMiterlimit="10"
                                    strokeWidth="2"></path>
                                <circle
                                    cx="12.006"
                                    cy="9.718"
                                    fill="none"
                                    r="4.109"
                                    stroke="currentColor"
                                    strokeLinecap="round"
                                    strokeMiterlimit="10"
                                    strokeWidth="2"></circle>
                            </svg>

                            <Link to={`/profile/${user._id}`} className="nav__profile">
                                Profile
                            </Link>
                        </li>
                        <li>
                            <Link to="/login" className="login" onClick={handelLogout}>
                                Log Out
                            </Link>
                        </li>
                    </ul>
                </div>
            </div>
            {currentOption?.newPost && (
                <NewPost
                    handelClickNewPost={handelClickNewPost}
                    username={user.username}
                    iconSize="small"
                    image={user.image}
                />
            )}

            {postSelected.isSelected && (
                <PostDetail postId={postSelected.postId} closePost={closePost} />
            )}
        </>
    );
}

export default Nav;
