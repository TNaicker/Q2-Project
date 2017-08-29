const express       = require('express');
const app           = express();
const knex          = require('./db.js');
const bodyParser    = require('body-parser');
const cookieSession = require('cookie-session');

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
  res.render('game');
})

app.use((req, res) => {
  res.sendStatus(418);
})

var server = app.listen(PORT, () => {
  console.log('listening on port', PORT);
})

const io = require('socket.io')(server);

io.on('connection', (socket) => {
  console.log('a user connected');

  socket.on('chat message', function(msg){
    io.emit('chat message', msg);
    console.log(msg);
  });

  socket.on('drawing', function(data) {
    io.emit('drawing', data);
    console.log(data);
  })

  socket.on('disconnect', function(){
    console.log('user disconnected');
  });
})
