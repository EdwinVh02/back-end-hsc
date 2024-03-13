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

module.exports = {
  login,
  logout,
};
