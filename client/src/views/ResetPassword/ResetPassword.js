import * as React from 'react';
import './verify.scss';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import CircularProgress from '@mui/material/CircularProgress';

import authApi from '../../apis/authApi';
import userApi from '../../apis/userApi';
import { useLocation, useHistory } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getCookie } from '../Global/cookie';

const ResetPassword = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [isVerified, setIsVerified] = useState(null);
    const [newPassword, setNewPassword] = useState('');

    const search = useLocation().search;

    const handelChangePassword = () => {
        if (!newPassword) return;

        const resetPassword = async () => {
            try {
                const token = new URLSearchParams(search).get('token');

                let res = await authApi.resetPassword({
                    token,
                    newPassword: newPassword
                });
                console.log(res);
                setIsVerified(true);
            } catch (error) {
                console.log(error.message);
            }
        };
        resetPassword();
    };

    const card = (
        <React.Fragment>
            <CardContent
                sx={{
                    width: 400
                }}>
                {isVerified === null ? (
                    <div className="form__containter">
                        <span className="forgot__title">Please fill in your new password</span>
                        <div className="forgot__content">
                            <label className="forgot__label">New Password:</label>
                            <input
                                onChange={e => setNewPassword(e.target.value)}
                                value={newPassword}
                                type="text"
                                className="forgot__email"
                                placeholder="Your new password..."
                            />
                        </div>
                    </div>
                ) : (
                    <>
                        <Box>
                            {isVerified ? (
                                <CheckCircleIcon
                                    sx={{
                                        fontSize: 70,
                                        fill: '#5a9cff'
                                    }}
                                />
                            ) : (
                                <CancelIcon
                                    sx={{
                                        fontSize: 70,
                                        fill: 'red'
                                    }}
                                />
                            )}
                        </Box>
                        <Typography
                            sx={{ fontSize: 25 }}
                            color="text.primary"
                            fontWeight={600}
                            gutterBottom>
                            {isVerified ? 'Success' : ' Failed'}
                        </Typography>
                        <Typography color="text.secondary">
                            {isVerified
                                ? 'Your password have been changed successfully'
                                : 'This link has been expired'}
                        </Typography>
                    </>
                )}
            </CardContent>
            <CardActions
                sx={{
                    justifyContent: 'center'
                }}>
                <Button
                    onClick={handelChangePassword}
                    className="forgot__ok"
                    style={{ display: `${!isVerified ? '' : 'none'}` }}
                    variant="contained"
                    sx={{
                        width: '200px',
                        fontSize: 18,
                        mb: '10px',
                        background: '#5a9cff',
                        borderRadius: '6px'
                    }}>
                    Change Password
                </Button>
            </CardActions>
        </React.Fragment>
    );

    useEffect(() => {
        let timeLoading = setTimeout(() => {
            setIsLoading(false);
        }, 3000);

        return () => {
            clearTimeout(timeLoading);
        };
    }, []);

    return (
        <>
            {isLoading ? (
                <div className="loading-container">
                    <CircularProgress color="secondary" style={{ width: '50px', height: '50px' }} />
                    <p>Loading...</p>
                </div>
            ) : (
                <Box
                    sx={{
                        minWidth: 275,
                        height: '100vh',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: '#0a1929'
                    }}>
                    <Card sx={{ borderRadius: '6px' }} variant="outlined">
                        {card}
                    </Card>
                </Box>
            )}
        </>
    );
};

export default ResetPassword;
