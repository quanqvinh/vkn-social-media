const mongoose = require('mongoose');
const User = require("../models/user.model");

module.exports = {
	// [GET] /api/v1/user/me/profile
	getMyProfile(req, res, next) {
		let id = req.decoded.user_id;
		User.findOne({_id: id}, {rooms:0, auth:0})
			.lean() 
			.then(data =>{			
				res.status(200).json(data); 
			})
			.catch(err => {
				res.status(500).json({status: 'error', message: 'Error at server'});
			})	
	},
	// [GET] /api/v1/user
	getUserProfile(req, res, next) {
		let id = req.body.id;
		if (id){
			User.findOne({_id: id}, {rooms:0, auth:0})
			.lean() 
			.then(data =>{			
				res.status(200).json(data); 
			})
			.catch(err => {
				res.status(500).json({status: 'error', message: 'Error at server'});
			})	
		}
		else {
			res.status(400).json({status: 'error', message: 'Bad request. User id is needed.'});
		}
		
	},
	// [PATCH] /api/v1/user/edit
	editUserProfile(req, res, next) {
		let id = req.decoded.user_id;
		let reqData = req.body;
		User.findOneAndUpdate({_id: id}, reqData)
			.then(data => {
				res.status(200).json({status: 'success', message: "User has been edited."});
			})
			.catch(err => {
				res.status(500).json({status: 'error', message: "Error at server."});
			});
	},
	// [DELETE] /api/v1/user/delete
	softDeleteUser(req, res, next) {
		let id = req.params.id;
		User.delete({_id: id})
			.then(data => {
				res.status(200).json({status: "success", message: "User has been moved to recycle bin."});
			})
			.catch(err => {
				res.status(500).json({status: 'error', message: "Error at server."});
			})
	}
};