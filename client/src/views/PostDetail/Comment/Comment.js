import React from 'react';
import ProfilePreview from '../../Profile/ProfilePreview/ProfilePreview';
import avatar from '../../../assets/images/profile.jpg';
import './comment.scss';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { useSelector } from 'react-redux';

const Comment = props => {
    const { handelReply, caption, cmt, disableReply } = props;
    const user = useSelector(state => state.user);
    console.log(cmt);
    const ownUser = caption ? user : cmt.commentBy ? cmt.commentBy : cmt;
    console.log(ownUser);
    const cmtContent = caption ? caption : cmt.content;
    console.log(cmtContent);
    const handelSendReply = () => {
        handelReply({
            commentId: cmt._id,
            commentOwnerId: user._id,
            commentOwnerUsername: user.username
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
                                    <span className="message-footer-time">{cmt.createdAt}</span>
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
