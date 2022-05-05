const fs = require('fs');
const path = require('path');

const ext = '.png';

module.exports = {
	postResource: path.join(__dirname, '../../../../resources/images/posts'),
	avatarResource: path.join(__dirname, '../../../../resources/images/avatars'),
	messageResource: path.join(__dirname, '../../../../resources/images/messages'),
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
		return fs.readdirSync(path.join(this.postResource, postId));
	}
};