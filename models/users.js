const mongoose = require('mongoose');

let userSchema = new mongoose.Schema({
	
	_id: mongoose.Schema.Types.ObjectId,
	username: String,
	email: String,
	password: String,
	registration_date: String,
	is_verify: Boolean,
	contacts: Array,
	chat_groups: Array,
	is_active: String,
	profile: String,
	status: String,
	mobile: String,
	country: String,
	createdAt: { type: Date, default: Date.now },
	updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('users',userSchema);