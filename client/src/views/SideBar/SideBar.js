import "./sidebar.scss";
import Sticky from "react-sticky-el";
import ProfilePreview from "../Profile/ProfilePreview/ProfilePreview";
import ListsOnline from "./ListsOnline/ListsOnline";
import Footer from "../Footer/Footer";
import image from "../../assets/images/profile.jpg";
import { useSelector } from "react-redux";

function Sidebar(props) {
   const user = useSelector((state) => state.user);
   return (
      <Sticky topOffset={-80}>
         <div className="sidebar">
            <ProfilePreview
               username={user.username}
               name={user.name || "null"}
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
