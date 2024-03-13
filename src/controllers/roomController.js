const { HTTP_STATUS, ERROR_MESSAGES } = require("../constants");
const Room = require("../models/Room");

async function getAllRooms(req, res) {
  try {
    const rooms = await Room.getAll();
    res.status(HTTP_STATUS.OK).json(rooms);
  } catch (error) {
    console.error(error);
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json({ error: "Internal server error" });
  }
}

module.exports = {
  getAllRooms,
};
