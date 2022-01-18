const BlogModel = require("./../models/BlogModel");
const AppError = require("./../utils/AppError");

exports.getAllBlogs = async (req, res, next) => {
  try {
    // Get all the blogs and return them as an array
    const allBlogs = await BlogModel.find();

    res.status(201).json({
      status: "success",
      data: {
        length: allBlogs.length,
        allBlogs,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.getBlog = async (req, res, next) => {
  try {
    // get the blog by the id given
    const { blogId } = req.params;

    if (!blogId) {
      return next(new AppError("400", "Please provide a proper blog id."));
    }

    const currentBlog = await BlogModel.findById(blogId);

    if (!currentBlog) {
      return next(
        new AppError(400, "The blog with the id " + blogId + " does not exist")
      );
    }

    res.status(200).json({
      status: "success",
      data: {
        currentBlog,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.addBlog = async (req, res, next) => {
  try {
    // we need to add a blog and also attach it to the current user
    // since we didnt implement the concept of jwt, we need to provide the email and password to verify the current user
    const newBlog = await BlogModel.create({
      userRef: req.currentUser._id,
      title: req.body.title,
      description: req.body.description,
      tags: req.body.tags,
    });

    res.status(201).json({
      status: "success",
      data: {
        newBlog,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.deleteBlog = async (req, res, next) => {
  try {
    // simply delete the blog as its verified
    const deletedBlog = await BlogModel.findByIdAndDelete(req.params.blogId);

    res.status(204).json({
      status: "success",
      data: {
        deletedBlog,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.updateBlog = async (req, res, next) => {
  try {
    const updatedDetails = req.body;
    delete updatedDetails.email;
    delete updatedDetails.password;
    // simply update the blog as its verified
    const updatedBlog = await BlogModel.findByIdAndUpdate(
      req.params.blogId,
      updatedDetails,
      {
        new: true,
      }
    );

    res.status(200).json({
      status: "success",
      data: {
        updatedBlog,
      },
    });
  } catch (err) {
    next(err);
  }
};
