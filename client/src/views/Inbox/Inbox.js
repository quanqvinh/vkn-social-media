import React, { useState, useContext, useCallback, useEffect } from 'react';
import Header from '../Header/Header';
import './inbox.scss';
import ListChat from './ListChat/ListChat';
import { ReactComponent as NewInbox } from '../../assets/images/newInbox.svg';
import { ReactComponent as InboxIcon } from '../../assets/images/inbox_outline.svg';
import ChatRoom from './ChatRoom/ChatRoom';
import { SOCKET } from '../../App';
import { useSelector } from 'react-redux';
import userApi from '../../apis/userApi';
import ModalChat from '../ModalChat/ModalChat';

const Inbox = () => {
    const socket = useContext(SOCKET);
    const user = useSelector(state => state.user);
    const [addRoom, setAddRoom] = useState({});
    const [latestMessage, setLatestMessage] = useState({
        roomId: '',
        content: ''
    });
    const [currentRoom, setCurrentRoom] = useState({
        chatMate: null,
        room: null
    });

    const handelLastestMessage = useCallback(
        (roomId, content) => {
            setLatestMessage({
                roomId,
                content
            });
        },
        [latestMessage]
    );

    useEffect(() => {
        socket &&
            socket.on('chat:print_message', ({ message, roomId }) => {
                setLatestMessage({
                    roomId: roomId,
                    content: message.content
                });
            });
    }, [socket]);

    const getToRoom = useCallback(
        room => {
            setCurrentRoom({
                chatMate: room.chatMate,
                roomId: room.roomId
            });
        },
        [currentRoom]
    );

    const handelAddRoom = friend => {
        console.log(friend);
        const checkRoom = async () => {
            try {
                let res = await userApi.checkRoom({
                    userId: friend._id
                });
                console.log(res);
                setAddRoom({
                    _id: res.roomId,
                    chatMate: {
                        _id: friend._id,
                        username: friend.username
                    },
                    messages: res.data ? [...res.data.messages] : { content: '' }
                });
                getToRoom({
                    roomId: res.roomId,
                    chatMate: {
                        _id: friend._id,
                        username: friend.username
                    }
                });
            } catch (error) {
                console.log(error.message);
            }
        };
        checkRoom();
        console.log('click add room');
    };
    return (
        <>
            <Header />
            <div className="inbox-container">
                <div className="inbox-container__content">
                    <div className="nav-left">
                        <div className="nav-left__header">
                            <h2 className="nav-left__header-username">{user.username}</h2>
                            <ModalChat openIcon={<NewInbox />} handelAddRoom={handelAddRoom} />

                            {/* <NewInbox onClick={() => handelAddRoom()} /> */}
                        </div>
                        <ListChat
                            addRoom={addRoom}
                            getToRoom={getToRoom}
                            latestMessage={latestMessage}
                        />
                    </div>
                    {currentRoom.chatMate === null ? (
                        <div className="nav-right">
                            <span className="nav-right__wrap-icon">
                                <InboxIcon className="nav-right__wrap-icon-svg" />
                            </span>
                            <h2 className="nav-right__title">Your Messages</h2>
                            <p className="nav-right__description">
                                Send private photos and messages to a friend or group.
                            </p>
                            <button className="nav-right__btnSend">Send Message</button>
                        </div>
                    ) : (
                        <>
                            <ChatRoom
                                handelLastestMessage={handelLastestMessage}
                                currentRoom={currentRoom}
                            />
                        </>
                    )}
                </div>
            </div>
        </>
    );
};

export default Inbox;
