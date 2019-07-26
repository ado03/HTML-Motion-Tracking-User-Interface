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
                ctx.fillStyle = "#0095DD";
                ctx.fill();
            }

            function draw() {
                ctx.clearRect(0, 0, moveCanvas.width, moveCanvas.height);
                drawBall();

            }

            //setInterval(draw, 10);
            //item.style.right = -x + "px";
            //item.style.bottom = -y + "px";
            //item.style.left = x + "px";
            //item.style.top = y + "px";

        }
        if (isVideo) {
            requestAnimationFrame(runDetection);
        }
    });
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
