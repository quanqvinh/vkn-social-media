const userRouter = require('./user.router');
const allUserRouter = require('./allUser.router');


module.exports = (app) => {
	app.use('/admin/api/v1/user', userRouter);
	app.use('/admin/api/v1/users', allUserRouter);
	
};