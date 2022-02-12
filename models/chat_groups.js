const mongoose = require('mongoose');

let chatGroupSchema = new mongoose.Schema({
	
	_id: mongoose.Schema.Types.ObjectId,
	group_name: String,
	group_description: String,
	contacts: Array,
	chats: Array,
	createdBy: String,
	createdAt: { type: Date, default: Date.now },
	updatedAt: { type: Date, default: Date.now }
	
});


// In this, use the actual name of your mongo db collection
module.exports = mongoose.model('chatGroup',chatGroupSchema);