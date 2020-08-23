// import module needed
const express = require("express");
const router = express.Router();
const userController = require("./controllers/userController");
const postController = require("./controllers/postController");

// user related routes
router.get("/", userController.home);
router.post("/register", userController.register);
router.post("/login", userController.login);
router.post("/logout", userController.logout);

//post related routes
router.get(
  "/create/post",
  userController.isLoggin,
  postController.viewCreateScreen
);
router.post("/create/post", userController.isLoggin, postController.createPost);
router.get("/post/:id", postController.viewPost);
router.get(
  "/edit/post/:id",
  userController.isLoggin,
  postController.editPostView
);
router.post("/edit/post/:id", userController.isLoggin, postController.editPost);
router.post(
  "/delete/post/:id",
  userController.isLoggin,
  postController.deletePost
);

// profile related routes
router.get(
  "/profile/:username",
  userController.isExist,
  userController.profileHomeScreen
);

// search related routes
router.post("/search", userController.isLoggin, postController.searchByText);

// export router
module.exports = router;
