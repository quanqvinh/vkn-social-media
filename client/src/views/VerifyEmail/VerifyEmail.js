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

const VerifyEmail = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [isVerified, setIsVerified] = useState(false);

    const search = useLocation().search;
    let history = useHistory();

    const handelRedirect = () => {
        getCookie('accessToken') ? history.push('/') : history.push('/login');
    };

    const card = (
        <React.Fragment>
            <CardContent
                sx={{
                    width: 400,
                }}>
                <Box>
                    {isVerified ? (
                        <CheckCircleIcon
                            sx={{
                                fontSize: 70,
                                fill: '#5a9cff',
                            }}
                        />
                    ) : (
                        <CancelIcon
                            sx={{
                                fontSize: 70,
                                fill: 'red',
                            }}
                        />
                    )}
                </Box>
                <Typography
                    sx={{ fontSize: 25 }}
                    color="text.primary"
                    fontWeight={600}
                    gutterBottom>
                    {isVerified ? 'Verified' : 'Verify Failed'}
                </Typography>
                <Typography color="text.secondary">
                    {isVerified
                        ? 'Your email have been verified successfully'
                        : 'This link has been expired'}
                </Typography>
            </CardContent>
            <CardActions
                sx={{
                    justifyContent: 'center',
                }}>
                <Button
                    style={{ display: `${isVerified ? '' : 'none'}` }}
                    onClick={handelRedirect}
                    variant="contained"
                    sx={{
                        width: '200px',
                        fontSize: 18,
                        mb: '10px',
                        background: '#5a9cff',
                        borderRadius: '6px',
                    }}>
                    Ok
                </Button>
            </CardActions>
        </React.Fragment>
    );

    useEffect(() => {
        const fetchVerify = async () => {
            try {
                const token = new URLSearchParams(search).get('token');

                const data = {
                    token: token,
                };
                console.log(token);
                if (getCookie('accessToken')) {
                    let res = await userApi.editEmail(token);
                    console.log(res);
                } else {
                    let res = await authApi.verify(data); // res.message
                }
                setIsVerified(true);
            } catch (error) {
                console.log(error.response.data.message);
                console.log("Can't find params user_id and token to verify");
            }
        };
        fetchVerify();

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
                    <CircularProgress
                        color="secondary"
                        style={{ width: '50px', height: '50px' }}
                    />
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
                        background: '#0a1929',
                    }}>
                    <Card sx={{ borderRadius: '6px' }} variant="outlined">
                        {card}
                    </Card>
                </Box>
            )}
        </>
    );
};

export default VerifyEmail;
