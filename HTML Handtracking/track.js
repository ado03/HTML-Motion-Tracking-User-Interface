const video = document.getElementById("myvideo");
const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");
let updateNote = document.getElementById("updatenote");

let isVideo = false;
let model = null;

var moveCanvas = document.getElementById("movecanvas");
moveCanvas.style.position = "fixed";
var ctx = moveCanvas.getContext("2d");

moveCanvas.width = window.innerWidth;
moveCanvas.height = window.innerHeight;

var curleft = 0;
var curtop = 0;
var curright;
var curbott;

var mousex;
var mousey;
var x;
var y;
var dotx;
var doty;

//let elem = document.getElementById("mybutton");
//var elemRect = elem.getBoundingClientRect();

//var itemRect = item.getBoundingClientRect();

const modelParams = {
    flipHorizontal: true,   // flip e.g for video
    maxNumBoxes: 1,        // maximum number of boxes to detect
    iouThreshold: 0.5,      // ioU threshold for non-max suppression
    scoreThreshold: 0.9,    // confidence threshold for predictions.
}

function startVideo() {
    handTrack.startVideo(video).then(function (status) {
        console.log("video started", status);
        if (status) {
            updateNote.innerText = "Video started. Now tracking"
            isVideo = true
            runDetection()
        } else {
            updateNote.innerText = "Please enable video"
        }
    });
}

function toggleVideo() {
    if (!isVideo) {
        updateNote.innerText = "Starting video"
        startVideo();
    } else {
        updateNote.innerText = "Stopping video"
        handTrack.stopVideo(video)
        isVideo = false;
        updateNote.innerText = "Video stopped"
    }
}

function runDetection() {
  model.detect(video).then(predictions => {
    console.log("Predictions: ", predictions);
    model.renderPredictions(predictions, canvas, context, video);
    if (predictions[0]) {
      let midvalX = predictions[0].bbox[0] + (predictions[0].bbox[2] / 2)
      mousex = moveCanvas.width * (midvalX / video.width)
      console.log(midvalX);
      console.log('Predictions: ', mousex);
      let midvalY = predictions[0].bbox[1] + (predictions[0].bbox[3] / 2)
      mousey = moveCanvas.height * (midvalY / video.height)
      console.log(midvalY);
      console.log('Predictions: ', mousey);

      draw();
      scrolling();
    }
    if (isVideo) {
      requestAnimationFrame(runDetection);
    }
  });
}

function drawBall() {
  let x = mousex;
  let y = mousey;
  ctx.beginPath();
  ctx.arc(x, y, 10, 0, Math.PI*2);
  ctx.fillStyle = "rgba(243,201,201,1)";
  ctx.fill();
}
function draw() {
  ctx.clearRect(0, 0, moveCanvas.width, moveCanvas.height);
  drawBall();
}

function scrolling() {
  if (mousey > 570){
    stopScroll();
    startScrollDown();
  }
  else if (mousey < 150){
    stopScroll();
    startScrollUp();
  }
  else if (150 <= mousey <= 570){
    stopScroll();
  };
}

function startScrollDown() {
   scroll = setInterval(function(){ window.scrollBy(0, 10); console.log('start');}, 0.01);

}
function stopScroll() {
   clearInterval(scroll);
}

function startScrollUp() {
  scroll = setInterval(function(){ window.scrollBy(0, -10); console.log('start');}, 0.01);
}

function findPos() {
  let elem = document.getElementById("mybutton");
  let elemWidth = elem.style.width
  let elemHeight = elem.style.height

  if (elem.offsetParent) {
    do {
        curleft += elem.offsetLeft;
        curtop += elem.offsetTop;
        curright = window.innerWidth - (elem.offsetLeft + elemWidth);
        curbott = window.innerHeight - (elem.offsetTop + elemHeight);
    } while (elem = elem.offsetParent);
    console.log('Left: ' + curleft, 'Top: ' + curtop, 'Right: ' + curright, 'Bottom: ' + curbott);
  }
}




// Load the model.
handTrack.load(modelParams).then(lmodel => {
    // detect objects in the image.
    model = lmodel
    updateNote.innerText = "Loaded Model!"
    if (updateNote = "Loaded Model") {
      toggleVideo();
      findPos();
    };
});
