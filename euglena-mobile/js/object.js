var obj_canvas,
obj_c,
ObjX,
ObjY,
ObjL=80,
img1 = null,
img2 = null,
cp_canvas = null;

var video_canvas,
video_c;

var brown_const=0;
var int_timer=0;
var max_timer=30;

var scoreX = 0;
var scoreY = 0;
var score_val = 0;
var gametimer;

var vid_width = 640;
var vid_height = 480;

function setupVidCanvas() {
	// Show loading notice
	video_canvas = document.getElementById('videoCanvas');
	video_c = video_canvas.getContext('2d');
	//video_c.fillStyle = '#444';
	//video_c.fillText('Loading...', video_canvas.width/2-30, video_canvas.height/3);

	// Setup the WebSocket connection and start the player
	//var client = new WebSocket( 'ws://171.65.102.132:8084/' );
	//var player = new jsmpeg(client, {canvas:video_canvas});
	
	video_canvas.width = vid_width;
	video_canvas.height = vid_height;
	
	getMjpeg();
	runMotionDetection();
}

function getMjpeg(){
    var img = new Image();
	img.onload = function() {
    	video_c.drawImage(img);
    	requestAnimFrame(getMjpeg);
		};
	img.src = "http://171.65.102.132:8080/?action=snapshot?t=" + new Date().getTime();
}

/*function getMjpeg(){
	var frameDelta = Date.now() - frameLastUpdateTime;
    
    if (frameACDelta > msMovieFrame)
    {
        frameACDelta = 0;
        var img = new Image();
		img.onload = function() {
    		video_c.drawImage(img, 0, 0, img.width * (window.innerHeight/img.height), window.innerHeight);
		};
		img.src = "http://171.65.102.132:8080/?action=snapshot?t=" + new Date().getTime();
    } else
    {
        frameACDelta += frameDelta;
    }
    
    frameLastUpdateTime = Date.now();
    img1.onload=requestAnimFrame(getMjpeg);
}*/

function setupObjCanvas() {
    obj_canvas = document.getElementById('objCanvas');  
    obj_c = obj_canvas.getContext('2d');
    obj_canvas.width = vid_width;
	obj_canvas.height = vid_height;
		
	ObjX = vid_width/2;
	ObjY = vid_height/2;
    
    drawBox(ObjX,ObjY,ObjL);
}

function drawBox(box_X,box_Y,box_L,totalRes){
	obj_c.clearRect(0, 0, obj_canvas.width, obj_canvas.height);
	obj_c.strokeStyle = ( totalRes > 0 ) ? "rgba(253,172,13,1)" : "rgba(250,102,0,1)";
    obj_c.lineWidth = 2;
	
	obj_c.beginPath();
	obj_c.rect(box_X - box_L/2, box_Y - box_L/2, box_L, box_L);
    obj_c.stroke();	
    
    obj_c.fillStyle = "#f00";
	obj_c.beginPath();
	obj_c.moveTo(box_X,box_Y);
	var enda = (2*Math.PI)*(int_timer/max_timer);
	obj_c.arc(box_X,box_Y,box_L/4, 0, enda);
	obj_c.fill();
	
	if (score_val>0){
		obj_c.beginPath();
    	obj_c.fillStyle = "#fff"; 
    	obj_c.fillText('score: +'+score_val,box_X - box_L/2, box_Y - box_L/2-10);
    	
    	obj_c.moveTo(scoreX, scoreY);
    	obj_c.strokeStyle = "#fff";
    	obj_c.lineWidth = 1;
		obj_c.lineTo(ObjX, ObjY);
    	obj_c.stroke();	
    }
}

function resetGame(){
	window.clearTimeout(gametimer);
	
	ObjX = obj_canvas.width/2;
	ObjY = obj_canvas.height/2;
	
	score_val = 0;
	scoreX = ObjX;
	scoreY = ObjY;
	
	int_timer = max_timer;
	
	gametimer=requestAnimFrame(countDown);
}

function countDown(){
	int_timer = int_timer - 0.1;
	if (int_timer > 0){
		score_val = (Math.pow(scoreX-ObjX,2) + Math.pow(scoreY-ObjY,2))*10;
		gametimer=requestAnimFrame(countDown);
	}else{
		window.clearTimeout(gametimer);
		
		var msg = {type:'sendscore', user:username, score:score_val};
		socket.json.send(msg);
		
		int_timer=0;
		score_val = 0;
		ObjX = obj_canvas.width/2;
		ObjY = obj_canvas.height/2;
	}
}