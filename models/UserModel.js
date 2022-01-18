const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const validator = require("validator");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Every user must contain a name."],
    },
    email: {
      type: String,
      required: [true, "Every user must have an email,"],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, "Please provide an valid email."],
    },
    photo: {
      type: String,
      default: "default.jpg",
    },
    password: {
      type: String,
      required: [true, "Every user must have a password."],
    },
  },
  {
    toJSON: {
      virtuals: true,
    },
    toObject: {
      virtuals: true,
    },
  }
);

//Virtuals

userSchema.virtual("blogs", {
  ref: "Blog",
  localField: "_id",
  foreignField: "userRef",
});

//Pre save hooks
//its is an middleware function, that takes in the parameter next
//this is something which must be done after we are creating or updating any document and prior to saving
//the document on the database hence it must be a pre save hook

//NOTE: the callback function must NOT use the arrow function, as we cant use the this keyword

// pre save hook to hash the input passowrd
userSchema.pre("save", async function (next) {
  //1)This pre hoook must only work when are saving or updating the password
  if (this.isModified("password")) {
    //2)update/create the password with the encrypted one
    this.password = await bcrypt.hash(this.password, 12);
    //3)we must remove the confirmPassword feild from saving onto the database
    this.confirmPassword = undefined;
  }
  //as this is a middleware, we must pass on to the next function
  next();
});

//Instance Methods
// These methods are created to get the Thin Controller/ Fat model
//creating an instance method of the schema, which is present on each of the doc created
userSchema.methods.checkPassword = async (plainPass, hashPass) => {
  //this function returns true if the passwords are correct
  return await bcrypt.compare(plainPass, hashPass);
};

const User = mongoose.model("User", userSchema);

module.exports = User;
