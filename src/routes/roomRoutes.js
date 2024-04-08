const express = require("express");
const router = express.Router();
const roomController = require("../controllers/roomController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/insert", roomController.crearHabitacion);
router.get("/habitaciones", roomController.obtenerHabitaciones);
router.post("/actualizar/:id", roomController.actualizarHabitacion);
router.post("/eliminar/:id", roomController.eliminarHabitacion);

module.exports = router;
