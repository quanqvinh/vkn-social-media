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
      src,
      chooseRoom,
   } = props;

   let accountName = username
      ? username
      : users[Math.floor(Math.random() * users.length)].username;

   const handelClickProfile = () => {
      if (!(src === "ListChat")) return;

      chooseRoom();
   };
   return (
      <div
         className={`profile ${src === "ListChat" ? "profile--chat" : ""}`}
         onClick={handelClickProfile}
      >
         <ProfileIcon
            iconSize={iconSize}
            storyBorder={storyBorder}
            image={image}
         />
         {(accountName || name) && !hideAccountName && (
            <div className="textContainer">
               <span className={`accountName ${captionSize}`}>
                  {accountName}
               </span>
               <span className={`name ${captionSize}`}>{name}</span>
            </div>
         )}
         <a href="/">{urlText}</a>
      </div>
   );
}

export default ProfilePreview;
