import React, { useState } from 'react';
import './newPost.scss';
import ProfilePreview from '../Profile/ProfilePreview/ProfilePreview';
import { ReactComponent as PostImg } from '../../assets/images/postImg.svg';
import Slider from 'react-slick';

import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

import postApi from '../../apis/postApi';
import { useSelector } from 'react-redux';

const NewPost = props => {
    const { iconSize, handelClickNewPost } = props;
    const [selectImgs, setSelectImgs] = useState({
        isImgFilled: false,
        imgs: [],
        fileImgs: null
    });
    const user = useSelector(state => state.user);

    const [caption, setCaption] = useState('');

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

    const handelUpLoadImg = e => {
        let files = e.target.files;
        if (!e.target.files?.length > 0) return;

        let imgs = [];
        for (let i = 0; i < files.length; i++) {
            var binaryData = [];
            binaryData.push(files[i]);
            let tmp = window.URL.createObjectURL(new Blob(binaryData, { type: 'application/zip' }));
            imgs.push(tmp);
        }

        setSelectImgs({
            isImgFilled: true,
            imgs,
            fileImgs: files
        });
    };

    const handelSubmit = () => {
        const formData = new FormData();
        for (const img of selectImgs.fileImgs) {
            formData.append('images', img);
        }

        formData.append('caption', caption);

        const addPost = async () => {
            try {
                let res = await postApi.add(formData);
                console.log(res);
            } catch (error) {
                console.log(error.message);
            }
        };
        addPost();
        handelClickNewPost();
        window.location.reload();
    };

    return (
        <>
            <div className="over-lay" onClick={handelClickNewPost}></div>
            <div className="post-container">
                <div className="post__header">
                    <p className="post__header-title">Create New Post</p>
                    <span className="post__header-share" onClick={() => handelSubmit()}>
                        Share
                    </span>
                </div>
                <div className="post__body">
                    {!selectImgs.isImgFilled ? (
                        <div className="post__body-remind">
                            <PostImg />
                            <p className="post__body-remind-title">Drag photos here</p>
                            <input
                                multiple
                                hidden
                                type="file"
                                id="select-img"
                                accept="image/*"
                                onChange={e => handelUpLoadImg(e)}
                            />
                            <label htmlFor="select-img" className="post__body-remind-select">
                                Select from computer
                            </label>
                        </div>
                    ) : (
                        <Slider {...settings} className="post__body-img">
                            {selectImgs?.imgs?.length > 0 &&
                                selectImgs.imgs.map((img, index) => (
                                    <img key={index} src={`${img}`} alt="postImg" />
                                ))}
                        </Slider>
                    )}

                    <div className="post__body-content">
                        <ProfilePreview
                            name={user.name}
                            username={user.username}
                            iconSize={iconSize}
                            image={process.env.REACT_APP_STATIC_URL + `/avatars/${user._id}.png`}
                        />
                        <textarea
                            aria-label="Write a caption..."
                            placeholder="Write a caption..."
                            className="post__body-content-caption"
                            autoComplete="off"
                            autoCorrect="off"
                            value={caption}
                            onChange={e => setCaption(e.target.value)}></textarea>
                    </div>
                </div>
            </div>
        </>
    );
};

export default NewPost;
