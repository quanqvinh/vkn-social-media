const multer = require('multer');
const path = require('path');
const fs = require('fs');
const ObjectId = require('mongoose').Types.ObjectId;

const storagePost = multer.diskStorage({
	destination: (req, file, cb) => {
		let postId = req.body.postId;
		if (!postId)
			postId = new ObjectId();
		req.body.postId = postId;
		let dest = __dirname + '/../../../resources/images/posts/' + postId;
		if (fs.existsSync(dest) && req.url !== '/new' && req.method === 'PUT')
			dest += '-new';

		fs.mkdirSync(dest, { recursive: true });
		cb(null, dest);
	},
	fileFilter: (req, file, cb) => {
		if (file.mimetype.startsWith('image/'))
			cb(null, true);
		else
			cb(new Error('Invalid file type. Please choose image file'));
	},
	filename: (req, file, cb) => {
		let ext = path.extname(file.originalname);
		cb(null, Date.now() + ext);
	}
});

const storageAvatar = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, __dirname + '/../../../resources/images/avatars');
	},
	fileFilter: (req, file, cb) => {
		if (file.mimetype.startsWith('image/'))
			cb(null, true);
		else
			cb(new Error('Invalid file type. Please choose image file'));
	},
	filename: (req, file, cb) => {
		let dest = __dirname + '/../../../resources/images/avatars';
		let ext = path.extname(file.originalname);
		let filename = req.decoded.userId.toString() + ext;
		if (fs.existsSync(dest + '/' + filename))
			filename = 'new-' + filename;
		req.filename = filename;
		cb(null, filename);
	}
})

module.exports = {
	uploadPost: multer({ storage: storagePost }),
	uploadAvatar: multer({ storage: storageAvatar }),
}