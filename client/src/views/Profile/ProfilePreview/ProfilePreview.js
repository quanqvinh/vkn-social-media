import "./profilePreview.scss";
import ProfileIcon from "./ProfileIcon";
import users from "../../../data/users";

function ProfilePreview(props) {
   const {
      username,
      name,
      urlText,
      iconSize,
      captionSize,
      storyBorder,
      hideAccountName,
      image,
   } = props;

   let accountName = username
      ? username
      : users[Math.floor(Math.random() * users.length)].username;

   return (
      <div className="profile">
         <ProfileIcon
            iconSize={iconSize}
            storyBorder={storyBorder}
            image={image}
         />
         {(accountName || name) && !hideAccountName && (
            <div className="textContainer">
               <span className="accountName">{accountName}</span>
               <span className={`name ${captionSize}`}>{name}</span>
            </div>
         )}
         <a href="/">{urlText}</a>
      </div>
   );
}

export default ProfilePreview;
