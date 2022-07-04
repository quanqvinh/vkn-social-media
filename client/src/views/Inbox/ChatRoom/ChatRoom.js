import React, { useCallback, useEffect } from 'react';
import ProfilePreview from '../../Profile/ProfilePreview/ProfilePreview';
import { ReactComponent as Option } from '../../../assets/images/report.svg';
import { ReactComponent as AddImage } from '../../../assets/images/addImg.svg';
import './chatroom.scss';
import avatar from '../../../assets/images/profile.jpg';
import { SOCKET } from '../../../App';
import { useState, useContext } from 'react';
import { useSelector } from 'react-redux';
import { memo } from 'react';
import { useRef } from 'react';
import userApi from '../../../apis/userApi';
import env from 'react-dotenv';

const ChatRoom = props => {
    const user = useSelector(state => state.user);
    const { handelLastestMessage, currentRoom } = props;
    const [inputing, setInputing] = useState(false);
    const [inputContent, setInputContent] = useState('');
    const [listMessage, setListMessage] = useState([]);
    const [currentPageMessages, setCurrentPageMessages] = useState(0);
    const [isFetchMessage, setIsFetchMessage] = useState(false);
    const listRef = useRef([]);
    const chatContentRef = useRef(null);

    const socket = useContext(SOCKET);
    const sendMessage = useCallback(() => {
        socket.emit('chat:send_message', {
            username: currentRoom.chatMate.username,
            roomId: currentRoom.roomId,
            content: inputContent,
            userId: currentRoom.chatMate._id
        });

        listRef.current = [
            ...listRef.current,
            {
                content: inputContent,
                isImage: false,
                img: null,
                sendBy: user.username,
                isMine: true
            }
        ];

        setListMessage([...listRef.current]);

        handelLastestMessage(currentRoom.roomId, inputContent);
        setInputContent('');
    }, [listMessage, inputContent]);

    const handelSendImage = useCallback(
        e => {
            const image = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                socket.emit('chat:send_image', {
                    image: reader.result,
                    username: currentRoom.chatMate.username,
                    roomId: currentRoom.roomId,
                    userId: currentRoom.chatMate._id
                });
            };
            reader.readAsDataURL(image);

            var binaryData = [];
            binaryData.push(image);
            let imgSrc = window.URL.createObjectURL(
                new Blob(binaryData, { type: 'application/zip' })
            );

            setListMessage([
                ...listMessage,
                {
                    content: '',
                    isImage: true,
                    img: imgSrc,
                    sendBy: user.username,
                    isMine: true
                }
            ]);
            handelLastestMessage(currentRoom.roomId, inputContent);
        },
        [listMessage, inputContent]
    );

    useEffect(() => {
        const fetchMessages = async () => {
            try {
                let res = await userApi.getRoomById(currentRoom.roomId, {
                    nMessage: currentPageMessages * 20
                });

                if (res.status === 'success') {
                    if (currentPageMessages === 0) {
                        listRef.current = [];
                    }
                    if (res.data.messages.length === 0) {
                        console.log('het tin nhan roi');
                        return;
                    }
                    listRef.current = [...res.data.messages, ...listRef.current];
                    setListMessage([...listRef.current]);
                    setIsFetchMessage(false);
                }

                if (currentPageMessages === 0) {
                    const domNode = chatContentRef.current;
                    if (domNode) {
                        domNode.scrollTop = domNode.scrollHeight;
                    }
                }
            } catch (error) {
                console.log(error.message);
            }
        };
        fetchMessages();
    }, [currentPageMessages, currentRoom.roomId]);

    console.log(listMessage);

    useEffect(() => {
        setCurrentPageMessages(0);
    }, [currentRoom.roomId]);

    useEffect(() => {
        socket &&
            socket.on('chat:print_message', ({ message }) => {
                console.log(message);
                listRef.current = [...listRef.current, message];
                setListMessage([...listRef.current]);
            });
    }, [socket]);

    const handelKeyUp = e => {
        if (e.keyCode === 13) {
            try {
                sendMessage();
            } catch (error) {
                console.log(error.message);
            }
        }
    };

    const handelScrollFetch = e => {
        if (e.target.scrollTop === 0) {
            setCurrentPageMessages(currentPageMessages + 1);
            setIsFetchMessage(true);
        }
    };
    return (
        <div className="chat-room">
            <div className="header">
                <ProfilePreview
                    image={
                        process.env.REACT_APP_STATIC_URL +
                        `/avatars/${currentRoom.chatMate._id}.png`
                    }
                    username={currentRoom.chatMate.username}
                    iconSize="small"
                    captionSize="big"
                />
                <Option className="header__icon" />
            </div>

            <div className="content" ref={chatContentRef} onScroll={e => handelScrollFetch(e)}>
                {isFetchMessage && <p>Loading...</p>}
                {listMessage?.length > 0 &&
                    listMessage.map((message, index) => (
                        <div className="content__day" key={index}>
                            {message.sendBy === user.username ? (
                                !message.isImage ? (
                                    <p className="content__day-message">{message.content}</p>
                                ) : (
                                    <div className="content__day-img">
                                        <img
                                            src={
                                                message.img ||
                                                process.env.REACT_APP_STATIC_URL +
                                                    `/messages/${currentRoom.roomId}.png/${message._id}.png`
                                            }
                                            alt="img"
                                        />
                                    </div>
                                )
                            ) : (
                                <div className="content__day-partner">
                                    <div className="content__day-partner-avatar">
                                        <img
                                            src={
                                                process.env.REACT_APP_STATIC_URL +
                                                `/avatars/${currentRoom.chatMate._id}.png`
                                            }
                                            alt=""
                                        />
                                    </div>
                                    {!message.isImage ? (
                                        <p className="content__day-message">{message.content} </p>
                                    ) : (
                                        <div className="content__day-img">
                                            <img
                                                src={
                                                    process.env.REACT_APP_STATIC_URL +
                                                    `/messages/${currentRoom.roomId}.png/${message._id}.png`
                                                }
                                                alt="img"
                                            />
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
            </div>

            <div className="chat-footer">
                <div
                    className={`input ${!inputing ? 'input--blur' : ''} ${
                        inputContent !== '' ? 'input--has-content' : ''
                    }`}>
                    <input
                        type="text"
                        placeholder="Message"
                        onFocus={() => setInputing(true)}
                        onChange={e => setInputContent(e.target.value)}
                        onKeyUp={e => handelKeyUp(e)}
                        value={inputContent}
                    />
                    <input
                        type="file"
                        hidden
                        name=""
                        id="input__choose-img"
                        accept="image/*"
                        onChange={e => handelSendImage(e)}
                    />
                    <label htmlFor="input__choose-img">
                        <AddImage />
                    </label>
                    <span className="input__send" onClick={sendMessage}>
                        Send
                    </span>
                </div>
            </div>
        </div>
    );
};

export default memo(ChatRoom);
