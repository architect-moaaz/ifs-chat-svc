const { addAllUsers, getUserData } = require("../controllers/userController");
const router = require("express").Router();

router.post("/addUsers/", addAllUsers);
router.get("/getUsers/", getUserData);

module.exports = router;
