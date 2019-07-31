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

//var curleft = 0;
//var curtop = 0;
//var curright = 0;
//var curbott = 0;

var mousex;
var mousey;
var x;
var y;
var dotx;
var doty;

var click;
var elementMouseIsOver;

//let elem = document.getElementById("mybutton");
//var elemRect = elem.getBoundingClientRect();

//var itemRect = item.getBoundingClientRect();

const modelParams = {
    flipHorizontal: true,   // flip e.g for video
    maxNumBoxes: 1,        // maximum number of boxes to detect
    iouThreshold: 0.5,      // ioU threshold for non-max suppression
    scoreThreshold: 0.8,    // confidence threshold for predictions.
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
      //tapping();
    }
    if (isVideo) {
      requestAnimationFrame(runDetection);
    }
  });
}

/*function simulate(element, eventName)
{
    var options = extend(defaultOptions, arguments[2] || {});
    var oEvent, eventType = null;

    for (var name in eventMatchers)
    {
        if (eventMatchers[name].test(eventName)) { eventType = name; break; }
    }

    if (!eventType)
        throw new SyntaxError('Only HTMLEvents and MouseEvents interfaces are supported');

    if (document.createEvent)
    {
        oEvent = document.createEvent(eventType);
        if (eventType == 'HTMLEvents')
        {
            oEvent.initEvent(eventName, options.bubbles, options.cancelable);
        }
        else
        {
            oEvent.initMouseEvent(eventName, options.bubbles, options.cancelable, document.defaultView,
            options.button, options.pointerX, options.pointerY, options.pointerX, options.pointerY,
            options.ctrlKey, options.altKey, options.shiftKey, options.metaKey, options.button, element);
        }
        element.dispatchEvent(oEvent);
    }
    else
    {
        options.clientX = options.pointerX;
        options.clientY = options.pointerY;
        var evt = document.createEventObject();
        oEvent = extend(evt, options);
        element.fireEvent('on' + eventName, oEvent);
    }
    return element;
}
*/
function simulateMouseover() {
  var event = new MouseEvent('mouseover', {
    'view': window,
    'bubbles': true,
    'cancelable': true
  });
  let elementMouseIsOver = document.elementFromPoint(dotx, doty);
  //var myTarget = document.getElementById('target_div');
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
    //for (counter = 0; counter < 1; counter ++){
    //  let elementMouse = elementMouseIsOver;
    //}
    //myElement = document.getElementById("target_div");
     // attach mouseover event listener to element
    elementMouseIsOver.addEventListener("mouseover", function(event) {
        // change the color of the font
        if (elementMouseIsOver.tagName == 'BUTTON'){
          elementMouseIsOver.click();
        }
        //let elementMouse = elementMouseIsOver;
    });
    // call the simulation
    setTimeout(simulateMouseover,3000);
}

/*function extend(destination, source) {
    for (var property in source)
      destination[property] = source[property];
    return destination;
}

var eventMatchers = {
    'HTMLEvents': /^(?:load|unload|abort|error|select|change|submit|reset|focus|blur|resize|scroll)$/,
    'MouseEvents': /^(?:click|dblclick|mouse(?:down|up|over|move|out))$/
}
var defaultOptions = {
    pointerX: 0,
    pointerY: 0,
    button: 0,
    ctrlKey: false,
    altKey: false,
    shiftKey: false,
    metaKey: false,
    bubbles: true,
    cancelable: true
}*/

/*function tapping(){
  console.log(curleft, mousex, curright);
  console.log(curtop, mousey, curbott);
  if (curleft < mousex < curright && curtop < mousey < curbott) {
    //startClick();
    console.log('clicked');
  }
  else {
    return;
  }
}

function startClick() {
  click = setTimeout(document.getElementById("mybutton").click(), 5000);
}

function stopClick() {
  click = setInterval(function(){console.log('')}, 1);
  clearInterval(click);
}*/

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

function scrolling() {
  if (mousey > 570){
    stopScroll();
    startScrollDown();
  }
  else if (mousey < 190){
    stopScroll();
    startScrollUp();
  }
  else if (190 <= mousey <= 570){
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

/*function findPos() {
  let elem = document.getElementById("mybutton");
  let elemWidth = elem.offsetWidth;
  let elemHeight = elem.offsetHeight;
  console.log(elemWidth);
  console.log(elemHeight);

  //if (elem.offsetParent) {
    //do {
        curleft += elem.offsetLeft;
        curtop += elem.offsetTop;
        curright += curleft;
        curright += elemWidth;
        curbott += curtop;
        curbott += elemHeight;
    //} while (elem = elem.offsetParent);
    console.log('Left: ' + curleft, 'Top: ' + curtop, 'Right: ' + curright, 'Bottom: ' + curbott);
  //}
}*/




// Load the model.
handTrack.load(modelParams).then(lmodel => {
    // detect objects in the image.
    model = lmodel
    updateNote.innerText = "Loaded Model!"
    if (updateNote = "Loaded Model") {
      //findPos();
      toggleVideo();
    };
});
