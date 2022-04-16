const registerPostHandler = require('./post.socket');

module.exports = (io) => {
	const postNsp = io.of('/api/v1/post/');
};