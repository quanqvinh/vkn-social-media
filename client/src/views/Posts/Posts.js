import './posts.scss';
import Post from './Post/Post';
import { useEffect, useState } from 'react';
import postApi from '../../apis/postApi';
import { useDispatch, useSelector } from 'react-redux';
import { fetchNotificationsRequest } from '../../actions/notification';

function Posts(props) {
    const user = useSelector(state => state.user);
    const [posts, setPosts] = useState([]);
    const [isLike, setIsLike] = useState(false);
    const dispatch = useDispatch();

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const res = await postApi.newFeeds();

                res?.status === 'success' && setPosts([...res.posts]);

                console.log(res);
                dispatch(fetchNotificationsRequest(res.uncheckedNotifications));
            } catch (error) {
                console.log(error.message);
            }
        };
        fetchPost();
    }, []);

    function isEmpty(obj) {
        for (var key in obj) {
            if (obj.hasOwnProperty(key)) return false;
        }
        return true;
    }

    const handelLike = () => {
        setIsLike(!isLike);
    };

    return (
        <div className="cards">
            {!isEmpty(user) &&
                !isEmpty(posts) &&
                posts?.length > 0 &&
                posts.map(post => (
                    <Post
                        handelLike={handelLike}
                        post={post}
                        avatar={process.env.REACT_APP_STATIC_URL + `/avatars/${post.user}.png`}
                        key={post._id}
                        accountName={post.username}
                        content={post.caption}
                        storyBorder={true}
                        id={post._id}
                        imgs={post.imgs}
                        comments={post.comments}
                        likedByNumber={post.numberOfLikes}
                        hours={post.createdAt}
                    />
                ))}
        </div>
    );
}

export default Posts;
