const express = require('express');
const router = express.Router();
const Post = require('../models/post');
const { route } = require('./auth');

router.get('/', async (req, res) => {

  try{
    const allPosts = await Post.find().populate('author');

    res.render('posts/index.ejs', {allPosts});
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
    res.redirect('/posts');
  }
  catch(err) {
    res.redirect('/');
  }

});

router.get('/:id', async (req, res) => {

  try{
    const currentPost = await Post.findById(req.params.id).populate('author');
    const formattedDate = currentPost.createdAt.toLocaleString('en-BH', {
      dateStyle: 'medium',
      timeStyle: 'short'
    });

    res.render('posts/show.ejs', {currentPost, formattedDate});
  }
  catch(err) {
    res.redirect('/');
  }
  
});

router.delete('/:id', async (req, res) => {

  try{
    const currentPost = await Post.findById(req.params.id);
    const isAuthor = currentPost.author.equals(req.session.user._id);
    
    if(isAuthor) {
      await currentPost.deleteOne();
      res.redirect('/posts');
    }
  }
  catch(err){
    res.redirect('/');
  }

});



module.exports = router;
