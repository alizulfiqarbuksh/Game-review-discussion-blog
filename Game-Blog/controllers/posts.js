const express = require('express');
const router = express.Router();
const Post = require('../models/post');
const { route } = require('./auth');

router.get('/', async (req, res) => {

  try{
    res.render('posts/index.ejs');
  }
  catch(err) {
    res.redirect('/');
  }
  
});

router.get('/new', async (req, res) => {

  try{
    const dateTime = new Date().toISOString().slice(0, 16);
    res.render('posts/new.ejs', {dateTime});
  }
  catch(err) {
    res.redirect('/');
  }
  
});

router.post('/', async (req, res) => {

  try{
    await Post.create(req.body);
    res.redirect('/');
  }
  catch(err) {
    res.redirect('/');
  }

});

router.get('/:id', (req, res) => {

});

module.exports = router;
