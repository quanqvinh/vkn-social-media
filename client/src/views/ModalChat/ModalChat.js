import * as React from 'react';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import CloseIcon from '@mui/icons-material/Close';
import ProfilePreview from '../Profile/ProfilePreview/ProfilePreview';
import './modalchat.scss';
import { useState, useRef } from 'react';
import userApi from '../../apis/userApi';
const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4
};

export default function BasicModal({ openIcon, handelAddRoom }) {
    const [open, setOpen] = React.useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);
    const [searchText, setSearchText] = useState('');
    const [listSearch, setListSearch] = useState([]);
    const [chatMate, setChatMate] = useState(null);
    const searchRef = useRef(null);
    const debounceRef = useRef(null);

    const searchInbox = async keyword => {
        try {
            let res = await userApi.search({
                keyword
            });
            setListSearch([...res.result]);
        } catch (error) {
            console.log(error.message);
        }
    };

    const handelSearch = e => {
        if (e.target.value === '') {
            searchRef.current.style.color = '#000';
        }
        setSearchText(e.target.value);

        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        debounceRef.current = setTimeout(() => {
            searchInbox(e.target.value);
        }, 300);
    };

    const handelSelectChatMate = chatMate => {
        setChatMate(chatMate);
        setSearchText(chatMate.username);
        searchRef.current.style.color = 'red';
    };

    const handelNext = () => {
        handelAddRoom(chatMate);
        handleClose();
        setSearchText('');
    };

    return (
        <div>
            <span onClick={handleOpen}>{openIcon}</span>
            <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description">
                <Box sx={style} style={{ padding: 'unset' }}>
                    <div className="header">
                        <CloseIcon className="header__close" />
                        <p className="header__title">New Message</p>
                        <span className="header__next" onClick={handelNext}>
                            Next
                        </span>
                    </div>
                    <div className="send-to">
                        <span className="send-to__label">To:</span>
                        <input
                            ref={searchRef}
                            type="text"
                            className="send-to__search"
                            placeholder="Search..."
                            value={searchText}
                            onChange={e => handelSearch(e)}
                        />
                    </div>
                    <div className="body">
                        {listSearch?.length > 0 &&
                            listSearch.map((item, index) => (
                                <div
                                    className="body__item-search"
                                    onClick={() => handelSelectChatMate(item)}>
                                    <ProfilePreview
                                        image={
                                            process.env.REACT_APP_STATIC_URL +
                                            `/avatars/${item._id}.png`
                                        }
                                        key={index}
                                        username={item.username}
                                        name={item.name}
                                        iconSize="big"
                                    />
                                </div>
                            ))}
                    </div>
                </Box>
            </Modal>
        </div>
    );
}
