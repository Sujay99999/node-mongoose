const express = require("express");

const userController = require("./../controllers/userController");
const blogController = require("../controllers/blogController");

const router = express.Router();

router.get("/getAllBlogs", blogController.getAllBlogs);
router.get("/getBlog/:blogId", blogController.getBlog);

router.post("/addBlog", userController.verify, blogController.addBlog);
router.delete(
  "/deleteBlog/:blogId",
  userController.verify,
  blogController.deleteBlog
);
router.patch(
  "/updateBlog/:blogId",
  userController.verify,
  blogController.updateBlog
);

module.exports = router;
