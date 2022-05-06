import "./profileIcon.scss";
import { memo } from "react";
import avatarDefault from "../../../assets/images/avatar_default.png";

function ProfileIcon(props) {
   const { iconSize, storyBorder, image } = props;

   let profileImage = image ? image : avatarDefault;

   const setDefault = (e) => {
      e.target.onerror = null;
      e.target.src = avatarDefault;
   };
   return (
      <div className={storyBorder ? "storyBorder" : ""}>
         <img
            aria-hidden={true}
            className={`profileIcon ${iconSize}`}
            src={profileImage}
            alt="profile"
            onError={(e) => setDefault(e)}
         />
      </div>
   );
}

export default memo(ProfileIcon);
