const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema({
  userRef: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: [true, "Every Blog must have a user reference"],
  },
  title: {
    type: String,
    required: [true, "Every Blog must have a Title"],
    unique: [true, "Every Blog must have a unique Title"],
  },
  description: {
    type: String,
    required: [true, "Every Blog must have a Description"],
  },
  tags: [String],
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

blogSchema.pre(/^find/, function (next) {
  this.populate({
    path: "userRef",
    select: "-__v -password",
  });
  next();
});

const Blog = mongoose.model("Blog", blogSchema);

module.exports = Blog;
