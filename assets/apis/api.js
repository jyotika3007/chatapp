
// Login User

var logger_id =  localStorage.getItem("uid");
var chatted_id = '';
var uname = "";



$(document).on('click', '#loginUser', function(){
	var email = $('#username').val();
	var password = $('#password').val();

	console.log(email,password)

	$.ajax({
		type: "POST",
		contentType: "application/json",
		data:  JSON.stringify({email: email, password: password}),
		url: '/login',
		success:function(data){
			console.log(data);
			if(data.status == 200) {

				localStorage.setItem("uid", data.result._id);
				localStorage.setItem("uemail", data.result.email);
				localStorage.setItem("uname", data.result.username);

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
});



// Register new user

$(document).on('click', '#registerUser', function(){
	var email = $('#useremail').val();
	var username = $('#username').val();
	var password = $('#userpassword').val();

	console.log(email,password, username)

	$.ajax({
		type: "POST",
		contentType: "application/json",
		data:  JSON.stringify({email: email, password: password, username: username}),
		url: '/register',
		success:function(data){
			console.log(data);
			if(data.status == 200) {

				$.ajax({
					type: "POST",
					contentType: "application/json",
					data:  JSON.stringify({email: email}),
					url: '/verify-mail',
					success:function(data2){

						if(data2.status == 200){

							$('.preloader').empty();
							$('.preloader').html(`<h3>${data.response}</h3>
								<h6>A link has been send to your mail. Click that link to verify your email.</h6>
								<img src="assets/images/success.gif" class="success_gif" />
								<button class="btn btn-primary w-25" type="button" id="close_modal">OK</button>`);
							$('.preloader').show();

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
});

