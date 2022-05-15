import React from 'react';
import ProfilePreview from '../../Profile/ProfilePreview/ProfilePreview';
import avatar from '../../../assets/images/profile.jpg';
import './comment.scss';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';

const Comment = props => {
    const { user, hideSubComments, caption, cmt } = props;

    const ownUser = caption ? user : cmt.commentBy;
    const cmtContent = caption ? caption : cmt.content;
    return (
        <div className="message-container">
            <ProfilePreview
                username={ownUser.username}
                iconSize="medium"
                image={
                    process.env.REACT_APP_STATIC_URL +
                    `/avatars/${ownUser._id}.png`
                }
                hideAccountName={true}
            />
            <div
                className={`message__content ${
                    caption ? 'message__content--caption' : ''
                }`}>
                <div className={`message__content-header`}>
                    <span className="username">{ownUser.username}</span>
                    {cmtContent}
                </div>

                {!caption && (
                    <>
                        <div className="message__content-footer">
                            <span className="message-footer-time">
                                {cmt.createdAt}
                            </span>
                            <span className="message-footer-reply">Reply</span>
                            <MoreHorizIcon className="message-footer-option" />
                        </div>
                        {/* <span
                            className={`message-view-reply ${
                                hideSubComments ? 'display-none' : ''
                            } `}>
                            <span></span>
                        </span> */}
                    </>
                )}
            </div>
        </div>
    );
};

export default Comment;
