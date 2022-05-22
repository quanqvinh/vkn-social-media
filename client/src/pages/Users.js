import React, { useCallback, useEffect, useRef, useState } from 'react';
import './users.scss';
import Table from '../components/table/Table';

import { userApiAdmin } from '../apis/userApiAdmin';
import Badge from '../components/badge/Badge';
import Profile from '../components/profile/Profile';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import Popup from '../components/popup/Popup';

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

const Users = () => {
    const [users, setUsers] = useState([]);
    const [isSelectUser, setIsSelectUser] = useState({
        isSelect: false,
        userId: null,
        element: null
    });
    const [isDelete, setIsDelete] = useState({
        state: false,
        e: null,
        userId: null
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [searchKeyWords, setSearchKeyWords] = useState('');
    const [refetch, setRefetch] = useState(false);
    const [open, setOpen] = useState(false);
    const notificationRef = useRef(null);
    const [formInfos, setFormInfos] = useState({
        role: 'Admin'
    });

    const handleOpen = () => setOpen(true);
    const handleClose = () => {
        setOpen(false);
        setFormInfos({});
    };

    const renderHead = (item, index) => <th key={index}>{item}</th>;

    const renderBody = (item, index) => (
        <tr
            key={index}
            onClick={e =>
                setIsSelectUser({
                    isSelect: true,
                    userId: item._id,
                    element: e.target
                })
            }>
            <td>{index + 1}</td>
            <td>{item.username}</td>
            <td>{item.email}</td>
            <td>{item.friends}</td>
            <td>{item.posts}</td>
            <td>
                <Badge type={item.state} content={item.state} />
            </td>
            <td
                onClick={e => deleteUser(e, item._id)}
                style={{
                    display: 'block',
                    cursor: 'pointer',
                    color: 'var(--main-color-red)'
                }}>
                <DeleteForeverIcon />
            </td>
        </tr>
    );

    const deleteUser = (e, id) => {
        e.stopPropagation();
        setIsDelete({
            state: true,
            e: e.target.closest('td'),
            userId: id
        });
    };

    const refetchUsers = () => {
        setRefetch(!refetch);
    };

    const fetchUsers = async type => {
        try {
            if (searchKeyWords) return;
            let res;
            switch (type) {
                case 'active':
                    res = await userApiAdmin.getAll({
                        numberRowPerPage: 5,
                        pageNumber: currentPage
                    });
                    break;
                default:
                    res = await userApiAdmin.getAllDisable({
                        numberRowPerPage: 5,
                        pageNumber: currentPage
                    });
                    break;
            }

            console.log(res);
            setUsers({
                head: ['', 'username', 'email', 'friends', 'posts', 'state', 'action'],
                body: [
                    ...res.data.map(user => {
                        return {
                            _id: user._id,
                            username: user.username,
                            email: user.email,
                            friends: user.numberOfFriends,
                            posts: user.numberOfPosts,
                            state: user.isDisabled ? 'disable' : 'active'
                        };
                    })
                ],
                pageRange: res.numberOfPages
            });
        } catch (error) {
            console.log(error.message);
        }
    };

    useEffect(() => {
        fetchUsers('active');
    }, [currentPage, refetch, searchKeyWords]);

    const changePage = newPage => {
        setCurrentPage(newPage);
    };

    const chooseState = e => {
        if (activeRef.current.contains(e.target)) {
            disableRef.current.classList.remove('state--active');
            activeRef.current.classList.add('state--active');
            fetchUsers('active');
        } else {
            activeRef.current.classList.remove('state--active');
            disableRef.current.classList.add('state--active');
            fetchUsers('disable');
        }
    };

    const activeRef = useRef();
    const disableRef = useRef();
    const debounceRef = useRef(null);

    const handelSearch = e => {
        setSearchKeyWords(e.target.value);
        const search = async () => {
            try {
                if (!e.target.value) return;
                let res = await userApiAdmin.searchActive({
                    keyword: e.target.value,
                    numberRowPerPage: 5,
                    pageNumber: currentPage
                });
                console.log(res);
                setUsers({
                    head: [...users.head],
                    body: [
                        ...res.data.map(user => {
                            return {
                                _id: user._id,
                                username: user.username,
                                email: user.email,
                                friends: user.numberOfFriends,
                                posts: user.numberOfPosts,
                                state: user.isDisabled ? 'disable' : 'active'
                            };
                        })
                    ],
                    pageRange: res.numberOfPages
                });
            } catch (error) {
                console.log(error.message);
            }
        };

        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }
        debounceRef.current = setTimeout(() => {
            search();
        }, 300);
    };

    const handelAddUser = () => {
        const addUser = async () => {
            let { email, username, name, role } = formInfos;
            if (!email || !username || !name || !role) {
                notificationRef.current.innerHTML = 'Please fill in all fields';
                return;
            }

            try {
                let res = await userApiAdmin.add({
                    username,
                    email,
                    name,
                    isAdmin: role === 'Admin' ? true : false
                });
                console.log(res);
                notificationRef.current.innerHTML = `Account has been sent to ${email}`;
                notificationRef.current.style.color = 'green';

                setTimeout(() => {
                    handleClose();
                }, 500);
            } catch (error) {
                console.log(error.response.data.message);
                if (error.response.data.message.includes('username')) {
                    notificationRef.current.innerHTML = 'This username already in use';
                } else {
                    notificationRef.current.innerHTML = 'This email already in use';
                }
            }
        };
        addUser();
    };

    return (
        <>
            <div>
                <div className="topnav__search">
                    <input
                        value={searchKeyWords}
                        onChange={e => handelSearch(e)}
                        type="text"
                        placeholder="Search here..."
                    />
                    <i className="bx bx-search"></i>
                </div>
                <h2 className="page-header">users</h2>
                <div className="row">
                    <div className="action-container col-12">
                        <span
                            ref={activeRef}
                            className="state state--active"
                            onClick={e => chooseState(e)}>
                            active
                        </span>
                        <span ref={disableRef} className="state" onClick={e => chooseState(e)}>
                            disable
                        </span>
                        <span className="state" onClick={handleOpen}>
                            New User
                        </span>
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
                                        <label className="forgot__label">Email:</label>
                                        <input
                                            onChange={e =>
                                                setFormInfos({
                                                    ...formInfos,
                                                    email: e.target.value
                                                })
                                            }
                                            value={formInfos.email || ''}
                                            type="text"
                                            className="forgot__email"
                                            placeholder="Email"
                                        />
                                    </div>
                                    <div className="forgot__content-item">
                                        <label className="forgot__label">Username:</label>
                                        <input
                                            onChange={e =>
                                                setFormInfos({
                                                    ...formInfos,
                                                    username: e.target.value
                                                })
                                            }
                                            value={formInfos.username || ''}
                                            type="text"
                                            className="forgot__email"
                                            placeholder="Username"
                                        />
                                    </div>
                                    <div className="forgot__content-item">
                                        <label className="forgot__label">Name:</label>
                                        <input
                                            onChange={e =>
                                                setFormInfos({ ...formInfos, name: e.target.value })
                                            }
                                            value={formInfos.name || ''}
                                            type="text"
                                            className="forgot__email"
                                            placeholder="Name"
                                        />
                                    </div>
                                    <div className="forgot__content-item">
                                        <label className="forgot__label">Role:</label>
                                        <select
                                            className="forgot__email"
                                            value={formInfos.gender || 'Admin'}
                                            onChange={e =>
                                                setFormInfos({
                                                    ...formInfos,
                                                    gender: e.target.value
                                                })
                                            }>
                                            <option value="male">Admin</option>
                                            <option value="female">User</option>
                                        </select>
                                    </div>
                                </div>
                                <button className="forgot__send" onClick={handelAddUser}>
                                    Add
                                </button>
                            </Box>
                        </Modal>
                    </div>
                    <div className="col-12">
                        <div className="card-admin">
                            <div className="card__body">
                                {users?.body?.length > 0 && (
                                    <Table
                                        pageRange={users.pageRange}
                                        headData={users.head}
                                        renderHead={(item, index) => renderHead(item, index)}
                                        bodyData={users.body}
                                        renderBody={(item, index) => renderBody(item, index)}
                                        changePage={changePage}
                                    />
                                )}
                            </div>
                            {isDelete.state && (
                                <Popup
                                    title="This action will delete this user forever"
                                    ok="delete"
                                    cancel="cancel"
                                    element={isDelete.e}
                                    userId={isDelete.userId}
                                    refetchUsers={refetchUsers}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>
            {isSelectUser.isSelect && (
                <Profile userId={isSelectUser.userId} element={isSelectUser.element} />
            )}
        </>
    );
};

export default Users;
