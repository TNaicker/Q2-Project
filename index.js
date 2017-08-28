const express       = require('express');
const app           = express();
const APP_MODE      = "development";
const dbConfig      = require('./knexfile')[APP_MODE];
const knex          = require('knex')(dbConfig);
const bodyParser    = require('body-parser');
const cookieSession = require('cookie-session');
const bcrypt        = require('bcrypt-as-promised');

const PORT = 8000;

app.use(bodyParser.urlencoded({ extended: false }));

app.set('view engine', 'ejs');
app.use(express.static('public'));

app.use(cookieSession({
  name: 'user_cookie',
  keys: ['socure1', 'socure2']
}))

const sessions = require('./routes/sessions.js');

app.use(sessions);

app.use((req, res) => {
  res.sendStatus(418);
})

app.listen(PORT, () => {
  console.log('listening on port', PORT);
})
