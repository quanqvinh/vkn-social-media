import './App.scss';
import Home from './views/Home/Home';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import Login from './views/Login/Login';
import Signup from './views/Signup/Signup';
import VerifyEmail from './views/VerifyEmail/VerifyEmail';
import Inbox from './views/Inbox/Inbox';

import { createContext, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ProfilePage from './views/ProfilePage/ProfilePage';
import EditProfile from './views/EditProfile/EditProfile';
import EditPassword from './views/EditProfile/EditPassword/EditPassword';
import { io } from 'socket.io-client';
import { getCookie } from './views/Global/cookie';
import { useState } from 'react';
import EditEmail from './views/EditProfile/EditEmail/EditEmail';
import Layout from './components/layout/Layout';
import { addNotifications } from './actions/notification';
import Dashboard from './pages/Dashboard';

import { useRef } from 'react';
import ResetPassword from './views/ResetPassword/ResetPassword';

export const SOCKET = createContext();

function App() {
    const user = useSelector(state => state.user);
    const dispatch = useDispatch();
    const [socket, setSocket] = useState(null);
    const accessToken = getCookie('accessToken');
    const [listOnlineInit, setListOnlineInit] = useState([]);

    useEffect(() => {
        if (sessionStorage.getItem('USER_INFO') === null) {
            console.log('null');
            return;
        }

        const socket = io('http://localhost:7070', {
            auth: {
                'access-token': accessToken,
                userId: user._id,
                username: user.username
            }
        });
        setSocket(socket);
    }, [user._id, user.username, accessToken]);

    useEffect(() => {
        socket &&
            socket.on('user:print_notification', payload => {
                console.log(payload);
                let action = addNotifications(payload.notification);
                dispatch(action);
            });
    }, [socket, dispatch]);

    useEffect(() => {
        socket &&
            socket.on('home:list_friend_online', payload => {
                setListOnlineInit([...payload]);
            });
    }, [socket]);

    return (
        <Router>
            <SOCKET.Provider value={socket}>
                <div className="App">
                    <Switch>
                        <Route exact path="/">
                            <Home listOnlineInit={listOnlineInit} />
                        </Route>
                        <Route path={'/inbox'}>
                            <Inbox />
                        </Route>
                        <Route exact path={'/profile/:id'}>
                            <ProfilePage />
                        </Route>
                        <Route exact path={'/profile/:id/edit'}>
                            <EditProfile />
                        </Route>
                        <Route path={'/profile/:id/edit/password'}>
                            <EditPassword />
                        </Route>
                        <Route path={'/profile/:id/edit/email'}>
                            <EditEmail />
                        </Route>
                        <Route path="/login">
                            <Login />
                        </Route>
                        <Route path="/signup">
                            <Signup />
                        </Route>
                        <Route path="/auth/verify-email">
                            <VerifyEmail />
                        </Route>
                        <Route path="/auth/reset-password">
                            <ResetPassword />
                        </Route>
                        <Route path="/dashboard">
                            <Layout />
                        </Route>
                    </Switch>
                </div>
            </SOCKET.Provider>
        </Router>
    );
}

export default App;
