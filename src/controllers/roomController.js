const sql = require("mssql");
const pool = require("../db"); // Suponiendo que el archivo dbConfig contiene tu configuración de conexión

// Función para crear una nueva habitación
async function crearHabitacion(req, res) {
  const { idEstado, descripcion, precio, idTipoHabitacion } = req.body;

  try {
    const request = pool.request();
    const result = await request.query(`
            INSERT INTO tblhabitacion (Id_estado, vchdescripcion, precio, Id_tipohabitacion)
            VALUES (${idEstado}, '${descripcion}', ${precio}, ${idTipoHabitacion})
        `);
    res.json({ message: "Habitación creada exitosamente" }); // Envía un mensaje de éxito en la respuesta
  } catch (error) {
    console.error("Error al crear habitación:", error);
    res.status(500).json({ error: "Error al crear habitación" }); // Envia un mensaje de error en caso de fallo
  }
}

// Función para obtener todas las habitaciones
async function obtenerHabitaciones(req, res) {
  try {
    const request = pool.request();
    const result = await request.query("SELECT * FROM tblhabitacion");
    console.log(JSON.stringify(result.recordset, null, 2));
    res.json(result.recordset); // Envía el resultado como un JSON en la respuesta
  } catch (error) {
    console.error("Error al obtener habitaciones:", error);
    res.status(500).json({ error: "Error al obtener habitaciones" }); // Envia un mensaje de error en caso de fallo
  }
}

// Función para actualizar una habitación existente
async function actualizarHabitacion(req, res) {
  const { idHabitacion, idEstado, descripcion, precio, idTipoHabitacion } =
    req.body;

  try {
    const request = pool.request();
    const result = await request.query(`
            UPDATE tblhabitacion
            SET Id_estado = ${idEstado}, vchdescripcion = '${descripcion}', precio = ${precio}, Id_tipohabitacion = ${idTipoHabitacion}
            WHERE Id_habitacion = ${idHabitacion}
        `);
    if (result.rowsAffected[0] > 0) {
      res.json({ message: "Habitación actualizada exitosamente" }); // Envía un mensaje de éxito en la respuesta si se actualizó al menos una fila
    } else {
      res
        .status(404)
        .json({ error: "No se encontró la habitación para actualizar" }); // Envia un mensaje de error si no se actualizó ninguna fila
    }
  } catch (error) {
    console.error("Error al actualizar habitación:", error);
    res.status(500).json({ error: "Error al actualizar habitación" }); // Envia un mensaje de error en caso de fallo
  }
}

async function eliminarHabitacion(req, res) {
  const { idHabitacion } = req.params;

  try {
    const request = pool.request();
    const result = await request.query(`
            DELETE FROM tblhabitacion
            WHERE Id_habitacion = ${idHabitacion}
        `);
    if (result.rowsAffected[0] > 0) {
      res.json({ message: "Habitación eliminada exitosamente" }); // Envía un mensaje de éxito en la respuesta si se eliminó al menos una fila
    } else {
      res
        .status(404)
        .json({ error: "No se encontró la habitación para eliminar" }); // Envia un mensaje de error si no se eliminó ninguna fila
    }
  } catch (error) {
    console.error("Error al eliminar habitación:", error);
    res.status(500).json({ error: "Error al eliminar habitación" }); // Envia un mensaje de error en caso de fallo
  }
}

module.exports = {
  crearHabitacion,
  obtenerHabitaciones,
  actualizarHabitacion,
  eliminarHabitacion,
};
