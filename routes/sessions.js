const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt-as-promised');
const knex = require('../db.js');


router.get('/main', (req, res) => {
  console.log(req.session);
  res.render('index', {loggedIn: Boolean(req.session.user_id)});
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
          req.session.guest_id = null;
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
        req.session.guest_id = null;
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
