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

//var itemRect = item.getBoundingClientRect();

const modelParams = {
    flipHorizontal: true,   // flip e.g for video
    maxNumBoxes: 1,        // maximum number of boxes to detect
    iouThreshold: 0.5,      // ioU threshold for non-max suppression
    scoreThreshold: 0.6,    // confidence threshold for predictions.
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
      gamex = moveCanvas.width * (midvalX / video.width)
      console.log(midvalX);
      console.log('Predictions: ', gamex);
      let midvalY = predictions[0].bbox[1] + (predictions[0].bbox[3] / 2)
      gamey = moveCanvas.height * (midvalY / video.height)
      console.log(midvalY);
      console.log('Predictions: ', gamey);

      let x = gamex;
      let y = gamey;

      draw();
      function drawBall() {
        ctx.beginPath();
        ctx.arc(x, y, 10, 0, Math.PI*2);
        ctx.fillStyle = "rgba(255,51,51,0.5)";
        ctx.fill();
      }
      function draw() {
        ctx.clearRect(0, 0, moveCanvas.width, moveCanvas.height);
        drawBall();
      }

      if (y > 500){
        stopScroll();
        startScrollDown();
      }
      else if (y < 80){
        stopScroll();
        startScrollUp();
      }
      else if (80 <= y <= 500){
        stopScroll();
      };
    }
    
    if (isVideo) {
      requestAnimationFrame(runDetection);
    }
  });
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
      toggleVideo();
    };
});
