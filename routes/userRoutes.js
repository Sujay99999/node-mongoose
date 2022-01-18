const express = require("express");

const userController = require("../controllers/userController");

const router = express.Router();

router.get("/allUsers", userController.getAllUsers);
router.post("/addUser", userController.addUser);
router.get("/getUser/:userId", userController.getUserDetails);

router.delete("/deleteUser", userController.verify, userController.deleteUser);
router.patch("/updateUser", userController.verify, userController.updateUser);

module.exports = router;
