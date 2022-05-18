import React, { useEffect, useRef } from 'react';
import './popup.scss';
const Popup = props => {
    const { title, ok, cancel, element, userId } = props;

    const popupRef = useRef(null);

    useEffect(() => {
        popupRef.current.style.top = `${element.offsetTop + 40}px`;
        setTimeout(() => {
            popupRef.current.classList.add('popup__container--open');
        }, 160);
    }, [element]);

    const handelDeleteUser = () => {
        console.log(userId);
    };
    return (
        <div className="popup__container" ref={popupRef}>
            <div className="title">{title}</div>
            <div className="action">
                <button className={`btn btn--${ok}`} onClick={handelDeleteUser}>
                    {ok}
                </button>
                <button
                    className={`btn btn--${cancel}`}
                    onClick={() => popupRef.current.classList.remove('popup__container--open')}>
                    {cancel}
                </button>
            </div>
        </div>
    );
};

export default Popup;
