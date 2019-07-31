//ALL the Variables

//Videobox (Webcam)
const video = document.getElementById("myvideo");
const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");
let updateNote = document.getElementById("updatenote");

let isVideo = false;
let model = null;

//Cursor's Canvas
var moveCanvas = document.getElementById("movecanvas");
moveCanvas.style.position = "fixed";
var ctx = moveCanvas.getContext("2d");

moveCanvas.width = window.innerWidth;
moveCanvas.height = window.innerHeight;

//Cursor
var mousex;
var mousey;
var x;
var y;
var dotx;
var doty;

var elementMouseIsOver;

//Detection Parameters
const modelParams = {
    flipHorizontal: true,   // flip e.g for video
    maxNumBoxes: 1,        // maximum number of boxes to detect
    iouThreshold: 0.5,      // ioU threshold for non-max suppression
    scoreThreshold: 0.8,    // confidence threshold for predictions.
}

//Starting Webcam Stream
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

//Detecting the Hands
function runDetection() {
  model.detect(video).then(predictions => {
    console.log("Predictions: ", predictions);
    model.renderPredictions(predictions, canvas, context, video);
    if (predictions[0]) {
      let midvalX = predictions[0].bbox[0] + (predictions[0].bbox[2] / 2)
      mousex = moveCanvas.width * (midvalX / video.width)
      dotx = (mousex/document.body.clientWidth) * document.body.clientWidth
      console.log('dotx: ', dotx);
      console.log(midvalX);
      console.log('Predictions: ', mousex);
      let midvalY = predictions[0].bbox[1] + (predictions[0].bbox[3] / 2)
      mousey = moveCanvas.height * (midvalY / video.height)
      doty = (mousey/document.body.clientHeight) * document.body.clientHeight
      console.log('doty: ', doty);
      console.log(midvalY);
      console.log('Predictions: ', mousey);

      draw();
      mouseOverBehaviour();
      scrolling();
    }
    if (isVideo) {
      requestAnimationFrame(runDetection);
    }
  });
}

//Clicking
function simulateMouseover() {
  var event = new MouseEvent('mouseover', {
    'view': window,
    'bubbles': true,
    'cancelable': true
  });
  let elementMouseIsOver = document.elementFromPoint(dotx, doty);
  var canceled = !elementMouseIsOver.dispatchEvent(event);
  if (canceled) {
    // A handler called preventDefault.
    console.log("canceled");
  } else {
    // None of the handlers called preventDefault.
    console.log("not canceled");
  }
}

function mouseOverBehaviour() {
    let elementMouseIsOver = document.elementFromPoint(dotx, doty);
    var counter = 0;
     // attach mouseover event listener to element
    elementMouseIsOver.addEventListener("mouseover", function(event) {
        // change the color of the font
        if (elementMouseIsOver.tagName == 'BUTTON'){
          elementMouseIsOver.style.color = "rgba(121, 134, 203, 0.5)";
          setTimeout(elementMouseIsOver.click(), 10000);
        }
    });
    // call the simulation
    setTimeout(simulateMouseover,3000);
}

//Creating the Cursor
function drawBall() {
  let x = mousex;
  let y = mousey;
  ctx.beginPath();
  ctx.arc(x, y, 10, 0, Math.PI*2);
  ctx.fillStyle = "rgba(255, 0, 0, 0.6)";
  ctx.fill();
}
function draw() {
  ctx.clearRect(0, 0, moveCanvas.width, moveCanvas.height);
  drawBall();
}

//Scrolling Functions
function scrolling() {
  if (mousey > 530){
    stopScroll();
    startScrollDown();
  }
  else if (mousey < 200){
    stopScroll();
    startScrollUp();
  }
  else if (200 <= mousey <= 530){
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

// Load the model.
handTrack.load(modelParams).then(lmodel => {
    // detect objects in the image.
    model = lmodel
    updateNote.innerText = "Loaded Model!"
    if (updateNote = "Loaded Model") {
      alert("Nagivate the interface through hand movements. \nThe red dot follows the user's hand movement in real time. \n\n   To Scroll: Move dot towards top/bottom of screen \n   To Click: Hover over button \n \nIf the dot cannot reach edges of window, try moving further away from camera");

      toggleVideo();
    };
});
