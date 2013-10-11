
/*******************************************************************************
  Copyright (C) 2009 Tom Stoeveken
  This program is free software;
  you can redistribute it and/or modify it under the terms of the
  GNU General Public License, version 2.
  See the file COPYING for details.
*******************************************************************************/

var img1 = null;
var img2 = null;
var md_canvas = null;

/*
  compare two images and count the differences

  input.: image1 and image2 are Image() objects
  input.: threshold specifies by how much the color value of a pixel
          must differ before they are regarded to be different

  return: number of different pixels
*/

function compare(image1, image2, ptX, ptY, threshold, ObjR) {
  var movement = new Array(0,0,0,0);
  var md_ctx = md_canvas.getContext("2d");
  var width = md_canvas.width/2, height = md_canvas.height/2;

  // copy images into canvas element
  // these steps scale the images and decodes the image data
  md_ctx.drawImage(image1, 0, 0, width, height);
  md_ctx.drawImage(image2, width, 0, width, height);

  // this makes r,g,b,alpha data of images available
  var pixels1 = md_ctx.getImageData(0, 0, width, height);
  var pixels2 = md_ctx.getImageData(width, 0, width, height);
  
  // substract picture1 from picture2
  // if they differ set color value to max,
  // if the difference is below threshold set difference to 0.
  for (var x = Math.round((ptX-ObjR)/2); x < Math.round((ptX+ObjR)/2); x++) {
    for (var y = Math.round((ptY-ObjR)/2); y < Math.round((ptY+ObjR)/2); y++) {

      // each pixel has a red, green, blue and alpha value
      // all values are stored in a linear array
      var i = x*4 + y*4*pixels1.width;

      var ch0 = ((pixels1.data[i] - pixels2.data[i])>threshold)?255:0;
      var ch1 = ((pixels1.data[i] - pixels2.data[i])>threshold)?255:0;
      var ch2 = ((pixels1.data[i] - pixels2.data[i])>threshold)?255:0;
      //var ch0 = (Math.abs(pixels1.data[i] - pixels2.data[i])>threshold)?255:0;
      //var ch1 = (Math.abs(pixels1.data[i] - pixels2.data[i])>threshold)?255:0;
      //var ch2 = (Math.abs(pixels1.data[i] - pixels2.data[i])>threshold)?255:0;

      // count differing pixels
      var n = (x<Math.round(ptX/2))?0:1;
      var m = (y<Math.round(ptY/2))?0:2;
      movement[n+m] += Math.min(1, ch0 + ch1 + ch2);
    }
  }
  return movement;
}

/*
  Callback function for completed picture downloads

  With every new picture a compare() is performed.
  The new picture is 'img1', the previous picture is stored in 'img2'.
*/
function compareFrame() {
  // just compare if there are two pictures
  if ( img2 != null ) {
    var res;
    var ObjR=50;

    try {
      // compare the two pictures, the given threshold helps to ignore noise
      res = compare(img1, img2, ObjX, ObjY, 6, ObjR); 
    }
    catch(e) {
      // errors can happen if the pictures were corrupted during transfer
      // instead of giving up, just proceed
    }
    
    var md_ctx = md_canvas.getContext("2d");
    if ((res[0]>400)||(res[1]>400)||(res[2]>400)||(res[3]>400)){
    	res[0]=0;res[1]=0;res[2]=0;res[3]=0;
    }
    
    var objx=ObjX+(res[0]+res[2]-res[1]-res[3])/4+(Math.random()-0.5)*20*brown_const;
    var objy=ObjY+(res[0]+res[1]-res[2]-res[3])/4+(Math.random()-0.5)*20*brown_const;
    
    ObjX=Math.max(objx,ObjR);
    ObjX=Math.min(ObjX,vid_width-ObjR);
    ObjX=Math.round(ObjX/2)*2;
    ObjY=Math.max(objy,ObjR);
    ObjY=Math.min(ObjY,vid_height-ObjR);
    ObjY=Math.round(ObjY/2)*2;

    drawBox(ObjX,ObjY,ObjL,res[0]+res[1]+res[2]+res[3]);
  }else{
  	console.log('motion detection module started');
  }

  // copy reference of img1 to img2
  img2 = img1;
}



/*
  Initialize the elements

  * Create a Canvas() object and insert it into the page
  * Download the first image
  * Pause the Livestream again if we were paused previously
    This way we will not pause, but we will lower the refresh rate
    For a proper pause, the page can not be reloaded
*/
function setupMotionDetection() {
  md_canvas = document.getElementById('mdCanvas');
  test_canvas = document.getElementById('testCanvas');
  md_canvas.width = vid_width;
  md_canvas.height = vid_height;
}

/*</script>
<body onload="run()">*/