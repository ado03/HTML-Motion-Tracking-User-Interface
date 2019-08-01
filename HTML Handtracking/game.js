const video = document.getElementById("myvideo");
const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");
let updateNote = document.getElementById("updatenote");

let isVideo = false;
let model = null;

var moveCanvas = document.getElementById("movecanvas");
moveCanvas.style.position = "fixed";
var ctx = moveCanvas.getContext("2d");

moveCanvas.width = (window.innerWidth) * 0.6;
moveCanvas.height = window.innerHeight;

var gamex;
var gamey;
var x;
var y;

// game variables
var startingScore = 3;
var continueAnimating = false;
var score;
score = startingScore;

// block variables
var blockWidth = 0;
var blockHeight = 0;
var block = {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
}

// ball variables
var ballWidth = 40;
var ballHeight = 40;
var totalballs = 7;
var balls = [];
for (var i = 0; i < totalballs; i++) {
    addball();
}

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
            isVideo = true;
            continueAnimating = true;
            runDetection();
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

      if(continueAnimating == true){
        drawAll();
      }
      }

    if (isVideo) {
      requestAnimationFrame(runDetection);
    }
  });
}

function addball() {
    var ball = {
        width: ballWidth,
        height: ballHeight
    }
    resetball(ball);
    balls.push(ball);
}

// move the ball to a random position near the top-of-moveCanvas
// assign the ball a random speed
function resetball(ball) {
    ball.x = Math.random() * (moveCanvas.width - ballWidth);
    ball.y = 15 + Math.random() * 30;
    ball.speed = 3 + Math.random() * 35;
}


// a = ball, b = block, check for collisons
function isColliding(a, b) {
    return !(
    b.x > a.x + a.width || b.x + b.width < a.x || b.y > a.y + a.height || b.y + b.height < a.y);
}

function drawAll() {
    // clear the moveCanvas
    ctx.clearRect(0, 0, moveCanvas.width, moveCanvas.height);

    // draw the background
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, moveCanvas.width, moveCanvas.height);

    //draw block attached to hand movement
    let x = gamex;
    let y = gamey;
    var blockWidth = 130;
    var blockHeight = 35;
    var block = {
        x: x,
        y: moveCanvas.height - blockHeight,
        width: blockWidth,
        height: blockHeight,
    }
    ctx.beginPath();
    ctx.fillStyle = "rgba(255, 0, 0, 0.6)";
    ctx.fillRect(block.x, block.y, block.width, block.height);

    // draw all balls
    for (var i = 0; i < balls.length; i++) {
        var ball = balls[i];
        // optionally, drawImage(ballsImg,ball.x,ball.y)
        ctx.fillStyle = "rgba(92, 107, 192)";
        ctx.fillRect(ball.x, ball.y, ball.width, ball.height);
    }

    //general game loop (has to be in this function due to the scope of gamex)
    for (var i = 0; i < balls.length; i++) {
        var ball = balls[i];
        // test for ball-block collision
        if (isColliding(ball, block)) {
            score -= 1;
            resetball(ball);
        }
        // advance the balls
        ball.y += ball.speed;
        // if the ball is below the moveCanvas,
        if (ball.y > moveCanvas.height) {
            resetball(ball);
        }
    }

    // draw the score
    ctx.font = "20px Arial";
    ctx.fillStyle = "black";
    ctx.fillText("LIVES REMAINING: " + score, 80, 55);
    if(score == 0) {
      continueAnimating = false;
      ctx.font = "48px Arial";
      ctx.fillStyle = "black";
      ctx.fillText("                    GAME OVER", 80, 70);
    }
}

// Load the model.
handTrack.load(modelParams).then(lmodel => {
    // detect objects in the image.
    model = lmodel
    updateNote.innerText = "Loaded Model!"
    if (updateNote = "Loaded Model") {
      alert("This is a hand controlled game! \nThe red block follows the user's hand movement in real time and will pause if hand can not be identifed or is out of frame \n\nDodge the falling cubes and see how long you can last...get hit by three and it's game over!\n\nTo restart the game, click the refresh.");

      toggleVideo();
    };
});
