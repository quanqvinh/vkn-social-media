const fs = require('fs');

const postResource = __dirname + '/../../../../resources/images/posts/';

module.exports = {
	getListImages(postId) {
		return fs.readdirSync(postResource + postId);
	}
};