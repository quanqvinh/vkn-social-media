import './postMenu.scss';
import { ReactComponent as Inbox } from '../../../assets/images/inbox.svg';
import { ReactComponent as Comments } from '../../../assets/images/comments.svg';
import { ReactComponent as Notifications } from '../../../assets/images/notifications.svg';
import { ReactComponent as Bookmark } from '../../../assets/images/bookmark.svg';
import postApi from '../../../apis/postApi';
import { memo } from 'react';

function PostMenu({ postId, handelLikePost, like }) {
    const handelLike = () => {
        const likePost = async () => {
            try {
                let res = await postApi.like(postId);
                res.message === 'liked post'
                    ? handelLikePost(like + 1)
                    : handelLikePost(like - 1);
            } catch (error) {
                console.log(error.message);
            }
        };
        likePost();
    };

    return (
        <div className="cardMenu">
            <div className="interactions">
                <Notifications className="icon" onClick={handelLike} />
                <Comments className="icon" />
                <Inbox className="icon" />
            </div>
            <Bookmark className="icon" />
        </div>
    );
}

export default memo(PostMenu);
