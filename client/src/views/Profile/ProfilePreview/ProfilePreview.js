import './profilePreview.scss';
import ProfileIcon from './ProfileIcon';
import { memo } from 'react';
import { useHistory } from 'react-router-dom';

function ProfilePreview(props) {
    const {
        userId,
        username,
        name,
        urlText,
        iconSize,
        captionSize,
        storyBorder,
        hideAccountName,
        image,
        src,
        getToRoom,
        room
    } = props;

    const history = useHistory();

    const handelGetToRoom = () => {
        if (!(src === 'ListChat')) {
            if (history.location.pathname.includes('profile')) {
                history.push(`/profile/${userId}`);
                const searchList = document.querySelector('.search__list');
                searchList.classList.remove('search__list--open');
                return;
            }
            history.push(`profile/${userId}`);
            return;
        }

        let selectedRoom = {
            chatMate: room.chatMate,
            roomId: room._id
        };

        getToRoom(selectedRoom);
    };
    return (
        <div
            className={`profile ${src === 'ListChat' ? 'profile--chat' : ''}`}
            onClick={handelGetToRoom}>
            <ProfileIcon iconSize={iconSize} storyBorder={storyBorder} image={image} />
            {username && !hideAccountName && (
                <div className="textContainer">
                    <span className={`accountName ${captionSize}`}>{username}</span>
                    <span className={`name ${captionSize}`}>{name}</span>
                </div>
            )}
            <a href="/">{urlText}</a>
        </div>
    );
}

export default memo(ProfilePreview);
