import React, { useCallback, useEffect, useRef, useState } from 'react';
import './users.scss';
import Table from '../components/table/Table';

import { userApiAdmin } from '../apis/userApiAdmin';
import Badge from '../components/badge/Badge';
import Profile from '../components/profile/Profile';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import Popup from '../components/popup/Popup';

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

    const fetchUsers = async type => {
        try {
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
    }, [currentPage]);

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
