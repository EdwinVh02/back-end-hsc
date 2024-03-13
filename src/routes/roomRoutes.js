const express = require("express");
const router = express.Router();
const roomController = require("../controllers/roomController");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/rooms", authMiddleware.authenticate, roomController.getAllRooms);

module.exports = router;
