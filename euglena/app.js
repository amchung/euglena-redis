var app = require('http').createServer(handler);
app.listen(8088);
var io = require('socket.io').listen(app);
var redis = require('redis');
var fs = require('fs');
var _ = require('underscore');
var path = require('path');

function handler(req,res){	
	var filePath = '.' + req.url;
	if (filePath == './'){
		filePath = './index.html';
		}
		
	var extname = path.extname(filePath);
	var contentType = 'text/html';
	switch (extname) {
		case '.js':
			contentType = 'text/javascript';
			break;
		case '.css':
			contentType = 'text/css';
			break;
		case '.png':
			contentType = 'image/png';
			break;
	}
	fs.exists(filePath, function(exists){
		if (exists) {
			fs.readFile(filePath, function(err, data){
				if(err){
					res.writeHead(500);
					return res.end('Error loading files');
				}
				else{
					res.writeHead(200, {'Content-Type': contentType});
					console.log("Listening on port 8088");
					res.end(data, 'utf-8');
				}
			});
		}
		else {
			res.writeHead(404);
			res.end();
		}
	});
}

var store = redis.createClient();
var pub = redis.createClient();
var sub = redis.createClient();
var list = redis.createClient();

io.sockets.on('connection', function (client) {
	/*sub_score.subscribe("postscore");
	sub_score.on("score", function (channel, score) {
		console.log("score received on server from publish ");
		client.send(score);
	});*/
	
	sub.subscribe("chatting");
	sub.on("message", function (channel, message) {
		console.log("message received on server from publish ");
		client.send(message);
	});
	
	client.on("message", function (msg) {
		console.log(msg);
		if(msg.type == "setUsername"){
			pub.publish("chatting","A new user is connected:" + msg.user);
			store.sadd("onlineUsers", msg.user);
		}
		else if(msg.type == "sendscore"){
			list.zadd("myset", msg.score , msg.user);
			list.zrange("myset", 0 , -1, 'withscores', function(err,members){
				var lists=_.groupBy(members,function(a,b){
					return Math.floor(b/2);
				});
				console.log( _.toArray(lists) );
				client.emit("postscore",  _.toArray(lists) );
			});
		}
		else{
			pub.publish("chatting", msg.message);	
		}
	});
	client.on('disconnect',function () {
		sub.quit();
		pub.publish("chatting","User is disconnected :" + client.id);
	});
});


