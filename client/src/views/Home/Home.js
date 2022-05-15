import './home.scss';
import Posts from '../Posts/Posts';
import Sidebar from '../SideBar/SideBar';
import Header from '../Header/Header';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { fetchProfileRequest } from '../../actions/user';
import { getCookie } from '../Global/cookie';
import { useHistory } from 'react-router-dom';
import { SOCKET } from '../../App';
import { useContext } from 'react';

const Home = ({ listOnlineInit }) => {
    const history = useHistory();
    const accessToken = getCookie('accessToken');
    const socket = useContext(SOCKET);
    const [listOnline, setListOnline] = useState([]);

    if (!accessToken) {
        history.push('/login');
    }

    const dispatch = useDispatch();
    useEffect(() => {
        const fetchUser = async () => {
            try {
                dispatch(fetchProfileRequest());
            } catch (error) {
                console.log(error.message);
            }
        };
        if (accessToken) {
            fetchUser();
        }
    }, []);

    useEffect(() => {
        setListOnline([...listOnlineInit]);
    }, [listOnlineInit]);

    useEffect(() => {
        socket &&
            socket.on('home:friend_connect', payload => {
                setListOnline([...listOnline, payload]);
            });
    }, [socket]);

    const removeOnline = userId => {
        const newList = listOnline.filter(user => user._id !== userId);
        setListOnline([...newList]);
    };

    useEffect(() => {
        socket &&
            socket.on('home:friend_disconnect', payload => {
                removeOnline(payload._id);
            });
    }, [socket]);

    return (
        <>
            <Header />
            <main>
                <div className="container">
                    <Posts />
                    <Sidebar listOnline={listOnline} />
                </div>
            </main>
        </>
    );
};

export default Home;
