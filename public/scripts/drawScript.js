$(function() {
  var socket = io();

  var canvas = document.getElementById('myCanv');
  var ctx = canvas.getContext('2d');
  var color = 'black'

  var prevMouseX = 0;
  var prevMouseY = 0;
  var CurrMouseX = 0;
  var CurrMouseY = 0;
  var drawing = false;
  var emitting = false;

  socket.on('drawing', drawingEvent);

  function draw(pmx, pmy, cmx, cmy, col, broadcast) {
    ctx.beginPath();
    ctx.strokeStyle = col;
    ctx.lineWidth = 3;
    ctx.moveTo(pmx, pmy);
    ctx.lineTo(cmx, cmy);
    ctx.stroke();
    ctx.closePath();

    if(!broadcast) {
      return;
    }

    socket.emit('drawing', {
      prevMouseX: pmx,
      prevMouseY: pmy,
      CurrMouseX: cmx,
      CurrMouseY: cmy,
      color: col
    });

  }

  canvas.addEventListener('mousemove', (e) => {
    mouseAction('mousemove', e);
  })
  canvas.addEventListener('mousedown', (e) => {
    mouseAction('mousedown', e);
  })
  canvas.addEventListener('mouseup', (e) => {
    mouseAction('mouseup', e);
  })
  canvas.addEventListener('mouseout', (e) => {
    mouseAction('mouseout', e);
  })

  function mouseAction(action, e) {
    if(action === 'mousedown') {
      drawing = true;
      prevMouseX = CurrMouseX;
      prevMouseY = CurrMouseY;
      CurrMouseX = e.pageX - canvas.offsetLeft;
      CurrMouseY = e.pageY - canvas.offsetTop;

    }
    if(action === 'mouseup' || action ==='mouseout') {
      drawing = false;
    }
    if(drawing) {
      // prevMouseX = CurrMouseX;
      // prevMouseY = CurrMouseY;
      // CurrMouseX = e.pageX - canvas.offsetLeft;
      // CurrMouseY = e.pageY - canvas.offsetTop;
      draw(prevMouseX = CurrMouseX,
         prevMouseY = CurrMouseY,
         CurrMouseX = e.pageX - canvas.offsetLeft,
         CurrMouseY = e.pageY - canvas.offsetTop,
         color,
         true);
    }
  }

  function throttle(callback, delay) {
    var previousCall = new Date().getTime();
    return function() {
      var time = new Date().getTime();

      if ((time - previousCall) >= delay) {
        previousCall = time;
        callback.apply(null, arguments);
      }
    };
  }

  function drawingEvent(data) {
    draw(data.prevMouseX,
       data.prevMouseY,
       data.CurrMouseX,
       data.CurrMouseY,
       data.color);
  }
})
