const User = require('../models/user.model');
const Post = require('../models/post.model');
const Timer = require('../models/timer.model');
const Token = require('../models/token.model');
const Request = require('../models/request.model');
const Notification = require('../models/notification.model');
const Comment = require('../models/comment.model');
const Report = require('../models/report.model');
const Room = require('../models/room.model');
const ObjectId = require('mongoose').Types.ObjectId;
const mongodbHelper = require('./mongodbHelper');
const { faker } = require('@faker-js/faker');
const crypto = require('./crypto');
const download = require('download');
const resourceHelper = require('./resourceHelper');
const fse = require('fs-extra');

function randomImageType() {
    let imageType = [
        'abstract',
        'animals',
        'business',
        'cats',
        'city',
        'food',
        'nightlife',
        'fashion',
        'people',
        'nature',
        'sports',
        'technics',
        'transport'
    ];
    return imageType[Math.floor(Math.random() * imageType.length)];
}

module.exports = {
    async clearAllData() {
        await mongodbHelper.executeTransactionWithRetry({
            async executeCallback(session) {
                console.log('\nClearing data...');
                let [userCount, ...counters] = await Promise.all([
                    User.countDocuments(),
                    Post.countDocuments(),
                    Timer.countDocuments(),
                    Token.countDocuments(),
                    Request.countDocuments(),
                    Notification.countDocuments(),
                    Comment.countDocuments(),
                    Report.countDocuments(),
                    Room.countDocuments()
                ]);
                let [deleteUserStatus, ...deleteStatus] = await Promise.all([
                    User.deleteMany({
                        username: { $nin: ['admin', 'vknuser'] }
                    }).session(session),
                    Post.deleteMany({}).session(session),
                    Timer.deleteMany({}).session(session),
                    Token.deleteMany({}).session(session),
                    Request.deleteMany({}).session(session),
                    Notification.deleteMany({}).session(session),
                    Comment.deleteMany({}).session(session),
                    Report.deleteMany({}).session(session),
                    Room.deleteMany({}).session(session)
                ]);
                if (userCount - deleteUserStatus.deletedCount > 2)
                    throw new Error('Delete user failed');
                for (let i = 0; i < counters.length; i++)
                    if (deleteStatus[i].deletedCount < counters[i])
                        throw new Error('Delete (' + i + ') failed');
                console.log('Clearing resource...');
                fse.emptyDirSync(resourceHelper.avatarResource);
                fse.emptyDirSync(resourceHelper.postResource);
                console.log('Done');
            },
            successCallback() {
                console.log('Delete successful');
            },
            errorCallback(error) {
                console.log(error);
                console.log('Delete failed');
            }
        });
    },

    async createUserAndPost(numberOfUsers = 1, maxPostPerUser = 2) {
        let startDate = new Date('2021-01-01T00:00:00').getTime();
        let endDate = new Date().getTime();
        let userIds = [],
            postIds = [];
        await mongodbHelper.executeTransactionWithRetry({
            async executeCallback(session) {
                console.log(`Start create ${numberOfUsers} user...`);

                console.log('\nCreate user and post data...');
                for (let i = 0; i < numberOfUsers; i++) {
                    const userId = new ObjectId();
                    const firstName = faker.name.firstName();
                    const lastName = faker.name.lastName();
                    const name = firstName + ' ' + lastName;
                    const username = faker.internet.userName(firstName, lastName);
                    const email = faker.internet.email(firstName, lastName);
                    const password = username;
                    const gender = faker.name.gender(true);
                    const dob = faker.date.past(30);
                    const bio = faker.lorem.sentence(10);
                    const userCreatedAt = faker.date.between(startDate, endDate);
                    console.log(`\n${i + 1}. Create user data...`);
                    await User.create(
                        [
                            {
                                _id: userId,
                                username,
                                email,
                                auth: {
                                    password: crypto.hash(password),
                                    isVerified: true
                                },
                                name,
                                gender,
                                dob,
                                bio,
                                createdAt: userCreatedAt
                            }
                        ],
                        { session }
                    );
                    let numberOfPosts = Math.floor(Math.random() * maxPostPerUser) + 1;
                    console.log(`${i + 1}. Create ${numberOfPosts} posts...`);
                    for (let j = 0; j < numberOfPosts; j++) {
                        console.log(`${i + 1} - ${j + 1}`);
                        const postId = new ObjectId();
                        const numberOfLines = Math.floor(Math.random() * 3) + 1;
                        let caption = faker.lorem.sentences(numberOfLines, '\n');
                        let postCreatedAt = faker.date.between(userCreatedAt, endDate);
                        await Promise.all([
                            Post.create(
                                [
                                    {
                                        _id: postId,
                                        user: userId,
                                        caption,
                                        createdAt: postCreatedAt
                                    }
                                ],
                                { session }
                            ),
                            User.updateOne(
                                { _id: userId },
                                {
                                    $push: { posts: postId }
                                }
                            ).session(session)
                        ]);
                        postIds.push(postId);
                    }
                    userIds.push(userId);
                }
            },
            successCallback() {
                console.log(`Created user and post data successfully`);
            },
            errorCallback(error) {
                console.log(error);
                console.log('Created failed');
            }
        });
        while (true) {
            try {
                console.log(`\nSave ${numberOfUsers} avatars`);
                const avatarResource = resourceHelper.avatarResource;
                for (let i = 0; i < userIds.length; i++) {
                    const avatar = faker.image.avatar();
                    console.log(`${i + 1}. Saving avatar...`);
                    await download(avatar, avatarResource, {
                        filename: userIds[i].toString() + '.png'
                    });
                }

                console.log(`\nSave ${postIds.length} posts...`);
                for (let i = 0; i < postIds.length; i++) {
                    const numberOfImages = Math.floor(Math.random() * 3) + 1;
                    const imageCategory = randomImageType();
                    const postResource = resourceHelper.createPostPath(postIds[i].toString());
                    console.log(
                        `${i + 1}. Post ${numberOfImages} ${imageCategory} image${
                            numberOfImages > 1 ? 's' : ''
                        }...`
                    );
                    for (let j = 0; j < numberOfImages; j++) {
                        console.log(`${i + 1}.${j + 1}. Saving image ...`);
                        let postImage = faker.image.imageUrl(640, 640, imageCategory, true);
                        await download(postImage, postResource, { filename: Date.now() + '.png' });
                    }
                }
                console.log('Download images successfully');
                break;
            } catch (error) {
                console.log(error);
                fse.emptyDirSync(resourceHelper.avatarResource);
                fse.emptyDirSync(resourceHelper.postResource);
                continue;
            }
        }
    }
};
