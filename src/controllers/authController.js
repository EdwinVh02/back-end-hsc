const sql = require("mssql");
const pool = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../constants");
const {
  generateRememberToken,
  saveRememberToken,
  deleteRememberToken,
} = require("../models/auth");

async function login(req, res) {
  const { correo, contraseña } = req.body;

  try {
    const request = pool.request();
    request.input("correo", sql.NVarChar, correo);

    const result = await request.query(
      "SELECT Id_usuario, Contraseña, remember_token FROM tblusuario_autenticacion WHERE Id_usuario = (SELECT Id_usuario FROM tblusuario WHERE vchcorreo = @correo)"
    );

    if (result.recordset.length === 0) {
      return res
        .status(401)
        .json({ message: "Email o contraseña incorrectos" });
    }

    const storedPassword = result.recordset[0].Contraseña;
    const userId = result.recordset[0].Id_usuario;

    const passwordMatch = await bcrypt.compare(contraseña, storedPassword);

    if (!passwordMatch) {
      return res
        .status(401)
        .json({ message: "Email o contraseña incorrectos" });
    }

    // Generar el token JWT
    const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: "1h" });

    // Guardar el token en la base de datos
    const rememberToken = generateRememberToken(); // Implementa esta función para generar un token único
    await saveRememberToken(userId, rememberToken);

    res.setHeader("Authorization", `Bearer ${token}`);
    res.json({ token, rememberToken });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
}

async function logout(req, res) {
  try {
    const { userId } = req.user;
    await deleteRememberToken(userId);

    res.status(200).json({ message: "Logout exitoso" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
}

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
  login,
  logout,
  registerUser,
};
