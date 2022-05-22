import React, { useEffect, useState, useRef } from 'react';
import './profile.scss';
import avaDefault from '../../assets/images/avatar_default.png';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelIcon from '@mui/icons-material/Cancel';
import { userApiAdmin } from '../../apis/userApiAdmin';
import Table from '../table/Table';
import CloseIcon from '@mui/icons-material/Close';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import Popup from '../popup/Popup';

const Profile = ({ userId, element }) => {
    const [user, setUser] = useState(null);
    const [posts, setPosts] = useState([]);
    const [isDelete, setIsDelete] = useState({
        state: false,
        e: null,
        userId: null
    });
    const [refetch, setRefetch] = useState(false);

    const renderHead = (item, index) => <th key={index}>{item}</th>;

    const renderBody = (item, index) => (
        <tr key={index}>
            <td>{index + 1}</td>
            <td>{item.caption}</td>
            <td>{item.likes}</td>
            <td>{item.comments}</td>
            <td>{item.reports}</td>
            <td
                onClick={e => deletePost(e, item._id)}
                style={{
                    cursor: 'pointer',
                    color: 'var(--main-color-red)'
                }}>
                <DeleteForeverIcon />
            </td>
        </tr>
    );

    const deletePost = (e, id) => {
        e.stopPropagation();
        setIsDelete({
            state: true,
            e: e.target.closest('td'),
            postId: id
        });
    };

    const refetchProfile = () => {
        setRefetch(!refetch);
    };

    useEffect(() => {
        const fetchUser = async () => {
            try {
                let res = await userApiAdmin.getById(userId);
                setUser(res.data);
                console.log(res);
                setPosts({
                    head: ['', 'caption', 'likes', 'comments', 'reports', 'action'],
                    body: [
                        ...res.data.posts.map(post => {
                            return {
                                _id: post._id,
                                caption: post.caption,
                                likes: post.numberOfLikes,
                                comments: post.numberOfComments,
                                reports: post.numberOfReports
                            };
                        })
                    ]
                });
            } catch (error) {
                console.log(error.message);
            }
        };
        fetchUser();
    }, [userId, refetch]);

    const profileRef = useRef([]);
    useEffect(() => {
        profileRef.current.classList.add('profile__container--open');
    }, [element]);

    const closeProfile = () => {
        profileRef.current.classList.remove('profile__container--open');
        setPosts({
            body: []
        });
    };

    const setDefaultAva = e => {
        console.clear();
        e.target.src = avaDefault;
    };

    const handelCheckState = () => {
        const disableUser = async () => {
            try {
                await userApiAdmin.disable(user._id);
                setUser({ ...user, disabled: !user.disabled });
            } catch (error) {
                console.log(error.message);
            }
        };
        disableUser();
    };

    return (
        <div className={`profile__container`} ref={profileRef}>
            {user && (
                <>
                    <div className="profile__header">
                        <CloseIcon className="profile__btn-close" onClick={() => closeProfile()} />
                        <div className="header-avatar">
                            <img
                                onError={e => setDefaultAva(e)}
                                src={process.env.REACT_APP_STATIC_URL + `/avatars/${user._id}.png`}
                                alt="avatar"
                            />
                        </div>
                        <div className="header__name">
                            <h1 className="name">{user.username}</h1>
                            <div className="state">
                                {user.disabled ? (
                                    <CancelIcon className="state--disable" />
                                ) : (
                                    <CheckCircleOutlineIcon className="state--active" />
                                )}
                                <span className="state__description">
                                    {user.disabled ? 'disable' : 'active'}
                                </span>
                            </div>
                            <label className="switch">
                                <input
                                    type="checkbox"
                                    checked={user.disabled ? false : true}
                                    onChange={handelCheckState}
                                />
                                <span className="slider round"></span>
                            </label>
                        </div>
                        <div className="header__email">
                            <h1 className="email">{user.email}</h1>
                        </div>
                        <div className="header__related">
                            <div className="row">
                                <div className="related col-2">
                                    <span className="related__label">Posts</span>
                                    <span className="related__description">
                                        {user.numberOfPosts}
                                    </span>
                                </div>
                                <div className="related col-2">
                                    <span className="related__label">Friends</span>
                                    <span className="related__description">
                                        {user.numberOfFriends}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="profile__content">
                        <h2 className="content-header">Posts</h2>
                        <div className="row">
                            <div className="col-12">
                                <div className="card-admin">
                                    <div className="card__body">
                                        {posts?.body?.length > 0 && (
                                            <Table
                                                limit="10"
                                                headData={posts.head}
                                                renderHead={(item, index) =>
                                                    renderHead(item, index)
                                                }
                                                bodyData={posts.body}
                                                renderBody={(item, index) =>
                                                    renderBody(item, index)
                                                }
                                            />
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    {isDelete.state && (
                        <Popup
                            title="This action will delete this post forever"
                            ok="delete"
                            cancel="cancel"
                            element={isDelete.e}
                            postId={isDelete.postId}
                            refetchProfile={refetchProfile}
                        />
                    )}
                </>
            )}
        </div>
    );
};

export default Profile;
