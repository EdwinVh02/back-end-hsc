const pool = require("../db");
const sql = require("mssql");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../constants"); // Asegúrate de tener definido JWT_SECRET en tu archivo de constantes

function generateRememberToken() {
  const token = jwt.sign({ data: "remember_token_data" }, JWT_SECRET, {
    expiresIn: "7d",
  }); // El token expira en 7 días
  return token;
}

async function saveRememberToken(userId, rememberToken) {
  try {
    const request = pool.request();
    request.input("userId", sql.Int, userId);
    request.input("rememberToken", sql.NVarChar, rememberToken);

    // Actualiza la tabla tblusuario_autenticacion con el rememberToken
    await request.query(
      "UPDATE tblusuario_autenticacion SET remember_token = @rememberToken WHERE Id_usuario = @userId"
    );
  } catch (error) {
    console.error("Error al guardar el rememberToken:", error.message);
    throw error;
  }
}

async function deleteRememberToken(userId) {
  try {
    const request = pool.request();
    request.input("userId", sql.Int, userId);

    await request.query(`
      UPDATE tblusuario_autenticacion
      SET remember_token = NULL
      WHERE Id_usuario = @userId
    `);
  } catch (error) {
    throw error;
  }
}

module.exports = {
  generateRememberToken,
  saveRememberToken,
  deleteRememberToken,
  deleteRememberToken,
};
