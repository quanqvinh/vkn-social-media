# vkn-social-media
Hello everybody, welcome to our project: Build a social-media using MERN stack.\
Click [here](https://vkn.netlify.app) to visit deployed website!\
\
For testing, you can sign up new username or use account below:\
Username: **Laron_Turner**\
Password: **Laron_Turner**\
; or you can login with any users searched in VKN with password matches username (like Laron_Turner).

## What technologies we use to build this project
- ReactJS
- NodeJS
- ExpressJS
- SocketIO
- Mongoose/MongoDB 
## Deployment
Front-end: Netlify\
Back-end: Heroku
## What we do in this app
- Authen using jwt.
- Limit time token jwt and refresh using refresh token.
- Permission admin and user when login.
1. User page
- Friend:
  + Add friend
  + Unfriend
  + Cancel request addfriend
  + View profile friend
- Post:
  + New post (require image and caption)
  + View post detail
  + Like, comment, reply real-time using socket.
- Chat:
  + Search new roomchat.
  + Send message and image realtime.
- User:
  + Search by email and username.
  + View and edit profile (information, email, password).
- Notification realtime includes: add friend, like, comment, reply.

2. Admin page
- Analytics:
  + Total users, posts, comments.
  + Chart new users, posts per month.
  + Top users, posts.
- Manage users:
  + Disable account.
  + Delete user.
  + View user profile.
  + Search user by name.
  
- Manage posts:
  + Delete post.
  + Search posts.
