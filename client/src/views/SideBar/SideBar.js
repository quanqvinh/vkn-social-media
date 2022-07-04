import './sidebar.scss';
import Sticky from 'react-sticky-el';
import ProfilePreview from '../Profile/ProfilePreview/ProfilePreview';
import ListsOnline from './ListsOnline/ListsOnline';
import Footer from '../Footer/Footer';
import image from '../../assets/images/profile.jpg';
import { useSelector } from 'react-redux';
import env from 'react-dotenv';

function Sidebar({ listOnline }) {
    const user = useSelector(state => state.user);

    return (
        <Sticky topOffset={-80}>
            <div className="sidebar__user">
                <ProfilePreview
                    userId={user._id}
                    username={user.username}
                    name={user.name || 'null'}
                    iconSize="big"
                    image={process.env.REACT_APP_STATIC_URL + `/avatars/${user._id}.png`}
                    storyBorder={true}
                />
                <ListsOnline listOnline={listOnline} />

                <Footer />
            </div>
        </Sticky>
    );
}

export default Sidebar;
