var PORT = process.env.PORT || 3000;
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var moment = require('moment');

app.use(express.static(__dirname + '/public'));

var clientInfo = {};

// Sends current users to provided socket
function sendCurrentUsers (socket) {
	var info = clientInfo[socket.id];
	var users = [];

	// If the room does not exist
	if (typeof info === 'undefined') {
		return;
	}

	Object.keys(clientInfo).forEach(function (socketId) {
		var userInfo = clientInfo[socketId];

		if (info.room === userInfo.room) {
			users.push(userInfo.name);
		}
	});

	socket.emit('message', {
		name: 'System',
		text: 'Current users: ' + users.join(', '),
		timestamp: moment.valueOf()
	});
} 

//Listen for events
io.on('connection', function (socket) {
	console.log('User connected via socket.io!');

	socket.on('disconnect', function () {
		// socket.id is dynamic hence the square brackets
		var userData = clientInfo[socket.id];
		if (typeof userData !== 'undefined') {
			socket.leave(userData.room);
			io.to(userData.room).emit('message', {
				name: 'System',
				text: userData.name + ' has left!',
				timestamp: moment().valueOf()
			});
			delete clientInfo[socket.id];
		}
	});

	// joinRoom is custom
	socket.on('joinRoom', function (req) {
		clientInfo[socket.id] = req;
		socket.join(req.room);
		socket.broadcast.to(req.room).emit('message', {
			name: 'System',
			text: req.name + ' has joined!',
			timestamp: moment().valueOf()
		});
	});

	// message is custom
	socket.on('message', function (message) {
		console.log('Message received: ' + message.text);

		if (message.text === '@currentUsers') {
			sendCurrentUsers(socket);
		} else {
			message.timestamp = moment().valueOf();
			// send to everyone but the one who emitted the message
			//socket.broadcast.emit('message', message);

			// io.emit sends the message to everyone io.emit('message', message);
			//to room name
			io.to(clientInfo[socket.id].room).emit('message', message);
		}
	});

	//var timestampMoment = moment.utc(timestamp).local().format('h:mm a');

	socket.emit('message', {
		name: 'System',
		timestamp: moment().valueOf(),
		text: 'Welcome to the chat application'
	});
});

http.listen(PORT, function () {
	console.log('Server started');
});

