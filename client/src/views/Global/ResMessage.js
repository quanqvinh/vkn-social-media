import React from 'react';
import { useState, useEffect } from 'react';

const ResMessage = props => {
    const { resMessage, callBy } = props;
    const [noti, setNoti] = useState('');

    const listKeysSignup = ['Username', 'User with', 'Account'];
    const listNotiesSignup = [
        'Username already exists',
        'User with given email already exist',
        'Verification email has been sent to your email'
    ];

    const listKeysLogin = ['Username', 'Password', 'Verify'];
    const listNotiesLogin = [
        'Username or email is incorrect',
        'Your password is incorrect',
        'Verification email has been sent to your email'
    ];
    useEffect(() => {
        if (callBy === 'Signup') {
            listKeysSignup.every((key, index) => {
                if (resMessage.includes(key)) {
                    console.log(index);
                    setNoti(listNotiesSignup[index]);
                    return false;
                }
                return true;
            });
        } else {
            listKeysLogin.every((key, index) => {
                console.log(resMessage);
                if (resMessage.includes(key)) {
                    setNoti(listNotiesLogin[index]);
                    return false;
                }
                return true;
            });
        }
    }, [resMessage]);

    return (
        <p
            className={`res-message ${
                noti.includes('Verification') ? 'res-message--send-email' : ''
            }`}>
            {noti}
        </p>
    );
};

export default ResMessage;
