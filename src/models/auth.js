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

function generarContrasenaAleatoria(longitud) {
  const caracteres =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let contraseña = "";

  for (let i = 0; i < longitud; i++) {
    const caracterAleatorio = caracteres.charAt(
      Math.floor(Math.random() * caracteres.length)
    );
    contraseña += caracterAleatorio;
  }

  return contraseña;
}

const nodemailer = require("nodemailer");

async function enviarCorreoElectronico(destinatario, nuevaContrasena) {
  // Configurar el transporte
  const transporter = nodemailer.createTransport({
    service: "Gmail", // Cambia esto según tu proveedor de correo electrónico
    auth: {
      user: "tu_correo@gmail.com", // Cambia esto por tu dirección de correo electrónico
      pass: "tu_contraseña", // Cambia esto por tu contraseña de correo electrónico
    },
  });

  const mensaje = {
    from: "agustinahdez68@gmail.com",
    to: destinatario,
    subject: "Nueva Contraseña",
    text: `Tu nueva contraseña es: ${nuevaContrasena}`,
  };

  try {
    // Enviar el correo electrónico
    const info = await transporter.sendMail(mensaje);
    console.log("Correo electrónico enviado: ", info.messageId);
  } catch (error) {
    console.error("Error al enviar el correo electrónico: ", error);
    throw error; // Propaga el error para manejarlo donde se llame a la función
  }
}

module.exports = {
  generateRememberToken,
  saveRememberToken,
  deleteRememberToken,
  generarContrasenaAleatoria,
};
