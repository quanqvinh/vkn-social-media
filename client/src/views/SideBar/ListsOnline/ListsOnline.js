import "./listsOnline.scss";
import ProfilePreview from "../../Profile/ProfilePreview/ProfilePreview";

function ListsOnline() {
   return (
      <div className="suggestions">
         <div className="titleContainer">
            <div className="title">Online</div>
            <a href="/">See All</a>
         </div>

         <ProfilePreview
            name="Followed by mapvault + 3 more"
            urlText="Follow"
            iconSize="medium"
            captionSize="small"
            storyBorder={true}
         />
         <ProfilePreview
            name="Followed by mapvault + 3 more"
            urlText="Follow"
            iconSize="medium"
            captionSize="small"
            storyBorder={true}
         />
         <ProfilePreview
            name="Followed by mapvault + 3 more"
            urlText="Follow"
            iconSize="medium"
            captionSize="small"
            storyBorder={true}
         />
         <ProfilePreview
            name="Followed by mapvault + 3 more"
            urlText="Follow"
            iconSize="medium"
            captionSize="small"
            storyBorder={true}
         />
      </div>
   );
}

export default ListsOnline;
