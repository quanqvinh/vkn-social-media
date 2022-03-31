const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storagePost = multer.diskStorage({
	destination: (req, file, cb) => {
		let postId = req.body.postId;
		let dest = '../../../resources/images/posts/' + postId;

		if (fs.existsSync(dest))
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
		cb(null, req.body.postId + '-' + Date.now() + ext);
	}
});

const storageAvatar = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, '../../../resources/images/avatars');
	},
	fileFilter: (req, file, cb) => {
		if (file.mimetype.startsWith('image/'))
			cb(null, true);
		else
			cb(new Error('Invalid file type. Please choose image file'));
	},
	filename: (req, file, cb) => {
		let ext = path.extname(file.originalname);
		cb(null, req.body.postId + '-' + Date.now() + ext);
	}
})

module.exports = {
	uploadPost: multer({ storage: storagePost }),
	uploadAvatar: multer({ storage: storageAvatar }),
}