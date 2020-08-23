const validator = require("validator");
const usersCollection = require("../db").db.collection("users");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
dotenv.config();
const saltValue = parseInt(process.env.SALT);

let User = function (data = {}) {
  this.data = data;
  this.errors = [];
  this.data.avatar = "";
};

User.prototype.validate = function () {
  if (this.data.username.length == "") {
    this.errors.push("You must provide a username.");
  }

  if (!validator.isEmail(this.data.email)) {
    this.errors.push("You must provide a valid email.");
  }

  if (this.data.password.length == "") {
    this.errors.push("You must provide a valid password.");
  }

  if (this.data.password.length > 0 && this.data.password.length < 12) {
    this.errors.push("Password must be at least 12 characters");
  }

  if (this.data.password.length > 50) {
    this.errors.push("Password cannot exceed 50 characters");
  }

  if (this.data.username.length > 0 && this.data.username.length < 3) {
    this.errors.push("Username must be at least 3 characters");
  }

  if (this.data.username.length > 30) {
    this.errors.push("Username cannot exceed 30 characters");
  }

  if (!validator.isAlphanumeric(this.data.username)) {
    this.errors.push("Username can only contain letters and numbers");
  }
};

User.prototype.cleanUp = function () {
  // check data type
  if (typeof this.data.username != "string") {
    this.data.username = "";
  }

  if (typeof this.data.email != "string") {
    this.data.email = "";
  }

  if (typeof this.data.password != "string") {
    this.data.password = "";
  }

  // remove unnecessary data field
  this.data = {
    username: this.data.username.trim().toLowerCase(),
    email: this.data.email.trim().toLowerCase(),
    password: this.data.password,
  };
};

User.prototype.register = function () {
  return new Promise(async (resolve, reject) => {
    this.cleanUp();
    this.validate();
    this.getAvatar();
    if (this.errors.length == 0) {
      let salt = bcrypt.genSaltSync(saltValue);
      this.data.password = bcrypt.hashSync(this.data.password, salt);
      await usersCollection.insertOne(this.data);
      attemptedUser = await usersCollection.findOne(this.data);
      this.data._id = attemptedUser._id;
      resolve("Congrats");
    } else {
      reject(this.errors);
    }
  });
};

User.prototype.login = function () {
  this.cleanUp();
  return new Promise(async (resolve, reject) => {
    let attemptedUser;
    attemptedUser = await usersCollection.findOne({
      username: this.data.username,
    });
    if (
      attemptedUser &&
      bcrypt.compareSync(this.data.password, attemptedUser.password)
    ) {
      this.data.email = attemptedUser.email;
      this.data._id = attemptedUser._id;
      this.getAvatar();
      resolve("Congrats!!!");
    } else {
      reject("Invalid username / password");
    }
  });
};

User.prototype.getAvatar = function () {
  let salt = bcrypt.genSaltSync(saltValue);
  let emailEnc = bcrypt.hashSync(this.data.email);
  this.data.avatar = `https://gravatar.com/avatar/${emailEnc}?s=128`;
};

User.prototype.findByUsername = function (user_name) {
  return new Promise(async (resolve, reject) => {
    let user;
    if (typeof user_name != "string") {
      reject("username must be string");
      return;
    }
    try {
      user = await usersCollection.findOne({ username: user_name });
      if (!user) reject("can't find username");
      resolve(user);
    } catch (err) {
      resolve("Connection error");
    }
  });
};

module.exports = User;
