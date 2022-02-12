const express = require('express');
const app = express();
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
const fileupload = require("express-fileupload");

var http = require('http').createServer(app);
var io = require('socket.io')(http)

const jwt = require('jsonwebtoken');
const User = require('./models/users');
const Chat = require('./models/chats');
const ChatGroup = require('./models/chat_groups');
const crypto = require('crypto');
const sessions = require('express-session');



let key = "password";
let algo = "aes256";
let jwtkey = "jwt";
let port = 4400;
var session;

mongoose.connect('mongodb://localhost:27017/chat_app',
{
	useNewUrlParser: true,
	useUnifiedTopology: true
}
).then(()=>{
	console.warn('Db connection done');
})

//session middleware
// app.use(sessions({secret: 'ssshhhhh',saveUninitialized: true,resave: true}));
app.use(sessions({
	secret: '2C44-4D44-WppQ38S',
	resave: true,
	saveUninitialized: true
}));

app.use(fileupload());

// Authentication and Authorization Middleware
var auth = function(req, res, next) {


	console.log(req.session)
	if (req.session !==undefined)
		return next();
	else
		return res.sendStatus(401);
};


app.use('/assets',express.static('assets'));
app.use('/public',express.static('public'));





app.set('view engine','ejs');

app.get('/', function(req,res){
	res.render('Home');
});

app.get('/login', function(req,res){
	res.render('Login');
});

app.post('/login', jsonParser, function(req,res){

	console.log(req.body)

	let checkUser = User.findOne({"email": req.body.email}).then((result)=>{
		console.log(result)
		if(result){
			if(result.is_verify == true){

				let decipher = crypto.createDecipher(algo,key);
				let decryptedPassword = decipher.update(result.password, "hex", "utf8") + decipher.final("utf8");
				if(decryptedPassword === req.body.password ){
					jwt.sign({result},jwtkey,{expiresIn: '3600s'},(err,token)=>{
						if(!err)
						{
							User.updateOne({email: req.body.email},{$set:{
								is_active: "online"
							}}).then((rest)=>{
								if(rest){

									session=req.session;
									session.userid=result._id;
									session.useremail=result.email;

									res.status(200).json({
										"status": 200,
										"response": "Login Successful",
										"token": token,
										"result": result
									})
								}
							})
						}
						else{
							res.status(400).json({
								"status": 400,
								"response": "Bad request",
								"error": err
							})
						}
					})
				}
				else{
					res.status(200).json({
						"status": 401,
						"response": "Password did not match."
					})
				}
			}
			else{
				res.status(200).json({
					"status": 401,
					"response": "Your account is not verified."
				})
			}
		}
		else{
			res.status(200).json({
				"status": 401,
				"response": "Email not registered"
			})
		}
	}).catch((err)=>{
		console.log(err) 
		res.status(400).json({
			"status": 400,
			"response": "Something went wrong. Try again",
			"error": err
		})
	});

});

app.get('/register', function(req,res){
	res.render('Register');
});

app.post('/register',jsonParser, async function(req,res){

	console.log('/////////////////////////////////////////////////////')
	console.log(req.body)
	console.log('/////////////////////////////////////////////////////')

	let oldUser = User.findOne({"email": req.body.email}).then((result)=>{
		if(result && result.is_verify == true){
			res.status(200).json({
				"status": 201,
				"response": "User already exists"
			})
		}
		else if(result && result.is_verify == false) {
			res.status(200).json({
				"status": 200,
				"response": "This email is already registered but not verified."
			})
		}
		else{
			let cipher = crypto.createCipher(algo,key);
			let encryptedPassword = cipher.update(req.body.password, "utf8", "hex") + cipher.final("hex");

			let data = req.body;
			var data_save = new User({
				_id: mongoose.Types.ObjectId(),
				username: data.username,
				email: data.email,
				password: encryptedPassword,
				registration_date: new Date(),
				mobile: '',
				profile: '',
				country: 'India',
				status: '',
				contacts: [],
				chat_groups: [],
				is_active: 'offline',
				is_verify: false
			});

			// console.warn(data_save);


			data_save.save().then((result)=>{

				console.log("New registered user's detail", result)

				if(req.body.refferal_id !='' && req.body.refferal_id != null){
					User.updateOne({_id: mongoose.Types.ObjectId(req.body.refferal_id)}, 
					{ 
						$push:{
							contacts:{
								uid: result._id,
								is_blocked: false
							}
						}
					}).then(rest1 => {
						console.log(rest1, 'Add 1 refferal to contacts')
						User.updateOne({_id: result._id}, 
						{ 
							$push:{
								contacts:{
									uid: mongoose.Types.ObjectId(req.body.refferal_id),
									is_blocked: false
								}
							}
						}).then(rest2 => {
							console.log(rest2, 'Add 2 refferal to contacts')
						}).catch(err2 => console.log(err2))
					}).catch(err1 => console.log(err))

					
				}
				jwt.sign({result},jwtkey,{expiresIn: '300s'},(err,token)=>{
					if(!err){

						res.status(201).json({
							"status": 200,
							"response": "User registered successfully",
							"token": token
						});
					}
					else{
						res.status(400).json({
							"status": 402,
							"response": "Something went wrong. Try again",
							"error":  err
						});
					}
				})

			}).catch((err)=>{
				console.log(err) 
				res.status(400).json({
					"status": 403,
					"response": "Something went wrong. Try again",
					"error": err
				})
			});
		}
	}).catch((err)=>{
		res.status(400).json({
			"status": 401,
			"response": "Something went wrong. Try again"
		})
	});

});


app.post('/verify-mail',jsonParser, async function(req,res){

	let transport = nodemailer.createTransport({
		host: 'smtp.gmail.com',
		service: 'gmail',
		port: 587,
		secure: false,
		requireTLS: true,
		auth:{
			user: 'helloriya30@gmail.com',
			pass: 'hello@riya'
		}
	})

	let cipher = crypto.createCipher(algo,key)
	let enc_email = cipher.update(req.body.email,"utf8","hex") + cipher.final("hex");

	let mailOptions = {
		from: 'Hello Riya',
		to: req.body.email,
		subject: 'Account Verification',
		html: `Hi User, you are successfully registerd to <a href="http://localhost:4400">Chat App</a>.<br/>
		Click the below link to verify your email:<br>
		<a target="blank" href="http://localhost:4400/verify_account?uid=${enc_email}">http://localhost:4400/verify_your_account</a>`
	}

	transport.sendMail(mailOptions,function(error, info){
		if(error){
			console.log(error)
			res.status(400).json({
				"status": 400,
				"response": "Something went wrong. Try again",
				"error": error
			})
		}
		else{
			res.status(200).json({
				"status": 200,
				"response": "Email sent successfully",
			})
		}
	})

});

app.post('/send-invitation-link',jsonParser, async function(req,res){

	let transport = nodemailer.createTransport({
		host: 'smtp.gmail.com',
		service: 'gmail',
		port: 587,
		secure: false,
		requireTLS: true,
		auth:{
			user: 'helloriya30@gmail.com',
			pass: 'hello@riya'
		}
	})

	let cipher = crypto.createCipher(algo,key)
	let enc_email = cipher.update(req.body.email,"utf8","hex") + cipher.final("hex");

	let mailOptions = {
		from: 'Hello Riya',
		to: req.body.email,
		subject: 'Invitaion Link',
		html: `Hi User, ${req.body.logger_email} has sent you an invitaion link for Chat App. Click the below link to get connected with us:<br>
		<a target="blank" href="http://localhost:4400/activate_account?uid=${req.body.logger_id}&uem=${enc_email}">http://localhost:4400/activate_account</a>`
	}

	transport.sendMail(mailOptions,function(error, info){
		if(error){
			console.log(error)
			res.status(400).json({
				"status": 400,
				"response": "Something went wrong. Try again",
				"error": error
			})
		}
		else{
			res.status(200).json({
				"status": 200,
				"response": "Invitation link successfully send to this email id",
			})
		}
	})

});

app.get('/activate_account',function(req,res){

	data = req.query;


	console.log(data)

	let decipher = crypto.createDecipher(algo,key);
	let decryptedEmail = decipher.update(req.query.uem,"hex","utf8") + decipher.final("utf8");
	User.findOne({email : decryptedEmail}).then(result => {
		console.log(result)
		if(result!=null && result!='null' && result!=undefined){
			console.log(result)
			res.render('Chat');
		}
		else{
			console.log("User Not found");
			res.render('Activate_Account',{ email: decryptedEmail, uid: req.query.uid});
		}
	})
	.catch(err => {
		console.warn(err)
	})


})

app.post('/user-profile',jsonParser, async function(req,res){

	User.findOne({ _id: mongoose.Types.ObjectId(req.body.uid) }, {_id:0, username: 1, status: 1, is_active: 1, profile: 1, country: 1, email: 1, mobile: 1 }).then(result => {
		if(result){
			res.json({
				status: 200,
				data: result,
				response: "success"
			})
		}
		else{
			res.json({
				status: 500,
				response: "Something went wrong."
			})
		}
	}).catch(err => {
		res.json({
			status: 400,
			response: "Bad Request"
		})
	})

});


app.get('/verify_account', function(req,res){

	if(req.query.uid !== undefined){

		let decipher = crypto.createDecipher(algo,key);
		let decryptedEmail = decipher.update(req.query.uid,"hex","utf8") + decipher.final("utf8");

		User.findOne({email: decryptedEmail}).then((result)=>{
			User.updateOne({email: decryptedEmail}, {$set:{
				is_verify: true
			}}).then((rest)=>{
				res.redirect('/email-verified')
			}).catch((err)=>{
				res.end("Error 1");
			})	
		}).catch((err)=>{
			res.end("Error 2");
		})
	}
	else{
		res.end("Error 3")
	}
});


app.get('/email-verified', function(req, res){
	res.render('Email_Verified_PG')
})


app.get('/users', async function(req,res){

	let users;
	let channels;

	let data = {};

	user_id = req.query.uid

	console.log(session)
	let new_ids = [];
	let new_group_ids = [];

	await User.findOne({_id: mongoose.Types.ObjectId(user_id)},{contacts: 1, chat_groups:1, _id: 0}).then(async (result) =>{
		if(result){

			result.contacts.forEach((e) => {
				new_ids.push(e.uid)
			});						
			console.log(new_ids, "New Users")

			result.chat_groups.forEach((e) => {
				new_group_ids.push(e)
			});
			console.log(new_group_ids, 'New Groups')
		}
	});

	await User.find({ _id : { $in: new_ids } } , { username: 1, is_active: 1, profile: 1, status: 1 }).then(usr=>{				
		data.users = usr				
	})

	await ChatGroup.find({ _id : { $in: new_group_ids } } , { group_name: 1, group_description: 1 }).then(channels=>{		
		data.channels = channels				
	});



	console.log(data)
	res.status(200).json(data);
})


app.get('/chats',function(req,res){
	logged_in_id = req.query.logger_id;
	chatted_id = req.query.chat_uid;

	chat_id_1 = `${logged_in_id}-${chatted_id}`;
	chat_id_2 = `${chatted_id}-${logged_in_id}`;

	console.log(chat_id_1, chat_id_2)

	let users_chat = Chat.findOne({ $or : [ {chat_id: chat_id_1}, {chat_id: chat_id_2} ] }, {chats: 1}).then(result => {

		// console.log(result)
		if(result){
			chats = result.chats;
			cid = result._id

			User.findOne({_id: mongoose.Types.ObjectId(chatted_id)},{_id: 0, is_active: 1, profile: 1}).then(rest=>{

				if(rest){

					res.status(200).json({
						chats : chats,
						cid: cid,
						is_active: rest.is_active,
						profile: rest.profile

					});
				}
				else{
					res.status(200).json({
						chats : chats,
						cid: cid,
						is_active: "",
						profile: ""

					});
				}

			})
		}
		else{
			res.status(200).json({
				chats : [],

				is_active: "",
				profile: ""

			});
		}


	})
})


app.get('/reset_password', function(req,res){
	res.render('ResetPassword');
});


app.get('/forgot_password', function(req,res){
	res.render('ForgotPassword');
});


app.get('/logout', function(req,res){

	req.session.destroy((err) => {
		if(err) {
			return console.log(err);
		}
		res.redirect('/');
	});
});


app.get('/chat_box', function(req,res){
	res.render('Chat');
});

http.listen(port, ()=>{
	console.log('Server is running at :http://localhost:',4400);
});


app.get('/update-profile', function(req,res){
	data = req.query
	// console.log(data);
	
	User.updateOne({_id: mongoose.Types.ObjectId(data.logger_id)}, {$set: {
		username: data.username,
		country: data.country,
		mobile: data.mobile,
		status: data.status
	}}).then(result => {	

		console.log("Getting result *****************************")
		console.log(result)
		res.status(200).json({
			status: 200,
			response: "Profile successfully updated."
		})
	}).catch(err => {
		console.warn(err);
		res.status(400).json({
			status: 400,
			response: "Something Went Wrong. Try again"
		})
	})
	
})


app.post('/update-profile-pic', jsonParser, function(req,res){
	// data = req.query
	data = req.body;
	file_data = req.file
	console.log(data, file_data);
	
	User.updateOne({_id: mongoose.Types.ObjectId(data.logger_id)}, {$set: {
		profile: data.profile
	}}).then(result => {	

		console.log("Getting result *****************************")
		console.log(result)
		res.status(200).json({
			status: 200,
			response: "Profile successfully updated."
		})
	}).catch(err => {
		console.warn(err);
		res.status(400).json({
			status: 400,
			response: "Something Went Wrong. Try again"
		})
	})
	
})





var iousers = [];


io.on('connection',function(socket){
	console.log("User connected");


	socket.on('connected', function(userId){
		console.log(userId, "On user connected")
		iousers[userId] = socket.id
		console.log(iousers, "Connected Users")
	})


	socket.on("send_message", function(data){
		console.log(data)

		let users_chat = Chat.findOne({_id: mongoose.Types.ObjectId(data.cid)}).then((result)=>{
			console.log(typeof(result), " Got It ")
			if(typeof(result) == "object" && result != null ){

				console.log("Inside IF Statement", result)
				Chat.updateOne({
					_id: mongoose.Types.ObjectId(data.cid)
				},{
					$push:{
						chats:{
							from_id: data.from_id,
							to_id: data.to_id,
							has_files: data.has_files,
							has_images: data.has_images,
							isReplied: data.isReplied,
							datetime: data.datetime,
							msg: data.msg
						}
					}
				}
				).then((rest)=>{
					if(rest){
						socket.to(iousers[data.to_id]).emit('new_message',{msg:data.msg, from_id: data.from_id, to_id: data.to_id, datetime: data.datetime});
					}
				}).catch((err)=>{
					console.warn(err)
				})
			}
			else{
				console.log("Inside else Statement", result)
				ch_id = data.from_id + "-" + data.to_id
				let chat_data = new Chat({
					_id: mongoose.Types.ObjectId(),
					chat_id: ch_id,	

					chats:[{
						from_id: data.from_id,
						to_id: data.to_id,
						has_files: data.has_files,
						has_images: data.has_images,
						isReplied: data.isReplied,
						datetime: data.datetime,
						msg: data.msg
					}]				
				});

				chat_data.save().then((rest)=>{
					if(rest){
						io.emit("new_message", {msg:data.msg, from_id: data.from_id, to_id: data.to_id, datetime: data.datetime});
					}
				}).catch((err)=>{
					console.warn(err)
				})

			}
		}).catch((err)=>{
			console.log(err) 			
		});

	})

	socket.on("new_message", function(data){
		console.log(data)
	})

})


app.post("/photo",  function(req, res)
{
	console.log("Loger Id : " ,req.body)
	if (!req.files) {
		return res.status(400).send("No files were uploaded.");
	}

	const file = req.files.userPhoto;


	file_name = file.name
	file_extension = file_name.split('.')[1];
	new_file_name =  req.body.uid+'.'+file_extension

	console.log(file_name,  " File Extension ///////////////")
	const path = __dirname + "/public/uploads/" + new_file_name;
  // const path = __dirname + "/public/uploads/" + file.name;

  file.mv(path, (err) => {
  	if (err) {
  		return res.status(500).send(err);
  	}

  	User.updateOne({_id: mongoose.Types.ObjectId(req.body.uid)} , { $set : {
  		profile: new_file_name
  	}}).then(result => {

  		return res.send({ status: "200", response: "Profile Photo successfully uploaded.", path: new_file_name });
  	}).catch(err => {

  		return res.send({ status: "400", response: "Something went wrong. Try again"});
  	})

  });


});


app.post('/create-group', jsonParser,async function(req,res){
	data = req.body

	console.log(data);


	var data_save = new ChatGroup({
		_id: mongoose.Types.ObjectId(),
		group_name: data.group_name,
		group_description: data.group_desc,
		contacts: data.selected_users,
		chats: [],
		createdBy: data.logger_id
	});


	data_save.save().then(async(result) => {

		let users = data.selected_users;

		users.forEach(async(item) => {

			console.log(item, "Update User Chat Group Data")
			await User.updateOne({_id: mongoose.Types.ObjectId(item)},
			{
				$push :{
					chat_groups: result._id
				}
			}).then(rest => {
				console.log(rest)
			}).catch(err => {
				res.json({ 
					'status': 400,
					'response': 'Bad Request',
					'error': err
				})
			})
		})
		
	}).catch(err => {
		res.json({ 
			'status': 200,
			'response': 'Something went wrong. Try again',
			'error': err
		})
	})

	res.json({ 
		'status': 200,
		'response': ' Group successfully created',
		'data': data_save
	})


})