import './postDetail.scss';
import React, { useEffect } from 'react';
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

const PostDetail = props => {
    const { closePost, post, owner } = props;
    console.log(post);
    const [postOwner, setPostOwner] = useState({});

    const handelClosePost = e => {
        if (!e.target.classList.contains('post__overlay')) return;
        closePost();
    };
    const user = useSelector(state => state.user);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                let res = await userApi.getById(post.user);
                res && setPostOwner(res.data);
            } catch (error) {
                console.log(error.message);
            }
        };
        fetchUser();
    }, []);

    const SlickArrowLeft = ({ currentSlide, slideCount, ...props }) => (
        <button
            {...props}
            className={
                'slick-prev slick-arrow' +
                (currentSlide === 0 ? ' slick-disabled' : '')
            }
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

    return (
        <>
            <div className="post__overlay" onClick={handelClosePost}>
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

                    {/* <div className="post__left">

                  <img src={avatar} alt="postImgs" />
               </div> */}
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
                                        <Comment
                                            user={postOwner}
                                            caption={post.caption}
                                        />
                                    </div>
                                </>
                                {Array(3)
                                    .fill(0)
                                    .map((v, i) => (
                                        <div className="message" key={i}>
                                            <Comment user={postOwner} />

                                            <div className="message-list-reply">
                                                <Comment
                                                    user={postOwner}
                                                    hideSubComments={true}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                {/* {post?.comments?.length > 0 &&
                           post.comments.map((comment) => (
                              <div className="message" key={comment._id}>
                                 <Comment user={user} />
                                 <div className="message-list-reply">
                                    <Comment
                                       user={user}
                                       hideSubComments={true}
                                    />
                                 </div>
                              </div>
                           ))} */}
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
                                    <p className="footer__title-time">
                                        {post.createdAt}
                                    </p>
                                </div>
                            </div>
                            <div className="footer__input">
                                <input
                                    type="text"
                                    placeholder="Add a comment..."
                                />
                                <span className="footer__input-post">Post</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default memo(PostDetail);
