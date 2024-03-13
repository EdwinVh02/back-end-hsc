const pool = require("../db");
const sql = require("mssql");
const bcrypt = require("bcrypt");

async function registerUser(req, res) {
  const {
    nombre,
    apellidoP,
    apellidoM,
    correo,
    telefono,
    sexoId,
    contraseña,
    preguntaSecreta,
    respuestaSecreta,
  } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(contraseña, 10);

    const request = pool.request();

    request.input("sexoId", sql.Int, sexoId);
    request.input("nombre", sql.NVarChar, nombre);
    request.input("apellidoP", sql.NVarChar, apellidoP);
    request.input("apellidoM", sql.NVarChar, apellidoM);
    request.input("correo", sql.NVarChar, correo);
    request.input("telefono", sql.NVarChar, telefono);

    const resultUsuario = await request.query(`
      INSERT INTO tblusuario (Id_sexo, vchnombre, vchapellidop, vchapellidom, vchcorreo, vchtelefono)
      OUTPUT INSERTED.Id_usuario
      VALUES (@sexoId, @nombre, @apellidoP, @apellidoM, @correo, @telefono);
    `);

    console.log("Resultado de la inserción de usuario:", resultUsuario);

    const usuarioId = resultUsuario.recordset[0].Id_usuario;

    console.log("ID del nuevo usuario:", usuarioId);

    request.input("usuarioId", sql.Int, usuarioId);
    request.input("contraseña", sql.NVarChar, hashedPassword);
    request.input("preguntaSecreta", sql.NVarChar, preguntaSecreta);
    request.input("respuestaSecreta", sql.NVarChar, respuestaSecreta);
    request.input("fechaCreacion", sql.DateTime, new Date());

    const resultAutenticacion = await request.query(`
      INSERT INTO tblusuario_autenticacion (Id_usuario, Contraseña, PreguntaSecreta, RespuestaSecreta, created_at)
      VALUES (@usuarioId, @contraseña, @preguntaSecreta, @respuestaSecreta, @fechaCreacion);
    `);

    console.log(
      "Resultado de la inserción de autenticación:",
      resultAutenticacion
    );

    res.status(201).json({ message: "Usuario registrado exitosamente" });
  } catch (error) {
    console.error(error);
    console.log("Error al registrar usuario:", error.message);
    res.status(500).json({ error: "Error interno del servidor" });
  }
}

module.exports = {
  registerUser,
};
