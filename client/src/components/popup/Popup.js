import React, { useEffect, useRef } from 'react';
import './popup.scss';
import postApi from '../../apis/postApi';

const Popup = props => {
    const { title, ok, cancel, element, userId, postId } = props;

    const popupRef = useRef(null);

    useEffect(() => {
        popupRef.current.classList.add('overlay-popup--open');

        // popupRef.current.style.top = `${element.offsetTop + 40}px`;
        // setTimeout(() => {
        //     popupRef.current.classList.add('popup__container--open');
        // }, 160);
    }, [element]);

    const handelDelete = () => {
        if (userId) {
            console.log(userId);
        } else {
            deletePost(postId);
        }
    };

    const deletePost = async postId => {
        try {
            let res = await postApi.delete(postId);
            console.log(res);
        } catch (error) {
            console.log(error.message);
        }
    };
    return (
        <div className="overlay-popup" ref={popupRef}>
            <div className="popup__container">
                <div className="title">{title}</div>
                <div className="action">
                    <button className={`btn btn--${ok}`} onClick={handelDelete}>
                        {ok}
                    </button>
                    <button
                        className={`btn btn--${cancel}`}
                        onClick={() => popupRef.current.classList.remove('overlay-popup--open')}>
                        {cancel}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Popup;
