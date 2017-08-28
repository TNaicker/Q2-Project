const express = require('express');
const router = express.Router();


router.get('/main', (req, res) => {
  console.log(req.session);
  res.render('index', {loggedIn: Boolean(req.session.user_id)});
})
router.get('/game', (req, res) => {
  res.render('game');
})

router.get('/signup', (req, res) => {
  res.render('signup')
})

router.post('/signup', (req, res) => {
  //Logic for post

  bcrypt.hash(req.body.password, 12)
    .then((digest) => {
      knex('users')
        .insert({
          email: req.body.email,
          password_digest: digest
        }, '*')
        .then((insertedRow) => {
          const user = insertedRow[0];
          console.log(user);
          req.session.user_id = user.id;
          res.redirect('/main');
        })
        .catch((err) => {
          console.log(err);
          res.sendStatus(500);
        })
    })
    .catch((err) => {
      console.log(err);
      res.sendStatus(500);
    })
})

router.get('/login', (req, res) => {
  res.render('login');
})

router.post('/login', (req, res) => {
  //Logic for post

  knex('users')
    .where('email', req.body.email)
    .first()
    .then((query) => {
      bcrypt.compare(req.body.password, query.password_digest)
      .then(() => {
        console.log('Welcome: ' + req.body.email);
        console.log('session b4: ' + req.session);
        req.session.user_id = query.id;
        console.log('session after: ' + req.session);

        res.redirect('/main');
      })
      .catch((err) => {
        console.log('something broke later');
        console.log(err);
        res.sendStatus(500);
      })
    })
    .catch((err) => {
      console.log(err);
      res.send("Invalid login credentials");
    })
})

router.get('/logout', (req, res, next) => {
  req.session = null;
  res.redirect('/');
})

router.get('/profile', (req, res) => {
  res.render('profile', {loggedIn: Boolean(req.session.user_id)});
})

module.exports = router;
