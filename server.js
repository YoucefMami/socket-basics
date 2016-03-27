var PORT = process.env.PORT || 3000;
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var moment = require('moment');

app.use(express.static(__dirname + '/public'));

var clientInfo = {};

//Listen for events
io.on('connection', function (socket) {
	console.log('User connected via socket.io!');

	socket.on('joinRoom', function (req) {
		clientInfo[socket.id] = req;
		socket.join(req.room);
		socket.broadcast.to(req.room).emit('message', {
			name: 'System',
			text: req.name + ' has joined!',
			timestamp: moment().valueOf()
		});
	});

	socket.on('message', function (message) {
		console.log('Message received: ' + message.text);

		message.timestamp = moment().valueOf();
		// send to everyone but the one who emitted the message
		//socket.broadcast.emit('message', message);

		// io.emit sends the message to everyone
		//io.emit('message', message);
		//to room name
		io.to(clientInfo[socket.id].room).emit('message', message);
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

