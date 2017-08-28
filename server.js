const express       = require('express');
const app           = express();
const knex          = require('./db.js');
const bodyParser    = require('body-parser');
const cookieSession = require('cookie-session');

const PORT = 8000;

app.use(bodyParser.urlencoded({ extended: false }));
//hi

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
