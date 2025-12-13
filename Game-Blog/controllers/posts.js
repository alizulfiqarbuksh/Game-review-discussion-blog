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
    if(req.session.user) {

      await Post.create(req.body);
      res.redirect('/posts');

    }
  }
  catch(err) {
    res.redirect('/');
  }

});

router.get('/:id', async (req, res) => {

  try{
    const currentPost = await Post.findById(req.params.id).populate('author').populate('comments.commenter');
    const dateTime = new Date().toISOString().slice(0, 16);
    const formattedDate = currentPost.createdAt.toLocaleString('en-BH', {
      dateStyle: 'medium',
      timeStyle: 'short'
    });

    res.render('posts/show.ejs', {currentPost, formattedDate, dateTime});
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

router.get('/:id/edit', async (req, res) => {

  try{
    const currentPost = await Post.findById(req.params.id).populate('author');
    const dateTime = currentPost.createdAt.toISOString().slice(0, 16);
    res.render('posts/edit.ejs', {currentPost, dateTime});
  }
  catch(err) {
    res.redirect('/');
  }

});

router.put('/:id', async (req, res) => {

  try {
    const currentPost = await Post.findById(req.params.id);
    const isAuthor = currentPost.author.equals(req.session.user._id);
    
    if(isAuthor) {
      await currentPost.updateOne(req.body);
      res.redirect('/posts');
    }
  } 
  catch (err) {
    res.redirect('/');
  }

});

router.post('/:id/comments', async (req, res) => {

  try{
    if(req.session.user) {
      
      const currentPost = await Post.findById(req.params.id);
      currentPost.comments.push(req.body);

      await currentPost.save();
      res.redirect('/posts/' + currentPost._id);

    }
  }
  catch(err) {
    res.redirect('/');
  }

});

router.delete('/:id/comments/:commentId', async (req, res) => {

  try{
    const currentPost = await Post.findById(req.params.id);
    const currentComment = currentPost.comments.id(req.params.commentId);
    const isCommenter = currentComment.commenter.equals(req.session.user._id);
    const isAuthor = currentPost.author.equals(req.session.user._id);

    if(isCommenter || isAuthor) {
      currentComment.deleteOne();
      await currentPost.save();
    }

    res.redirect(`/posts/${currentPost._id}`)
  }
  catch(err) {
    console.error(err);
    res.redirect('/');
  }

});

router.get('/:id/comments/:commentId/edit', async (req, res) => {
  
  try{
    res.render('comments/edit.ejs');
  }
  catch(err) {
    res.redirect('/');
  }

});



module.exports = router;
