const express = require('express');
const router = express.Router();
const Post = require('../models/post');
const { route } = require('./auth');
const upload = require('../config/multer');

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
    const now = new Date();
    const date = now.toLocaleDateString('en-CA');
    const time = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    const dateTime = `${date}T${time}`;

    res.render('posts/new.ejs', {dateTime});
  }
  catch(err) {
    res.redirect('/');
  }
  
});

router.post('/', upload.array('images', 5), async (req, res) => {

  try{
    if(req.session.user) {

      const imagePaths = req.files.map(file => `/uploads/${file.filename}`);

      await Post.create({
          title: req.body.title,
          body: req.body.body,
          createdAt: req.body.createdAt,
          author: req.session.user._id,
          images: imagePaths,
      });
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
    const userHasFavorited = req.session.user ? currentPost.favoritedByUsers.some(userId => userId.equals(req.session.user._id)) : false;

    res.render('posts/show.ejs', {currentPost, formattedDate, dateTime, userHasFavorited});
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
    const now = new Date();
    const date = now.toLocaleDateString('en-CA');
    const time = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    const dateTime = `${date}T${time}`;
    res.render('posts/edit.ejs', {currentPost, dateTime});
  }
  catch(err) {
    res.redirect('/');
  }

});

router.put('/:id', upload.array('images', 5), async (req, res) => {

  try {
    const currentPost = await Post.findById(req.params.id);
    const isAuthor = currentPost.author.equals(req.session.user._id);
    
    if(isAuthor) {
      currentPost.title = req.body.title;
      currentPost.body = req.body.body;
      currentPost.createdAt = req.body.createdAt;

      if (req.files && req.files.length > 0) {
        const newImages = req.files.map(file => `/uploads/${file.filename}`);
        currentPost.images.push(...newImages);
      }
      await currentPost.save();
      res.redirect('/posts/' + currentPost._id);
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
    const currentPost = await Post.findById(req.params.id).populate('comments.commenter');
    const currentComment = await currentPost.comments.id(req.params.commentId);
    const dateTime = new Date().toISOString().slice(0, 16);

    res.render('comments/edit.ejs', {currentPost, currentComment, dateTime});
  }
  catch(err) {
    res.redirect('/');
  }

});

router.put('/:id/comments/:commentId', async (req, res) => {
  
  try{
    const currentPost = await Post.findById(req.params.id);
    const currentComment = currentPost.comments.id(req.params.commentId);

    if(currentComment.commenter.equals(req.session.user._id)) {
      await currentComment.set(req.body);
      currentPost.save();
    }

    res.redirect(`/posts/${currentPost._id}`);
  }
  catch(err) {
    res.redirect('/');
  }

});

router.post('/:id/favorited-by/:userId', async (req, res) => {
  try {
    await Post.findByIdAndUpdate(req.params.id, {$push: {favoritedByUsers: req.params.userId}});
    res.redirect(`/posts/${req.params.id}`);
  } catch (error) {
    console.log(error);
    res.redirect('/');
  }
});

router.delete('/:id/favorited-by/:userId', async (req, res) => {

  try{
    await Post.findByIdAndUpdate(req.params.id, {$pull: {favoritedByUsers: req.params.userId}});
    res.redirect(`/posts/${req.params.id}`);
  }
  catch(err) {
    res.redirect('/');
  }

});



module.exports = router;
