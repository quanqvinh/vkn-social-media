import React from 'react';
import ProfilePreview from '../../Profile/ProfilePreview/ProfilePreview';
import avatar from '../../../assets/images/profile.jpg';
import './comment.scss';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { useSelector } from 'react-redux';

const Comment = props => {
    const { handelReply, caption, cmt, disableReply } = props;
    const user = useSelector(state => state.user);
    const ownUser = caption ? user : cmt.commentBy ? cmt.commentBy : cmt.replyBy;
    const cmtContent = caption ? caption : cmt.content;
    const handelSendReply = () => {
        handelReply({
            commentId: cmt._id,
            commentOwnerId: ownUser._id,
            commentOwnerUsername: ownUser.username
        });
    };

    return (
        <div className="message-container">
            {ownUser && cmtContent && (
                <>
                    <ProfilePreview
                        username={ownUser.username}
                        iconSize="medium"
                        image={
                            process.env.REACT_APP_STATIC_URL +
                            `/avatars/${ownUser.replyBy || ownUser._id}.png`
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
                                        {new Date(cmt.createdAt).toLocaleString()}
                                    </span>
                                    {!disableReply && (
                                        <>
                                            <span
                                                className="message-footer-reply"
                                                onClick={handelSendReply}>
                                                Reply
                                            </span>
                                            <MoreHorizIcon className="message-footer-option" />
                                        </>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default Comment;
