var socket = io();

socket.on('connect', function () {
	console.log('Connected to socket.io server!')
});

socket.on('message', function (message) {
	console.log('New message:');
	console.log(message.text);
	jQuery('.messages').append('<p>' + message.text + '</p>');
});

// Handles submitting of new message

//$ is for the variable to have access to all methods for a jQuery element
var $form = jQuery('#message-form');
$form.on('submit', function (event) {
	// preventDefault is used on a form to prevent refresh of the entire page when submitting a form
	event.preventDefault();

	var $message = $form.find('input[name=message]');

	socket.emit('message', {
		text: $message.val()
	});

	//Reset form
	$message.val('');
});

