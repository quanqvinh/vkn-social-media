import React from 'react';

import Chart from 'react-apexcharts';

import { useSelector } from 'react-redux';

import StatusCard from '../components/status-card/StatusCard';

import Table from '../components/table/Table';

import { useHistory } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { userApiAdmin } from '../apis/userApiAdmin';

const chartOptions = {
    series: [
        {
            name: 'New Users',
            data: [40, 70, 20, 90, 36, 80, 30, 91, 60]
        },
        {
            name: 'New Posts',
            data: [40, 10, 30, 80, 60, 90, 60, 40, 60]
        }
    ],
    options: {
        color: ['#6ab04c', '#2980b9'],
        chart: {
            background: 'transparent'
        },
        dataLabels: {
            enabled: false
        },
        stroke: {
            curve: 'smooth'
        },
        xaxis: {
            categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep']
        },
        legend: {
            position: 'top'
        },
        grid: {
            show: false
        }
    }
};

const renderCusomerHead = (item, index) => <th key={index}>{item}</th>;

const renderCusomerBody = (item, index) => (
    <tr key={index}>
        <td>{index + 1}</td>
        <td>{item.user}</td>
        <td>{item.popularity}</td>
        <td>{item.comments}</td>
        <td>{item.likes}</td>
    </tr>
);

const renderOrderHead = (item, index) => <th key={index}>{item}</th>;

const renderOrderBody = (item, index) => (
    <tr key={index}>
        <td>{index + 1}</td>
        <td>{item.time}</td>
        <td>{item.popularity}</td>
        <td>{item.comments}</td>
        <td>{item.likes}</td>
    </tr>
);

const Dashboard = () => {
    const themeReducer = useSelector(state => state.themeReducer.mode);
    const [analytics, setAnalytics] = useState({});
    const [statusCards, setStatusCards] = useState([]);
    const [topUsers, setTopUsers] = useState([]);
    const [topPosts, setTopPosts] = useState([]);

    const formatAnalytics = (users, posts) => {
        let newUsers = [];
        let newPosts = [];
        if (!users || !posts) return;

        for (let i = users.length - 12; i < users.length; i++) {
            newUsers.push(users[i].amountNewUsers);
            newPosts.push(posts[i].amountNewUsers);
        }

        return {
            series: [
                {
                    name: 'New Users',
                    data: [...newUsers]
                },
                {
                    name: 'New Posts',
                    data: [...newPosts]
                }
            ],
            options: {
                color: ['#6ab04c', '#2980b9'],
                chart: {
                    background: 'transparent'
                },
                dataLabels: {
                    enabled: false
                },
                stroke: {
                    curve: 'smooth'
                },

                xaxis: {
                    categories: [
                        'Jun',
                        'Jul',
                        'Aug',
                        'Sep',
                        'Oct',
                        'Nov',
                        'Dec',
                        'Jan',
                        'Feb',
                        'Mar',
                        'Apr',
                        'May'
                    ]
                },
                legend: {
                    position: 'top'
                },
                grid: {
                    show: false
                }
            }
        };
    };

    console.log(analytics);
    console.log('char', chartOptions);
    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                let res = await userApiAdmin.analytics();
                setAnalytics({
                    ...formatAnalytics(res.newUserByMonth, res.newPostByMonth)
                });

                setStatusCards([
                    {
                        icon: 'bx bxs-user-pin',
                        count: res.numberOfUsers,
                        title: 'Users'
                    },
                    {
                        icon: 'bx bx-news',
                        count: res.numberOfPosts,
                        title: 'Posts'
                    },
                    {
                        icon: 'bx bxs-message-dots',
                        count: res.numberOfComments,
                        title: 'Comments'
                    }
                ]);
                setTopUsers({
                    head: ['', 'user', 'popularity', 'comments', 'likes'],
                    body: [
                        ...res.famousUser.map(user => {
                            return {
                                user: user.username,
                                popularity: user.popularity,
                                comments: user.totalNumberOfComments,
                                likes: user.totalNumberOfLikes
                            };
                        })
                    ]
                });
                setTopPosts({
                    header: ['', 'time', 'popularity', 'comments', 'likes'],
                    body: [
                        ...res.popularPost.map(post => {
                            return {
                                time: new Date(post.createdAt).toLocaleString(),
                                popularity: post.popularity,
                                comments: post.numberOfComments,
                                likes: post.numberOfLikes
                            };
                        })
                    ]
                });
            } catch (error) {
                console.log(error.message);
            }
        };
        fetchAnalytics();
    }, []);

    return (
        <div>
            {analytics && (
                <>
                    <h2 className="page-header">Dashboard</h2>
                    <div className="row">
                        <div className="col-6">
                            <div className="row">
                                {statusCards.map((item, index) => (
                                    <div className="col-6" key={index}>
                                        <StatusCard
                                            icon={item.icon}
                                            count={item.count}
                                            title={item.title}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="col-6">
                            <div className="card-admin full-height">
                                {analytics?.series?.length > 0 && (
                                    <Chart
                                        options={
                                            themeReducer === 'theme-mode-dark'
                                                ? {
                                                      ...analytics.options,
                                                      theme: { mode: 'dark' }
                                                  }
                                                : {
                                                      ...analytics.options,
                                                      theme: { mode: 'light' }
                                                  }
                                        }
                                        series={analytics.series}
                                        type="line"
                                        height="100%"
                                    />
                                )}
                            </div>
                        </div>
                        <div className="col-6">
                            <div className="card-admin">
                                <div className="card-admin__header">
                                    <h3>Famous Users</h3>
                                </div>
                                <div className="card-admin__body">
                                    {topUsers?.body?.length > 0 && (
                                        <Table
                                            headData={topUsers.head}
                                            renderHead={(item, index) =>
                                                renderCusomerHead(item, index)
                                            }
                                            bodyData={topUsers.body}
                                            renderBody={(item, index) =>
                                                renderCusomerBody(item, index)
                                            }
                                        />
                                    )}
                                </div>
                                {/* <div className="card-admin__footer">
                            <Link to="/">view all</Link>
                        </div> */}
                            </div>
                        </div>
                        <div className="col-6">
                            <div className="card-admin">
                                <div className="card-admin__header">
                                    <h3>Posts Recently</h3>
                                </div>
                                <div className="card-admin__body">
                                    {topPosts?.body?.length > 0 && (
                                        <Table
                                            headData={topPosts.header}
                                            renderHead={(item, index) =>
                                                renderOrderHead(item, index)
                                            }
                                            bodyData={topPosts.body}
                                            renderBody={(item, index) =>
                                                renderOrderBody(item, index)
                                            }
                                        />
                                    )}
                                </div>
                                {/* <div className="card-admin__footer">
                            <Link to="/">view all</Link>
                        </div> */}
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default Dashboard;
