const express = require('express');
const bcrypt = require('bcrypt');

const router = express.Router();
const User = require('../models/user');

router.get('/sign-up', async (req, res, next) => {
  res.render('auth/sign-up.ejs');
});

router.get('/sign-out', async (req, res) => {
  try {
    req.session.destroy(() => {
      res.redirect('/');
    });
  } catch (error) {
    console.error(error);
    res.redirect('/');
  }
});

router.post('/sign-up', async (req, res) => {
  try {
    const { username, password, confirmPassword } = req.body;
    // make sure the user does not exist
    const userInDatabase = await User.findOne({ username });

    if (userInDatabase) {
      return res.send('Username or Password is invalid');
    }
    // validate the passwords match
    if (password !== confirmPassword) {
      return res.send('Username or Password is invalid');
    }
    // take the password and encrypt in some way.
    const hashPassword = bcrypt.hashSync(password, 10);

    // If the above passes, then let's create the account
    // with the encrypted password.
    req.body.password = hashPassword;
    delete req.body.confirmPassword;

    const user = await User.create(req.body);
    // when that succeeds let's go ahead and "sign the person in"
    // rediret them to some page
    req.session.user = {
      username: user.username,
      _id: user._id,
    };

    req.session.save(() => {
      res.redirect('/');
    });
  } catch (error) {
    console.error(error);
    res.send('Something went wrong with registration!');
  }
});

router.get('/sign-in', async (req, res) => {
  res.render('auth/sign-in.ejs');
});

router.post('/sign-in', async (req, res) => {
  try {
    // try to find the user inthe db
    const { username, password } = req.body;
    // make sure the user does not exist
    const userInDatabase = await User.findOne({ username });

    // if the user does not exist, redirect to sign up with msg
    if (!userInDatabase) {
      return res.send('Username or Password is invalid');
    }
    // i the user exists, lets compare the pw with the usr pw

    const isValidPassword = bcrypt.compareSync(password, userInDatabase.password);
    // if the pw doesnt match, throw an error
    if (!isValidPassword) {
      return res.send('Username or Password is invalid');
    }

    // else continue with the "login"
    req.session.user = {
      username: userInDatabase.username,
      _id: userInDatabase._id,
    };

    req.session.save(() => {
      res.redirect('/');
    });
  } catch (error) {
    console.error(error);
    res.send('Something went wrong with Sign In');
  }
});

module.exports = router;
