const mongoose = require('mongoose');

let chatSchema = new mongoose.Schema({
	
	_id: mongoose.Schema.Types.ObjectId,
	chat_id: String,
	chats: Array,
	createdAt: { type: Date, default: Date.now },
	updatedAt: { type: Date, default: Date.now }
	
});


// In this, use the actual name of your mongo db collection
module.exports = mongoose.model('chats',chatSchema);