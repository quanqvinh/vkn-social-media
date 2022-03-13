import "./header.scss";
import Nav from "./Navigation/Nav";
import logo from "../../assets/images/instagramLogo.png";
import searchIcon from "../../assets/images/searchIcon.png";

import { useState } from "react";

function Header() {
   const [isSearch, setIsSearch] = useState(false);
   const [searchQuery, setSearchQuery] = useState("");

   const handelSearch = (e) => {
      setSearchQuery(e.target.value);
   };

   return (
      <div className="navigation">
         <div className="container">
            <img className="logo" src={logo} alt="instagram logo" />
            <div className="search">
               <img
                  className={`searchIcon ${
                     isSearch ? "searchIcon--search" : ""
                  }`}
                  src={searchIcon}
                  alt="search icon"
               />
               <input
                  className={`searchText ${
                     !isSearch ? "searchText--no-search" : ""
                  }`}
                  placeholder="Search"
                  onFocus={() => setIsSearch(true)}
                  onBlur={() => setIsSearch(!isSearch)}
                  onChange={(e) => handelSearch(e)}
                  value={searchQuery}
               />
            </div>
            <Nav />
         </div>
      </div>
   );
}

export default Header;
