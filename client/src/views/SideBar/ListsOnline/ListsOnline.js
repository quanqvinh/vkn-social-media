import './listsOnline.scss';
import ProfilePreview from '../../Profile/ProfilePreview/ProfilePreview';

function ListsOnline({ listOnline }) {
    return (
        <div className="suggestions">
            <div className="titleContainer">
                <div className="title">{`Online(${listOnline.length})`}</div>
            </div>

            {listOnline?.length > 0 &&
                listOnline.map(user => (
                    <ProfilePreview
                        userId={user._id}
                        key={user._id || user.useId}
                        image={
                            process.env.REACT_APP_STATIC_URL +
                            `/avatars/${user._id || user.useId}.png`
                        }
                        username={user.username}
                        name={user.name}
                        iconSize="medium"
                        captionSize="small"
                        storyBorder={true}
                    />
                ))}
        </div>
    );
}

export default ListsOnline;
