import React, { useEffect, useRef, useState } from 'react';
import './users.scss';
import Table from '../components/table/Table';

import { userApiAdmin } from '../apis/userApiAdmin';
import Badge from '../components/badge/Badge';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import Popup from '../components/popup/Popup';
import { postApiAdmin } from '../apis/postApiAdmin';
const Posts = () => {
    const [posts, setPosts] = useState([]);
    const [isSelectPost, setIsSelectPost] = useState({
        isSelect: false,
        postId: null,
        element: null
    });

    const [isDelete, setIsDelete] = useState({
        state: false,
        e: null,
        postId: null
    });

    const [currentPage, setCurrentPage] = useState(1);
    const [searchKeyWords, setSearchKeyWords] = useState('');

    const renderHead = (item, index) => <th key={index}>{item}</th>;

    const renderBody = (item, index) => (
        <tr key={index}>
            <td>{index + 1}</td>
            <td>{item.author}</td>
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

    const [refetch, setRefetch] = useState(false);

    const refetchPosts = () => {
        setRefetch(!refetch);
    };

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                let res = await postApiAdmin.getAll({
                    numberRowPerPage: 5,
                    pageNumber: currentPage
                });

                console.log(res);
                setPosts({
                    head: ['', 'author', 'caption', 'likes', 'comments', 'reports', 'action'],
                    body: [
                        ...res.data.map(post => {
                            return {
                                _id: post._id,
                                author: post.user.username,
                                caption: post.caption,
                                likes: post.numberOfLikes,
                                comments: post.numberOfComments,
                                reports: post.numberOfReports
                            };
                        })
                    ],
                    pageRange: res.numberOfPages
                });
            } catch (error) {
                console.log(error.message);
            }
        };
        fetchPosts();
    }, [currentPage, refetch]);

    const changePage = newPage => {
        setCurrentPage(newPage);
    };

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
                setPosts({
                    head: [...posts.head],
                    body: [
                        ...res.data.map(post => {
                            return {
                                _id: post._id,
                                author: post.user.username,
                                caption: post.caption,
                                likes: post.numberOfLikes,
                                comments: post.numberOfComments,
                                reports: post.numberOfReports
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

            <h2 className="page-header">Posts</h2>
            <div className="row">
                <div className="col-12">
                    <div className="card-admin">
                        <div className="card__body">
                            {posts?.body?.length > 0 && (
                                <Table
                                    pageRange={posts.pageRange}
                                    headData={posts.head}
                                    renderHead={(item, index) => renderHead(item, index)}
                                    bodyData={posts.body}
                                    renderBody={(item, index) => renderBody(item, index)}
                                    changePage={changePage}
                                />
                            )}
                        </div>
                        {isDelete.state && (
                            <Popup
                                title="This action will delete this post forever"
                                ok="delete"
                                cancel="cancel"
                                element={isDelete.e}
                                postId={isDelete.postId}
                                refetchPosts={refetchPosts}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Posts;
