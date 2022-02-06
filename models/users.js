const mongoose = require('mongoose');

let userSchema = new mongoose.Schema({
	
	_id: mongoose.Schema.Types.ObjectId,
	username: String,
	email: String,
	password: String,
	registration_date: String,
	is_verify: Boolean,
	contacts: Array,
	is_active: String,
	profile: String,
	status: String,
	mobile: String,
	country: String,
	createdAt: { type: Date, default: Date.now },
	updatedAt: { type: Date, default: Date.now }
	
	// _id: mongoose.Schema.Types.ObjectId,
	// username: { type: String, default: null },
	// email: { type: String, unique: true },
	// password: { type: String },
	// registration_date: { type: String },
	// token: { type: String },
	// is_verify: { type: Boolean },

});

module.exports = mongoose.model('users',userSchema);