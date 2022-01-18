const util = require("util");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const multer = require("multer");

const UserModel = require("../models/UserModel");
const BlogModel = require("../models/BlogModel");
const AppError = require("../utils/AppError");

//this is the function that verifies the user password and passes onto the next middleware
exports.verify = async (req, res, next) => {
  try {
    //extract the password from the req.body and verify it with the database
    // we verify it with the email address provided to us

    const currentPassword = req.body.password;
    const currentEmail = req.body.email;
    if (!currentEmail) {
      return next(new AppError(400, "Please enter the email"));
    }
    if (!currentPassword) {
      return next(new AppError(400, "Please enter the password"));
    }
    let currentUser = await UserModel.findOne({ email: currentEmail });

    if (!currentUser) {
      return next(new AppError(400, "Please enter the right email address"));
    }
    console.log(currentPassword, currentUser.password);
    //if good, check whether the password provided is correct.this functionality is already present as an
    //  instance to the user model
    //if the functions returns false. then we must return a error, where the password is the plain password
    //and the user.password is the hashed password saved in the db
    const checkPasswordBool = await currentUser.checkPassword(
      currentPassword,
      currentUser.password
    );
    if (!checkPasswordBool) {
      return next(
        new AppError(401, "Please provide the valid username and password.")
      );
    }

    req.currentUser = currentUser;

    next();
  } catch (err) {
    next(err);
  }
};

//Controller functions

exports.addUser = async (req, res, next) => {
  try {
    // firstly, check whether the password and cnfrmpassword are same
    if (req.body.password !== req.body.confirm_password) {
      return next(new AppError(400, "The passwords do not match"));
    }

    // check, if there is a customer based on the userid given
    const checkIfCustomerExists = await UserModel.findOne({
      email: req.body.email,
    });
    // console.log("the customer already exists", checkIfCustomerExists);
    if (checkIfCustomerExists) {
      return next(new AppError(400, "The email address already exists"));
    }

    // now add the customer with the details
    const newCustomer = await UserModel.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      image: req.body.image,
    });

    console.log(newCustomer);

    res.status(201).json({
      status: "success",
      data: {
        newCustomer,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.getAllUsers = async (req, res, next) => {
  try {
    // we need to fetch all the users from the database, allowing only certain properties
    const allUsers = await UserModel.find();

    console.log(allUsers);
    res.status(200).json({
      status: "success",
      data: {
        length: allUsers.length,
        allUsers,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.getUserDetails = async (req, res, next) => {
  try {
    // we need to extract the user_id from the req.body and search accordingly
    const { userId } = req.params;
    console.log("the user id is ", userId);

    const currentUser = await UserModel.findById(userId).populate({
      path: "blogs",
      select: "title description tags createdAt",
    });
    console.log(currentUser);

    if (!currentUser) {
      return next(new AppError(404, "There is no user based on the userid"));
    }

    console.log(currentUser);
    res.status(200).json({
      status: "success",
      data: {
        currentUser,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    // the customer is saved on the req object

    // need to delete all the blogs with the respective email address
    await BlogModel.deleteMany({
      email: req.currentUser.email,
    });

    const deletedCustomer = await UserModel.findOneAndDelete({
      email: req.currentUser.email,
    });

    res.status(204).json({
      status: "success",
      data: {
        deletedCustomer,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    //just update the customer deails removing the certain properties from the req.body
    const newDetails = req.body;
    console.log(newDetails);
    delete newDetails.password;
    delete newDetails.email;

    const updatedUser = await UserModel.findOneAndUpdate(
      { email: req.currentUser.email },
      newDetails,
      {
        new: true,
      }
    );

    res.status(200).json({
      status: "success",
      data: {
        updatedUser,
      },
    });
  } catch (err) {
    next(err);
  }
};
