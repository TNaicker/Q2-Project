const express       = require('express');
const app           = express();
const knex          = require('./db.js');
const bodyParser    = require('body-parser');
const cookieSession = require('cookie-session');
var game = false;
var intervalCount = 0;
var userListID;
var clientNum = 0;
var clients = [];
var clientNames = [];
var disconnected;
var counter = 0;

const PORT = process.env.PORT || 8000;

app.use(bodyParser.urlencoded({ extended: false }));

app.set('view engine', 'ejs');
app.use(express.static('public'));

app.use(cookieSession({
  name: 'user_cookie',
  keys: ['socure1', 'socure2']
}))

const sessions = require('./routes/sessions.js');

app.use(sessions);

app.get('/game', (req, res) => {
  // returnUserID(req)
  //   .then((result) => {
  //     userListID = result;
  //   })
  //   .catch((err) => {
  //     console.log(err);
  //   })
  // res.render('game', {
  //   guest_id: req.session.guest_id,
  //   user_id: req.session.user_id
  // });
  res.render('game');
})

app.use((req, res) => {
  res.sendStatus(418);
})

var server = app.listen(PORT, () => {
  console.log('listening on port', PORT);
})

const io = require('socket.io')(server);

io.on('connection', function(socket){

  io.clients(function(error, clients) {
    console.log('Clients: ' + clients )
  });

  var addedUser = false;
  clients.push(socket.id);
  console.log('user connected: ' + socket.id);
  console.log('array: ' + clients.length);

  socket.on('disconnect', function(){
    console.log('user disconnected');
    clients.splice(clients.indexOf(socket.id), 1);
    console.log('array after dc: ' + clients);
    if (addedUser) {
      clientNum--;

      // echo globally that this client has left
      socket.broadcast.emit('user left', {
        username: socket.username,
        numUsers: clientNum,
        userArr: clientNames
      });
    }
  });

  socket.on('updatedUserList', (arr)=> {
    clientNames = arr;
  })

  socket.on('username', function(name) {
    if(addedUser) {return;}

    clientNames.push(name);
    socket.username = name;
    clientNum++;
    addedUser = true;
    io.emit('ready', clientNum, clientNames, clients);
    io.sockets.emit('username', socket.username);
    socket.on('chat message', function(msg) {
      io.sockets.emit('userChat', name, msg);
    })
  })

  socket.on('drawing', function(data) {
    io.emit('drawing', data);
    console.log(data);
  })

  socket.on('startDrawing', function(drawingStart) {
    drawingStart = false;
    console.log('setting everyone to false: ' + drawingStart);
    console.log('==============================================');
    io.emit('startDrawing', drawingStart);
    game = drawingStart;
    drawingStart = true;
    console.log('counter: ' + counter);
    console.log('emitting to specific client! ' + clients[counter]);
    console.log('drawingStart: ' + drawingStart);
    io.to(clients[counter-1]).emit('startDrawing', drawingStart);
    if(counter >= clients.length) {
      counter = 0;
    }
    counter +=1;
    // console.log("COUNTER OUTSIDE UNFLAGGING: " + counter);
    // if(counter >= 2) {
    //   console.log("COUNTER INSIDE UNFLAGGING: " + counter);
    //   console.log("UNFLAGGING");
    //   var unflagHold = counter;
    //   unflagHold--;
    //   drawingStart = false;
    //   io.to(clients[unflagHold]).emit('startDrawing', drawingStart);
    // }
  })
})

function rotatePlayers(drawingStart, counting) {
  console.log("WORKING IN ROTATE");
  console.log("COUNTER!: " + counting);
  io.to(clients[counting]).emit('startDrawing', drawingStart);
  if(counting >= clients.length) {
    counting = 0;
    return;
  }
}

function returnUserID(req) {
  return new Promise((resolve, reject) => {
    try {
      if(!req.session.user_id) {
        var guest_id = Math.floor(Math.random() * 100) + 1;
        resolve(req.session.guest_id)
      } else {
        var guest_id = null;
        resolve(req.session.guest_id);
      }
    }
    catch(e) {
      reject(e);
    }
  })
}
