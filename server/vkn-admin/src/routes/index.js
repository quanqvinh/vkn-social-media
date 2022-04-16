const userRouter = require('./user.router');


module.exports = (app) => {
	app.use('/admin/api/v1/user', userRouter);
	app.use('/admin/api/v1/users', userRouter);
	
};