import React, { useEffect, useRef } from 'react';
import './popup.scss';
import postApi from '../../apis/postApi';
import { userApiAdmin } from '../../apis/userApiAdmin';
import { postApiAdmin } from '../../apis/postApiAdmin';

const Popup = props => {
    const {
        title,
        ok,
        cancel,
        element,
        userId,
        postId,
        refetchUsers,
        refetchProfile,
        refetchPosts
    } = props;

    const popupRef = useRef(null);

    useEffect(() => {
        popupRef.current.classList.add('overlay-popup--open');
    }, [element]);

    const handelDelete = () => {
        if (userId) {
            deleteUser(userId);
        } else {
            deletePost(postId);
        }
    };

    const deleteUser = async userId => {
        try {
            await userApiAdmin.delete(userId);
            refetchUsers();
            popupRef.current.classList.remove('overlay-popup--open');
        } catch (error) {
            console.log(error.message);
        }
    };

    const deletePost = async postId => {
        try {
            let res = await postApiAdmin.delete(postId);
            refetchPosts !== undefined ? refetchPosts() : refetchProfile();
            popupRef.current.classList.remove('overlay-popup--open');
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
