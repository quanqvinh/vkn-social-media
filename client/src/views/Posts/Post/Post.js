import './post.scss';
import ProfilePreview from '../../Profile/ProfilePreview/ProfilePreview';
import { ReactComponent as PostButton } from '../../../assets/images/cardButton.svg';
import PostMenu from './PostMenu';
import Comment from './Comment';
import Slider from 'react-slick';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { useRef, useState, useContext, useCallback } from 'react';
import PostDetail from '../../PostDetail/PostDetail';
import { SOCKET } from '../../../App';
import postApi from '../../../apis/postApi';
import env from 'react-dotenv';

const $ = document.querySelector.bind(document);
const dataReport = [
    'Why are you reporting this post?',
    "It's spam",
    'Nudity or sexual activity',
    'Hate speech or symbols',
    'Violence or dangerous organization',
    'Sale of illegal or regulated goods',
    'Bullying or harassment',
    'Intellectual property violation'
];
function Post(props) {
    const { post, avatar, id, storyBorder, imgs, likedByNumber, hours, accountName, content } =
        props;

    const socket = useContext(SOCKET);
    const [like, setLike] = useState(likedByNumber);
    const [isShowPost, setIsShowPost] = useState(false);
    const notifyRef = useRef(null);
    const modalRef = useRef(null);
    const overlayRef = useRef(null);

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

    const handelViewPostDetail = () => {
        if (!isShowPost) {
            console.log('join', socket);
            socket.emit('post:join_post_room', { postId: post._id });
        } else {
            console.log('leave', socket);

            socket.emit('post:leave_post_room', { postId: post._id });
        }
        setIsShowPost(!isShowPost);
    };

    const handelLikePost = useCallback(
        newLike => {
            if (like < newLike) {
                console.log('like_post', socket);
                console.log(post.user);
                socket &&
                    socket.emit('post:like_post', {
                        postId: post._id,
                        postOwnerId: post.user
                    });
            }
            setLike(newLike);
        },
        [socket, like, post._id, post.user]
    );

    const openModal = () => {
        modalRef.current.classList.add('modal--open');
        overlayRef.current.classList.add('overlay--open');
    };

    const closeModal = () => {
        notifyRef.current.innerText = '';
        modalRef.current.classList.remove('modal--open');
        overlayRef.current.classList.remove('overlay--open');
    };

    const handelClickReport = data => {
        const reportPost = async () => {
            try {
                await postApi.report({ postId: post._id, content: data });
                notifyRef.current.classList.add('modal__notify--success');
                notifyRef.current.innerText = 'Reported success';
                setTimeout(() => {
                    closeModal();
                }, 2000);
            } catch (error) {
                console.log(error.message);
                notifyRef.current.innerText = 'You had reported this post before';
            }
        };
        reportPost();
    };
    return (
        <div className="card-post">
            <div className="overlay" onClick={closeModal} ref={overlayRef}></div>
            <div className="modal" ref={modalRef}>
                <p className="modal__title">Report</p>
                <p className="modal__notify" ref={notifyRef}></p>
                {dataReport?.length > 0 &&
                    dataReport.map(data => (
                        <label
                            htmlFor="input-file-avatar"
                            className="modal__upload"
                            onClick={() => handelClickReport(data)}>
                            {data}
                        </label>
                    ))}
            </div>
            <header>
                <ProfilePreview
                    userId={post.user}
                    image={avatar}
                    iconSize="medium"
                    storyBorder={storyBorder}
                    username={post.username}
                />
                <PostButton className="cardButton" onClick={() => openModal()} />
            </header>
            <Slider {...settings} className="post__body-img cardImage">
                {imgs?.length > 0 &&
                    imgs.map((img, index) => (
                        <img
                            style={{ height: 600 }}
                            onClick={handelViewPostDetail}
                            key={index}
                            src={process.env.REACT_APP_STATIC_URL + `/posts/${id}/${img}`}
                            alt="postImg"
                        />
                    ))}
            </Slider>
            <PostMenu postId={post._id} handelLikePost={handelLikePost} like={like} />
            <div className="likedBy">
                <span>
                    {like} {like > 1 ? 'likes' : 'like'}
                </span>
            </div>
            <div className="post__author">
                <span className="post__author-username">{accountName}</span>
                <span className="post__author-content">{content}</span>
            </div>
            <div className="timePosted">{hours} hours ago</div>
            {isShowPost && <PostDetail postId={post._id} closePost={handelViewPostDetail} />}
        </div>
    );
}

export default Post;
