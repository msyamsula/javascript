const User = require("../models/User");
const Post = require("../models/Post");
const { ObjectId } = require("mongodb");

exports.isLoggin = async (req, res, next) => {
  if (req.session.user) {
    next();
  } else {
    req.flash("errors", "You must be logged in");
    await req.session.save();
    res.redirect("/");
  }
};

exports.login = async (req, res) => {
  let user = new User(req.body);
  try {
    await user.login();
    if (user.errors.length == 0) {
      req.session.user = {
        avatar: user.data.avatar,
        username: user.data.username,
        _id: user.data._id,
      };
      await req.session.save();
      res.redirect("/");
    }
  } catch (err) {
    req.flash("errors", err);
    await req.session.save();
    res.redirect("/");
  }
};

exports.logout = async (req, res) => {
  try {
    await req.session.destroy();
    res.redirect("/");
  } catch (err) {
    res.session(err);
  }
};

exports.register = async (req, res) => {
  let user = new User(req.body);
  try {
    await user.register();
    req.session.user = await {
      username: user.data.username,
      avatar: user.data.avatar,
      _id: user.data._id,
    };
    await req.session.save();
    res.redirect("/");
  } catch (err) {
    req.flash("errors", err);
    await req.session.save();
    res.redirect("/");
  }
};

exports.isExist = async (req, res, next) => {
  let user = new User();
  let profile;
  try {
    profile = await user.findByUsername(req.params.username);
    // req.profile = profile;
    next();
  } catch (err) {
    res.render("404");
  }
};

exports.profileHomeScreen = async (req, res) => {
  let postObject = new Post();
  try {
    const authorId = new ObjectId(req.session.user._id);
    let posts = await postObject.findByAuthor(authorId);
    req.posts = posts;
    res.render("profile", { posts: req.posts });
  } catch (err) {
    res.render("404");
  }
};

exports.home = (req, res) => {
  if (req.session.user) {
    res.render("home-logged-in-no-result");
  } else {
    res.render("home-guest", { errors: req.flash("errors") });
  }
};
