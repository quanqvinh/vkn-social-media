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
        userId: null
    });
    const [isDelete, setIsDelete] = useState({
        state: false,
        e: null,
        userId: null
    });
    const [currentPage, setCurrentPage] = useState(1);

    const renderHead = (item, index) => <th key={index}>{item}</th>;

    const renderBody = (item, index) => (
        <tr
            key={index}
            onClick={() =>
                setIsSelectUser({
                    isSelect: true,
                    userId: item._id
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
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                let res = await userApiAdmin.getAll({
                    numberRowPerPage: 5,
                    pageNumber: currentPage
                });
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
        fetchUsers();
    }, [currentPage]);

    const changePage = newPage => {
        setCurrentPage(newPage);
    };

    return (
        <>
            <div>
                <h2 className="page-header">customers</h2>
                <div className="row">
                    <div className="col-12">
                        <div className="card-admin">
                            <div className="card__body">
                                {users?.body?.length > 0 && (
                                    <Table
                                        pageRange={users.pageRange || 2}
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
            {isSelectUser.isSelect && <Profile userId={isSelectUser.userId} />}
        </>
    );
};

export default Users;
