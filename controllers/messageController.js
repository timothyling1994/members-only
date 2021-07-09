const { body,validationResult } = require('express-validator');
var User = require('../models/user');
var Message = require('../models/message');
var async = require('async');

exports.message_list = function(req,res,next){

	Message.find({}).populate('username').exec(function(err,list_messages){
		if(err)
		{
			return next(err);
		}

		let sortedArr = list_messages.sort(function(a,b){
			return new Date(b.timestamp) - new Date(a.timestamp);
		});
		console.log(req.user.status);

		res.render('home',{list_messages:sortedArr, status: req.user.status});
	});
};

exports.create_message_get = function(req,res,next){
	res.render("create_message_form");
};

exports.create_message_post = [

	body('title').isLength({min:1}).escape().withMessage('Title must be specified'),
	body('description').isLength({min:1}).escape().withMessage('Description must be specified'),

	(req,res,next)=>{
		const errors = validationResult(req);

		if(!errors.isEmpty()){
			res.render('create_message_form',{errors:errors.array()});
			return;
		}

		else
		{
		
				let message = new Message(
				{
					title: req.body.title,
					description: req.body.description,
					username: req.user,
					timestamp: Date.now(),
				});

				message.save(function(err){
					if(err){return next(err);}
					res.redirect("/home");
				})
			//});

		}
	}
];