$(function() {
  var socket = io.connect();
  var drawingStart = false;
  $('#overlay').hide();
  var interval;
  var holderinterval;
  var guesses = '';
  var objectToDraw;
  var wordArr = ['dog', 'cat', 'fish', 'lion', 'horse', 'sea otter'];
  var rotateWords = false;
  var points = 100;

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
    if(action === 'mousedown' && drawingStart === true) {
      drawing = true;
      prevMouseX = CurrMouseX;
      prevMouseY = CurrMouseY;
      CurrMouseX = e.pageX - canvas.offsetLeft;
      CurrMouseY = e.pageY - canvas.offsetTop;

    }
    if(action === 'mouseup' || action ==='mouseout') {
      drawing = false;
    }
    if(drawing && drawingStart === true) {

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

  var counter = 0
  objectToDraw = wordArr[0];
  setInterval(function() {
    counter ++;
    objectToDraw = wordArr[counter];
    console.log('wordArr word: ' + wordArr[counter]);
    if(counter >= wordArr.length) {
      counter = 0;
    }
  }, 29800)

  socket.on('ready', (users, name, clients) => {
    console.log(users);
    if(users >= 2) {
      if(users === 2) {
        canvas.width = canvas.width;

        console.log("GOING IN HERE");
        $('#myCanv').fadeOut();
        $('#overlay').show();
        letDraw = true;
        socket.emit('startDrawing', letDraw);
        window.setTimeout(() => {
          $('#overlay').fadeOut();
          $('#myCanv').show();
        }, 10000);
      }
      console.log("SOMEONE JOINED... CLEARING INTERVAL");
      clearInterval(interval);
      holderinterval = interval;
      interval = setInterval(function() {
        console.log("EMITTING FROM DRAWSCRIPT AGAIN!");
        canvas.width = canvas.width;
        socket.emit('startDrawing', letDraw);
      }, 30000)
    }
    socket.on('user left', (data) => {
      if(users <= 1) {
        canvas.width = canvas.width;
        clearInterval(holderinterval);
        console.log("GAME STOPPED");
      }
    })

  })

  socket.on('userChat', (name, msg) => {
    $('#messages').append($('<li>').text(name + ': ' + msg));
  })

  socket.on('userChat', (name, msg) => {
    guesses = msg;
    console.log("GUESSES: " + guesses);
    console.log("objectToDraw: " + objectToDraw);
    if(guesses === objectToDraw) {
      console.log("GUESSED!!");
      $('#messages').append($('<li style="background:green">').text(name + ' GUESSED THE WORD'));
      $(`li:contains(${objectToDraw})`).remove();
    }
  })

  socket.on('startDrawing', (drawFlag, word) => {
    drawingStart = drawFlag;
    if(word) {
      console.log("OBJECT TO DRAW: " + objectToDraw);
      $('#myCanv').hide();
      $('#overlay').text('DRAW: ' + objectToDraw);
      $('#overlay').show();
      window.setTimeout(() => {
        $('#overlay').fadeOut();
        $('#myCanv').show();
      }, 5000);
    }
  })

})
