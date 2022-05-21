const fs = require('fs');
const path = require('path');

const ext = '.png';

module.exports = {
    postResource: path.join(__dirname, '../../resources/images/posts'),
    avatarResource: path.join(__dirname, '../../resources/images/avatars'),
    messageResource: path.join(__dirname, '../../resources/images/messages'),
    createPostPath(postId) {
        return path.join(this.postResource, postId);
    },
    createAvatarFile(userId) {
        return path.join(this.avatarResource, userId + ext);
    },
    createMessageImageFile(messageId) {
        return path.join(this.messageResource, messageId + ext);
    },
    getListPostImages(postId) {
        postId = postId.toString();
        let dirPath = path.join(this.postResource, postId);
        if (!fs.existsSync(dirPath)) {
            console.log('not exist');
            return [];
        }
        return fs.readdirSync(dirPath);
    }
};
