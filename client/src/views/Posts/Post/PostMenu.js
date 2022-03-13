import "./postMenu.scss";
import { ReactComponent as Inbox } from "../../../assets/images/inbox.svg";
import { ReactComponent as Comments } from "../../../assets/images/comments.svg";
import { ReactComponent as Notifications } from "../../../assets/images/notifications.svg";
import { ReactComponent as Bookmark } from "../../../assets/images/bookmark.svg";

function PostMenu() {
   return (
      <div className="cardMenu">
         <div className="interactions">
            <Notifications className="icon" />
            <Comments className="icon" />
            <Inbox className="icon" />
         </div>
         <Bookmark className="icon" />
      </div>
   );
}

export default PostMenu;
