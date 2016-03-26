var PORT = process.env.PORT || 3000;
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use(express.static(__dirname + '/public'));

//Listen for events
io.on('connection', function (socket) {
	console.log('User connected via socket.io!');

	socket.on('message', function (message) {
		console.log('Message received: ' + message.text);

		// io.emit sends to everyone
		// send to everyone but the one who emitted the message
		socket.broadcast.emit('message', message);
	});
});

http.listen(PORT, function () {
	console.log('Server started');
});

