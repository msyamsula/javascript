const Post = require("../models/Post");
const { post } = require("../router");

exports.viewCreateScreen = async (req, res) => {
  res.render("create-post");
};

exports.createPost = async (req, res) => {
  req.body.author = req.session.user._id;
  let post = new Post(req.body);
  try {
    let word = await post.makePost();
    res.redirect(`/profile/${req.session.user.username}`);
  } catch (err) {
    res.redirect(`/profile/${req.session.user.username}`);
  }
};

exports.viewPost = async (req, res) => {
  try {
    let postObject = new Post();
    let post = await postObject.findById(req.params.id);
    // console.log("post", post);
    // console.log("res.locals.visitorId", res.locals.visitorId);
    res.render("post-single-screen", { post: post });
  } catch (err) {
    res.render("404");
  }
};

exports.editPostView = async (req, res) => {
  // res.send("welcome to edit page");
  let postObject = new Post();
  try {
    let post = await postObject.findById(req.params.id);
    // console.log(post);
    res.render("edit-post", { post: post });
  } catch (err) {
    res.render("404");
  }
};

exports.editPost = async (req, res) => {
  const id = req.params.id;
  let data = req.body;
  data.authorId = req.session.user._id;
  // console.log("data", data);
  let post = new Post();
  try {
    // console.log("id", id);
    // console.log("data: ", data.title, data.body);
    await post.updateById(id, data);
    res.redirect(`/profile/${req.session.user.username}`);
  } catch (err) {
    res.send("error when updating post");
  }
};

exports.deletePost = async (req, res) => {
  const id = req.params.id;
  let postObject = new Post();
  let message;
  try {
    message = await postObject.deleteById(id);
    req.flash("success", message);
    await req.session.save();
    res.redirect(`/profile/${req.session.user.username}`);
  } catch (err) {
    req.flash("errors", err);
    await req.session.save();
    res.redirect(`/profile/${req.session.user.username}`);
  }
};

exports.searchByText = async (req, res) => {
  let postObject = new Post();
  try {
    let text = req.body.text;
    let result = await postObject.searchText(text);
    // console.log(result);
    res.json(result);
  } catch (err) {
    // res.json([]);
    // console.log("controller: ", err);
    res.send(err);
  }
};
