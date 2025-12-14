const mongoose = require('mongoose');

const CommentSchema = mongoose.Schema({
  commenter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  text: {
    type: String,
    required: true,
  },

  createdAt: {
    type: Date,
  },
});

const PostSchema = mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  title: {
    type: String,
    required: true,
  },

  body: {
    type: String,
    required: true,
  },

  images: [{
    type: String,
  }],

  comments: [CommentSchema],

  createdAt: {
    type: Date,
    default: Date.now,
  },

  favoritedByUsers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
});

const Post = mongoose.model('Post', PostSchema);

module.exports = Post;