const multer = require('multer');
const path = require('path');
const fs = require('fs');
const ObjectId = require('mongoose').Types.ObjectId;
const resourceHelper = require('../../../utils/resourceHelper');

const storagePost = multer.diskStorage({
    destination: (req, file, cb) => {
        let postId = req.body.postId;
        if (!postId) postId = new ObjectId();
        req.body.postId = postId.toString();
        let dest = resourceHelper.createPostPath(postId.toString());
        if (fs.existsSync(dest) && req.url !== '/new' && req.method === 'PUT')
            dest += '-new';

        fs.mkdirSync(dest, {
            recursive: true,
        });
        cb(null, dest);
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) cb(null, true);
        else cb(new Error('Invalid file type. Please choose image file'));
    },
    filename: (req, file, cb) => {
        let ext = '.png';
        cb(null, Date.now() + ext);
    },
});

const storageAvatar = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, resourceHelper.avatarResource);
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) cb(null, true);
        else cb(new Error('Invalid file type. Please choose image file'));
    },
    filename: (req, file, cb) => {
        let dest = resourceHelper.avatarResource;
        let ext = '.png';
        let filename = req.auth.userId.toString() + ext;
        if (fs.existsSync(dest + '/' + filename)) filename = 'new-' + filename;
        req.filename = filename;
        cb(null, filename);
    },
});

module.exports = {
    uploadPost: multer({
        storage: storagePost,
    }),
    uploadAvatar: multer({
        storage: storageAvatar,
    }),
};
