import "./nav.scss";
import { ReactComponent as Home } from "../../../assets/images/home.svg";
import { ReactComponent as Inbox } from "../../../assets/images/inbox.svg";
import { ReactComponent as Notifications } from "../../../assets/images/notifications.svg";
import ProfileIcon from "../../Profile/ProfilePreview/ProfileIcon";
import image from "../../../assets/images/profile.jpg";

function Nav() {
   return (
      <div className="menu">
         <Home className="icon" />
         <Inbox className="icon" />
         <Notifications className="icon" />
         <ProfileIcon iconSize="small" image={image} />
      </div>
   );
}

export default Nav;
