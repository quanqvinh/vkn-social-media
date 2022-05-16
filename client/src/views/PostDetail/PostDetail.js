import './postDetail.scss';
import React, { useContext, useEffect } from 'react';
import avatar from '../../assets/images/profile.jpg';
import ProfilePreview from '../Profile/ProfilePreview/ProfilePreview';
import { useSelector } from 'react-redux';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import Comment from './Comment/Comment';
import PostMenu from '../Posts/Post/PostMenu';
import { memo } from 'react';
import { useState } from 'react';
import userApi from '../../apis/userApi';
import Slider from 'react-slick';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { SOCKET } from '../../App';
import postApi from '../../apis/postApi';

let checkLoopCmts = false;
const PostDetail = props => {
    const { closePost, postId, owner } = props;
    const [postOwner, setPostOwner] = useState({});
    const [post, setPost] = useState(null);
    const [cmtContent, setCmtContent] = useState('');
    const [receiverReply, setReceiverReply] = useState({});
    const socket = useContext(SOCKET);
    const [listCmts, setListCmts] = useState([]);

    const user = useSelector(state => state.user);
    const handelClosePost = e => {
        if (!e.target.classList.contains('post__overlay')) return;
        closePost();
    };

    useEffect(() => {
        const fetchPost = async () => {
            try {
                let res = await postApi.get(postId);
                console.log('fetch list cmt');
                res.status === 'success' && setPost(res.data);
                setListCmts([...res.data.comments]);
            } catch (error) {
                console.log(error.message);
            }
        };
        fetchPost();
    }, [postId]);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                console.log('call');
                let res = await userApi.getById(post.user._id);
                res && setPostOwner(res.data);
            } catch (error) {
                console.log(error.message);
            }
        };
        fetchUser();
    }, [post]);

    const SlickArrowLeft = ({ currentSlide, slideCount, ...props }) => (
        <button
            {...props}
            className={'slick-prev slick-arrow' + (currentSlide === 0 ? ' slick-disabled' : '')}
            aria-hidden="true"
            aria-disabled={currentSlide === 0 ? true : false}
            type="button">
            <ArrowBackIosNewIcon sx={{ fontSize: 40 }} />
        </button>
    );
    const SlickArrowRight = ({ currentSlide, slideCount, ...props }) => (
        <button
            {...props}
            className={
                'slick-next slick-arrow' +
                (currentSlide === slideCount - 1 ? ' slick-disabled' : '')
            }
            aria-hidden="true"
            aria-disabled={currentSlide === slideCount - 1 ? true : false}
            type="button">
            <ArrowForwardIosIcon sx={{ fontSize: 40 }} />
        </button>
    );

    const settings = {
        dots: true,
        infinite: true,
        speed: 300,
        slidesToShow: 1,
        slidesToScroll: 1,
        nextArrow: <SlickArrowRight />,
        prevArrow: <SlickArrowLeft />
    };

    const handelReply = receiver => {
        setCmtContent(`@${receiver.commentOwnerUsername} `);
        setReceiverReply({
            ...receiver,
            postId: post._id,
            postOwnerId: post.user._id,
            postOwnerUsername: post.user.username
        });
    };

    const handelSendCmt = () => {
        if (cmtContent && !socket) return;

        if (JSON.stringify(receiverReply) !== '{}') {
            console.log('send reply', socket);
            socket.emit('post:reply_comment', {
                ...receiverReply,
                content: cmtContent.split(' ')[1]
            });

            const newListCmts = listCmts.map(cmt => {
                if (cmt._id === receiverReply.commentId) {
                    console.log('ahihi');
                    cmt.replies = [
                        ...cmt.replies,
                        {
                            commentBy: {
                                _id: receiverReply.commentOwnerId,
                                username: receiverReply.commentOwnerUsername
                            },
                            content: cmtContent.split(' ')[1],
                            createdAt: new Date().toLocaleString(),
                            _id: Date.now()
                        }
                    ];
                }
                return cmt;
            });
            setListCmts([...newListCmts]);
            setReceiverReply({});
            setCmtContent('');
        } else {
            console.log('send cmt', socket);

            socket.emit('post:comment_post', {
                postId: post._id,
                postOwnerId: post.user._id,
                postOwnerUsername: post.user.username,
                content: cmtContent
            });
            setListCmts([
                ...listCmts,
                {
                    commentBy: {
                        _id: user._id,
                        username: user.username
                    },
                    content: cmtContent,
                    createdAt: new Date().toLocaleString(),
                    _id: Date.now()
                }
            ]);
            setCmtContent('');
        }
    };

    useEffect(() => {
        socket &&
            socket.on('post:print_comment', payload => {
                setListCmts([
                    ...listCmts,
                    {
                        ...payload.comment,
                        commentBy: {
                            _id: payload.commentedUserId,
                            username: payload.commentedUsername
                        },
                        createdAt: new Date().toLocaleString()
                    }
                ]);
            });
    }, [socket, listCmts]);

    useEffect(() => {
        socket &&
            socket.on('post:print_reply', payload => {
                console.log('print reply', payload);
                if (!(listCmts.length > 0)) {
                    console.log('lengt < 0');
                    return;
                }

                const newListCmts = [];
                console.log('listcmt', listCmts);
                for (let i = 0; i < listCmts.length; i++) {
                    if (listCmts[i]._id !== payload.commentId) {
                        newListCmts.push(listCmts[i]);
                        console.log('k bang id');
                        continue;
                    }
                    if (listCmts[i].replies.some(reply => reply._id === payload.reply._id)) {
                        newListCmts.push(listCmts[i]);
                        continue;
                    }

                    listCmts[i].replies = [
                        ...listCmts[i].replies,
                        {
                            replyBy: payload.repliedUserId,
                            username: payload.repliedUsername,
                            content: payload.reply.content,
                            createdAt: new Date().toLocaleString(),
                            _id: payload.reply._id
                        }
                    ];

                    newListCmts.push(listCmts[i]);
                }
                setListCmts([...newListCmts]);
            });
    }, [socket, listCmts]);

    console.log('list cmt', listCmts);
    return (
        <>
            <div className="post__overlay" onClick={handelClosePost}>
                {post && (
                    <div className="post-detail__container">
                        <div className="post__left">
                            <Slider {...settings} className="post__body-img">
                                {post.imgs?.length > 0 &&
                                    post.imgs.map(img => (
                                        <img
                                            style={{ width: 690, height: 690 }}
                                            key={img}
                                            src={
                                                process.env.REACT_APP_STATIC_URL +
                                                `/posts/${post._id}/${img}`
                                            }
                                            alt="postImg"
                                        />
                                    ))}
                            </Slider>
                        </div>

                        <div className="post__right">
                            <div className="right__header">
                                {postOwner._id && (
                                    <>
                                        <ProfilePreview
                                            username={postOwner.username}
                                            iconSize="medium"
                                            image={
                                                process.env.REACT_APP_STATIC_URL +
                                                `/avatars/${postOwner._id}.png`
                                            }
                                        />
                                        <MoreHorizIcon className="right__header-options" />
                                    </>
                                )}
                            </div>
                            <div className="right__body">
                                <div className="right__body-list-messages">
                                    <>
                                        <div className="message">
                                            <Comment user={postOwner} caption={post.caption} />
                                        </div>
                                    </>
                                    {listCmts?.length > 0 &&
                                        listCmts.map((cmt, index) => (
                                            <div className="message" key={cmt._id}>
                                                <Comment cmt={cmt} handelReply={handelReply} />
                                                <div className="message-list-reply">
                                                    {/* <span className={`message-view-reply`}>
                                                        <span></span>
                                                        View more {cmt?.replies?.length} replies
                                                    </span> */}
                                                    {cmt?.replies?.length > 0 &&
                                                        cmt.replies.map(reply => (
                                                            <>
                                                                <Comment
                                                                    cmt={reply}
                                                                    key={reply._id}
                                                                    disableReply={true}
                                                                />
                                                            </>
                                                        ))}
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            </div>
                            <div className="right__footer">
                                <div className="footer__header">
                                    <PostMenu />
                                    <div className="footer__title">
                                        <p>
                                            Liked by <span>trungkien</span> and{' '}
                                            <span>19 others</span>
                                        </p>
                                        <p className="footer__title-time">{post.createdAt}</p>
                                    </div>
                                </div>
                                <div className="footer__input">
                                    <input
                                        value={cmtContent}
                                        type="text"
                                        placeholder="Add a comment..."
                                        onChange={e => setCmtContent(e.target.value)}
                                    />
                                    <span className="footer__input-post" onClick={handelSendCmt}>
                                        Post
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default memo(PostDetail);
