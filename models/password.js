var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var PasswordSchema = new Schema({
	password: {type:String,required:true},
});

/*
UserSchema.virtual('url').get(function(){
	return '/catalog/user/' + this._id;
});*/

module.exports = mongoose.model('Password',PasswordSchema);