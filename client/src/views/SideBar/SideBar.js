import "./sidebar.scss";
import Sticky from "react-sticky-el";
import ProfilePreview from "../Profile/ProfilePreview/ProfilePreview";
import ListsOnline from "./ListsOnline/ListsOnline";
import Footer from "../Footer/Footer";
import image from "../../assets/images/profile.jpg";

function Sidebar() {
   return (
      <Sticky topOffset={-80}>
         <div className="sidebar">
            <ProfilePreview
               username="kien108"
               name="Le Trung Kien"
               urlText="Switch"
               iconSize="big"
               image={image}
               storyBorder={true}
            />
            <ListsOnline />

            <Footer />
         </div>
      </Sticky>
   );
}

export default Sidebar;
