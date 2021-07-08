var mongoose = require('mongoose');
const {DateTime} = require('luxon');

var Schema = mongoose.Schema;

var MessageSchema = new Schema({
	title:{type:String, required:true},
	description: {type:String, required:true},
	username: {type: Schema.Types.ObjectId, ref: 'User', required: true},
	timestamp: {type:Date, required:true},
});

MessageSchema.virtual('formatted_timestamp').get(function(){
	return DateTime.fromJSDate(this.timestamp).toFormat('yyyy-MM-dd');
});



module.exports = mongoose.model('Message',MessageSchema);