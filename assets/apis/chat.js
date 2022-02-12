const socket = io();

// const crypto = crypto();

// Login User

var logger_id =  localStorage.getItem("uid");
var email =  localStorage.getItem("uemail");
var username =  localStorage.getItem("uname");
var chatted_id = '';
var uname = "";
var class_id = '';
var u_detail
socket.on("connect",()=>{
	console.log("Socket connected");
})

 $(document).ready(function(){

            console.log(logger_id, 'Checking logging user')
            if(logger_id==null || logger_id == 'null' || logger_id===undefined){

                window.location.href = '/login'
            }
        })

 $('.logout').on('click', function(){
            localStorage.clear();
 })






function get_user_profile(uid){
	$.ajax({
		type: 'POST',
		contentType: 'application/json',
		data: JSON.stringify({uid: uid}),
		url: '/user-profile',

		success:function(data){

			u_detail = data.data;

			return data;		
			
		}

	})
}

$(document).ready(function(){
	console.log("logger_id", logger_id, username, email);

	data = get_user_profile(logger_id);

	setTimeout(function(){

		data = u_detail	

		// console.log(data)

		$('#loggin_user').text(data.username)
		$('.profilebar h5').text(data.username)
		$('#updateUsername input').val(data.username)
		$('#updateEmail input').val(data.email)
		$('#updateMobile input').val(data.mobile)
		$('#updateLocation input').val(data.country)
		$('#updateStatus input').val(data.status)
			// console.log(1)

			if(data.profile != "" && data.profile !== undefined){
				$('.profile-pic').attr("src", '/public/uploads/'+data.profile)
			}
		}, 500);


	socket.emit("connected",logger_id)

	getUsersList();

})



function getUsersList(){
	$.ajax({
		type: "GET",
		contentType: "application/json",
		data:  {uid: localStorage.getItem("uid")},
		url: '/users',
		success:function(data){

			show_data_for_new_chat(data.users);
			show_data_for_group_chat(data.users);

			users = data.users;
			channels = data.channels;
			
			result = '';

			users.forEach((user,index)=>{
				status = '';
				img = "assets/images/girl.svg"
				if(user.is_active == 'offline'){
					status = 'offline'
				}
				
				if(user.profile !== undefined && user.profile != ""){
					img = '/public/uploads/'+user.profile
				}

				result+= `<a class="nav-link" id="chat-${user._id}" data-name="${user.username}" data-id="${user._id}" data-toggle="pill" href="#chat-second" role="tab" aria-controls="chat-second" aria-selected="true">
				<div class="media ">
				<div class="user-status ${status}"></div>
				<img class="align-self-center rounded-circle" src="${img}" alt="User Image">
				<div class="media-body">
				<h5>${user.username}<span class="chat-timing">02:30 pm</span></h5>
				<p class="last_chat"></p>
				</div>
				</div>
				</a>`
			});

			$('#chat-list-tab').empty();

			$('#chat-list-tab').addClass('chat-list-tab-'+logger_id);

			$('.chat-list-tab-'+logger_id).html(result);


			show_users_groups(data.channels)
		}

	});
}


function show_users_groups(channels){

	result = '';

			channels.forEach((channel,index)=>{
				status = '';
				img = "assets/images/girl.svg"
				

				result+= `<a class="nav-link" id="chat-${channel._id}" data-name="${channel.group_name}" data-id="${channel._id}" data-toggle="pill" href="#chat-second" role="tab" aria-controls="chat-second" aria-selected="true">
				<div class="media ">
				<div class="channel-status ${status}"></div>
				<img class="align-self-center rounded-circle" src="${img}" alt="channel Image">
				<div class="media-body">
				<h5>${channel.group_name}<span class="chat-timing"></span></h5>
				<p class="last_chat"></p>
				</div>
				</div>
				</a>`
			});

			$('#chat-group-tab').empty();

			$('#chat-group-tab').addClass('chat-group-tab-'+logger_id);

			$('.chat-group-tab-'+logger_id).html(result);


}


function show_data_for_new_chat(data){
	// console.log(data);
	data.sort((a,b) => (a.username > b.username) ? 1 : ((b.username > a.username) ? -1 : 0))	

	result = '';
	data.forEach((user,index)=>{
		status = '';
		img = "assets/images/girl.svg"
		if(user.is_active == 'offline'){
			status = 'offline'
		}

		if(user.profile !== undefined && user.profile != ""){
			img = '/public/uploads/'+user.profile
		}

		result+= `<a class="nav-link" id="chat-${user._id}" data-name="${user.username}" data-id="${user._id}" data-toggle="pill" href="#chat-second" role="tab" aria-controls="chat-second" aria-selected="true">
		<div class="media ">
		<div class="user-status"></div>
		<img class="align-self-center rounded-circle" src="${img}" alt="User Image">
		<div class="media-body">
		<h5>${user.username}<span class="chat-timing">02:30 pm</span></h5>
		<p class="last_chat">${user.status}</p>
		</div>
		</div>
		</a>`

	});

	$('#new-chat-tab').empty()
	$('#new-chat-tab').addClass('new-chat-tab-'+logger_id);
	$('.new-chat-tab-'+logger_id).html(result);
}

function show_data_for_group_chat(data){
	result = '<ul class="list-unstyled">';

data.forEach((user,index)=>{
		status = '';
		img = "assets/images/girl.svg"
		if(user.is_active == 'offline'){
			status = 'offline'
		}

		if(user.profile !== undefined && user.profile != ""){
			img = '/public/uploads/'+user.profile
		}

	result+= `<li class="media li-${user._id}">
                                    <img class="align-self-center rounded-circle" src="${img}" alt="Generic placeholder image">
                                    <div class="media-body">
                                        <h5><span>${user.username}</span></h5>
                                        <p>${user.status}</p>
                                    </div>
                                    <div class="custom-control custom-checkbox">
                                        <input type="checkbox" class="custom-control-input" value="${user._id}" name="selected_users[]" id="check-${user._id}" >
                                        <label class="custom-control-label" for="check-${user._id}"></label>
                                    </div>
                                </li>`
})

result+='</ul>'

	$('.add-users-list').empty();
	$('.add-users-list').html(result);


}


$(document).on('click','#chat-list-tab a',function(){

	console.log(this)
	chatted_id = $(this).attr("data-id");
	uname = $(this).attr("data-name");

	class_id = logger_id+'-'+chatted_id


	show_users_chat();

	get_user_profile(chatted_id);

	setTimeout(function(){
		data = u_detail
		$('.userbar p').text(data.country)
		$('.userbar h5').text(data.username)
		$('.user-about span').text(data.status)
		$('.user-about .email').text(data.email)
		$('.user-about .mobile').text(data.mobile)
			// console.log(1)

			if(data.profile != "" && data.profile !== undefined){
				$('.user-pic').attr("src", '/public/uploads/'+data.profile)
			}
		},2000)
	
})

$(document).on('click', '#new-chat-tab a' ,function(){

	console.log(this)
	chatted_id = $(this).attr("data-id");
	uname = $(this).attr("data-name");

	class_id = logger_id+'-'+chatted_id


	show_users_chat();

	get_user_profile(chatted_id);

	setTimeout(function(){
		data = u_detail
		$('.userbar p').text(data.country)
		$('.userbar h5').text(data.username)
		$('.user-about span').text(data.status)
		$('.user-about .email').text(data.email)
		$('.user-about .mobile').text(data.mobile)
			// console.log(1)

			if(data.profile != "" && data.profile !== undefined){
				$('.user-pic').attr("src", '/public/uploads/'+data.profile)
			}
		},2000)
	
})



$(document).on('click','#button-addonsend', function(){
	let msg = $(".chat-messagebar input").val();
	let cid = $(".chat-messagebar form").attr("data-id");

	datetime = formatAMPM(new Date);
	data = {		
		cid: cid, 
		from_id: logger_id,
		to_id: chatted_id,
		msg: msg,
		isReplied: 1,
		has_files: [],
		has_images: [],
		datetime: datetime
	}

	div_id = "_"+randStr(32)
	new_chat_id = data.from_id+'-'+data.to_id;

	show_latest_chat('right',data,new_chat_id, div_id, logger_id);
	$(".chat-messagebar input").val('');

	socket.emit("send_message",data);

});

function formatAMPM(date) {
	var hours = date.getHours();
	var minutes = date.getMinutes();
	var ampm = hours >= 12 ? 'pm' : 'am';
	hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  minutes = minutes < 10 ? '0'+minutes : minutes;
  var strTime = hours + ':' + minutes + ' ' + ampm;
  return strTime;
}



function show_users_chat(){
	$.ajax({
		type: "GET",
		contentType: "application/json",
		data:  {logger_id: logger_id , chat_uid: chatted_id},
		url: '/chats',
		success:function(data){

			console.log(data)

			chats = data.chats;
			result = '';

			if(data.is_active == 'offline'){
				$('.chat-head .user-status').addClass('offline')
			}
			else{
				$('.chat-head .user-status').removeClass('offline')
			}

			$('.chat-head h5').empty()
			$('.chat-head p').empty()
			$('.chat-head h5').text(uname)
			$('.chat-head p').text(data.is_active)
			$('.chat-head').css('display','block')
			$('.chat-bottom').css('display','block')
			$('.chat-messagebar form').attr("data-id",data.cid)

			let div_id;

			if(chats.length>0 ){
				result+= `<div class="chat-day text-center mb-3">
				<span class="badge badge-secondary-inverse">Today</span>
				</div> `;
				chats.forEach((chat,index)=>{

				div_id = "_"+randStr(32)

				align = 'left';
				if(chat.from_id == logger_id){
					align = 'right'
				}

				result+= `<div class="chat-message chat-message-${align}" id="${div_id}">
				<div class="chat-message-text">
				<span>${chat.msg}</span>
				</div>
				<div class="chat-message-meta">
				<span>${chat.datetime}<i class="feather icon-check ml-2"></i></span>
				</div>
				</div>`

			})
			}
			else{
				result+= `<div class="empty-screen">
				<img src="assets/images/empty-logo.png" class="img-fluid" alt="empty-logo">
				<h4 class="my-3">No Conversation Yet.</h4>
				</div>`;
			}

			$('#chat-second').addClass('user-'+class_id)

			
			$('.user-'+class_id).html(result);

			console.log("Div Id : ", div_id)

			setTimeout(()=>{
				window.location.hash  = "#"+div_id;

			},100)
		}

	});
}


function scrollSmoothToBottom(id) {
	var div = document.getElementById(id);

	$('#' + id).animate({
		scrollTop: div.scrollHeight - div.clientHeight
	}, 500);
}


socket.on("new_message",(data)=>{
	console.log("New message received");
	console.log(data);

	let align = "left"
	div_id = "_"+randStr(32)
	new_chat_id = data.to_id+'-'+data.from_id;
	chatter_div_id = data.to_id;

	if(data.from_id != logger_id){
	show_latest_chat(align,data,new_chat_id, div_id, chatter_div_id);
	new Audio('/assets/notify/Notification.mp3').play();
}

})

function randStr(len) {
	let s = '';
	while (s.length < len) s += Math.random().toString(26).substr(2, len - s.length);
	return s;
}


function show_latest_chat(position, data, current_div_id, chat_div_id,chatter_div_id) {
	
	result= `<div class="chat-message chat-message-${position}" id="${chat_div_id}">
	<div class="chat-message-text">
	<span>${data.msg}</span>
	</div>
	<div class="chat-message-meta">
	<span>${data.datetime}<i class="feather icon-check ml-2"></i></span>
	</div>
	</div>`

	$('.user-'+current_div_id).append(result);

	setTimeout(()=>{
		window.location.hash  = "#"+div_id;

	},100)
}



$(document).on('click', '#button-addon-group-username', function(){
	document.getElementById("edit_username").focus();
})



$(document).on('click', '#button-addon-group-location', function(){
	document.getElementById("edit_country").focus();
})



$(document).on('click', '#button-addon-group-status', function(){
	document.getElementById("edit_status").focus();
})



$(document).on('click', '#button-addon-group-password', function(){
	document.getElementById("edit_password").focus();
})



$(document).on('click', '#button-addon-group-mobile', function(){
	document.getElementById("edit_mobile").focus();
})



$(document).on('click', '.update-profile', function(){
	let uname =  $('#edit_username').val();
	// let password = $('#edit_password').val();
	let country = $('#edit_country').val();
	let status = $('#edit_status').val();
	let mobile = $('#edit_mobile').val();
	let countError = 0

	if(uname == ""){
		countError++;
		$('#usernameError').text("Username is mendatory");
	}
	else{
		$('#usernameError').empty();		
	}

	if(countError==0){
		$.ajax({
			type: "GET",
			contentType: "application/json",
			data:  {logger_id: logger_id , username: uname, password: "", country: country, mobile: mobile, status: status},
			url: '/update-profile',
			success:function(data){

				$('.profile_update_status').show()

				if(data.status == 200){
					$('.profile_update_status').addClass('success')
				}
				else{
					$('.profile_update_status').addClass('failure')
				}
				$('.profile_update_status span').text(data.response)
				console.log(data)
			}
		})
	}
})



$(document).on('click','.profile_update_status .feather', function(){
	$('.profile_update_status').hide()	
})



/* -- Chat Profile Pic Upload -- */    
var readURL = function(input) {
	if (input.files && input.files[0]) {
		var reader = new FileReader();
		reader.onload = function (e) {
			$('.profile-pic').attr('src', e.target.result);
		}    
		reader.readAsDataURL(input.files[0]);
	}
}


$(".profile-upload").on('change', function(){
	readURL(this);
	var form_data = new FormData();
	form_data.append('userPhoto', $('#userPhoto')[0].files[0])
	form_data.append('uid', logger_id)


	console.log(form_data);

	$.ajax({

		url: '/photo',
		type: "POST",
		data: form_data,
		processData: false,  // tell jQuery not to process the data
       contentType: false,  // tell jQuery not to set contentType
       success:function(data){

       	$('.profile_update_status').show()

       	if(data.status == 200){
       		$('.profile_update_status').addClass('success');
       		localStorage.setItem("uprofile", data.path)
       	}
       	else{
       		$('.profile_update_status').addClass('failure')
       	}
       	$('.profile_update_status span').text(data.response)
       	console.log(data)
       }

   })

	return false;

});    
$(".upload-button").on('click', function() {
	$(".profile-upload").click();
});


$(document).on('click','#add_new_user', function(){


	let email = $('#new_user_email').val();

	$.ajax({
		type: 'POST',
		contentType: "application/json",
		data: JSON.stringify({logger_id: logger_id, email: email, logger_email: email}),
		url: '/send-invitation-link',
		success:function(data){
			console.log(data)

			$('.mail_status').show();

			if(data.status == 200){
				$('.mail_status').addClass('success');
			}
			else{
				$('.mail_status').addClass('failure');
			}
				$('.mail_status p').text(data.response);

		}
	})

})



$(document).on('keyup','.seacrhUsers', function(){
	let search_term = $(this).val()
	search_term = search_term.toLowerCase()
	console.log(search_term)

  document.querySelectorAll('.selectable').forEach(
    function(name) {
      let item = name.firstChild.textContent;
      if (item.toLowerCase().indexOf(text) != -1) {
        name.style.display = 'block';
      } else {
        name.style.display = 'none';
      }
    })

})

$(document).on('click', '.create-group', function(){
	let group_name = $('#groupName').val()
	let group_desc = $('#groupDesc').val()
	let selected_users = $('input[name="selected_users[]"]:checked').map(function(){
		return $(this).val()
	}).get();

	console.log(group_name, group_desc, selected_users)

	if(group_name == ''){	
		$('.group_name_err').text('Please enter the group name')
		return false;
	}
	else{
		$('.group_name_err').text('')
	}
	if(selected_users.length==0){
		$('.selected_users_err').text('Please select the user')		
		return false;
	}
	else{
		$('.selected_users_err').text('')
	}

	selected_users.push(logger_id)

	$.ajax({
		type: 'POST',
		contentType: "application/json",
		data: JSON.stringify({logger_id: logger_id, group_name: group_name, group_desc: group_desc, selected_users: selected_users}),
		url: '/create-group',
		success:function(data){
				$('.preloader').show();
			if(data.status == 200){
				$('.preloader').empty();
				$('.preloader').html(`<h3>${data.response}</h3>

					<img src="assets/images/success.gif" class="success_gif" />`);
				$('.preloader').show();
				setTimeout(()=>{
					window.location.href="/chat_box";
				},3000)
			}
			else{
				$('.preloader').html(`<h3>${data.response}</h3>
					<img src="assets/images/failure.gif" class="failure_gif" />
					<br>
					<button class="btn btn-primary w-25" type="button" id="close_modal">OK</button>`);
				$('.preloader').show();
				
			}
		}
	})



})