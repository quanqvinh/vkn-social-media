import './header.scss';
import Nav from './Navigation/Nav';
import logo from '../../assets/images/instagramLogo.png';
import searchIcon from '../../assets/images/searchIcon.png';

import { useEffect, useRef, useState } from 'react';
import { Link, useHistory } from 'react-router-dom';
import ProfilePreview from '../Profile/ProfilePreview/ProfilePreview';
import userApi from '../../apis/userApi';

const $ = document.querySelector.bind(document);

function Header() {
    const [isSearch, setIsSearch] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [listSearch, setListSearch] = useState([]);
    const listSearchElement = useRef(null);
    const debounceRef = useRef(null);

    const handelSearch = e => {
        setSearchQuery(e.target.value);
        const search = async () => {
            try {
                let res = await userApi.search({ keyword: e.target.value });
                setListSearch(res.result);
            } catch (error) {
                console.log(error.message);
            }
        };

        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }
        debounceRef.current = setTimeout(() => {
            search();
        }, 500);
    };

    const handelSearching = () => {
        setIsSearch(true);
        const domNode = listSearchElement.current;
        if (domNode) {
            domNode.classList.add('search__list--open');
        }
    };

    const handelSearchBlur = () => {
        setIsSearch(!isSearch);
    };

    useEffect(() => {
        const appElement = $('.App');
        appElement.onclick = e => {
            if (e.target.closest('.search')) return;
            const domNode = listSearchElement.current;
            if (domNode) {
                domNode.classList.remove('search__list--open');
            }
        };
    }, []);

    return (
        <div className="navigation">
            <div className="container">
                <Link to="/">
                    <img
                        className="logo"
                        src={process.env.REACT_APP_STATIC_URL + `/defaults/logo_dark.png`}
                        alt="instagram logo"
                    />
                </Link>
                <div className="search">
                    <img
                        className={`searchIcon ${isSearch ? 'searchIcon--search' : ''}`}
                        src={searchIcon}
                        alt="search icon"
                    />
                    <input
                        className={`searchText ${!isSearch ? 'searchText--no-search' : ''}`}
                        placeholder="Search"
                        onFocus={handelSearching}
                        onBlur={handelSearchBlur}
                        onChange={e => handelSearch(e)}
                        value={searchQuery}
                    />
                    <div className="search__list" ref={listSearchElement}>
                        {searchQuery ? (
                            listSearch?.length > 0 ? (
                                listSearch.map(user => (
                                    <ProfilePreview
                                        key={user._id}
                                        userId={user._id}
                                        image={
                                            process.env.REACT_APP_STATIC_URL +
                                            `/avatars/${user._id}.png`
                                        }
                                        iconSize="medium"
                                        username={user.username}
                                        name={user.name}
                                    />
                                ))
                            ) : (
                                <p>No results found</p>
                            )
                        ) : (
                            <p>No recent searches</p>
                        )}
                    </div>
                </div>
                <Nav />
            </div>
        </div>
    );
}

export default Header;
