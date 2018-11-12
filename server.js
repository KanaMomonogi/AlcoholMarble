var express = require('express');
var http = require('http');
var path = require('path');
var app = express();
app.use(express.static(path.join(__dirname, 'public')));
var httpServer = http.createServer(app).listen(8080, function (req, res) {
	console.log('Socket IO server has been started');
});
var io = require('socket.io').listen(httpServer);
var connections = [];
var settingFlag = true
var goldKeyOptin = 0
app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, 'public', 'marble.html'));
});

io.sockets.on('connection', function (socket) {
	if(settingFlag)
	{
		io.to(connections[0]).emit('showSetting');
	}	
	
	connections.push(socket.id);
	console.log(connections);
	
	socket.on('init', function (data) {
		startGame(data);
		goldKeyOption = data.goldKeyOption
		console.log(goldKeyOption)
		settingFlag = false;
	});
	
	socket.on('move', function (data) {
		move(socket.id, data);
	});
	
	socket.on('showDice', function(data){
		showDice(data);
	});
	
	socket.on('goldKey', function(playerId){
		goldKey(playerId, socket.id, connections);
	});
	
	socket.on('closeConnection', function () {
		console.log('Client disconnects' + socket.id);
		socket.disconnect();
		removePlayer(socket.id);
	});
	socket.on('showMyGoldKey', function(data){
		showMyGoldKey(data,socket.id, connections);		
	});

	socket.on('disconnect', function () {
		console.log('Got disconnected!' + socket.id);
		socket.disconnect();
		removePlayer(socket.id);
	});	
	
});


function removePlayer(item) {
	var index = connections.indexOf(item);
	connections.splice(index, 1);
	if(connections.length == 0)
	{
		settingFlag = true
	}
}

function startGame(data) {
	console.log('Starting game');
	for (var i = 0; i < connections.length; i++) {
		var playerId = i + 1;
		io.to(connections[i]).emit('gameStart', {
			connection: connections,
			data: data
		});
	}
}

function move(id, data) {
	console.log('moving');
	console.log(id);
	io.sockets.emit('move', {
		connection: connections,
		id:id,
		data: data
	});
}

function showDice(turn){
	io.to(connections[turn]).emit('showDice');
}

function goldKey(playerId, id, connections){
	io.to(connections[playerId]).emit('goldKey', {playerId:playerId, id:id, connections:connections});
}

function showMyGoldKey(data,id, connections){
	//io.to(connections[data.id]).emit('removeGoldKey', data);
	io.sockets.emit('showMyGoldKey', {
		connections: connections,
		id:id,
		data:data
	});
	
}
//function removeGoldKey(data){
//	
//}