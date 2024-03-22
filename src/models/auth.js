const pool = require("../db");
const sql = require("mssql");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
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

async function enviarCorreoElectronico(destinatario, nuevaContrasena) {
  // Configurar el transporte
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: "skrillexelmejor77@gmail.com",
      pass: "bhue bmjh jajd rjsy",
    },
  });

  const mensaje = {
    from: "HotelSantaCecilia@gmail.com",
    to: destinatario,
    subject: "Nueva Contraseña",
    text: `
Estimado/a ${destinatario},
Esperamos que este mensaje te encuentre bien. Queremos informarte que hemos recibido tu solicitud para restablecer la contraseña de tu cuenta en el Hotel Santa Cecilia.

Tu nueva contraseña es: ${nuevaContrasena}

Por favor, guarda esta información de manera segura. Si tienes alguna pregunta o necesitas asistencia adicional, no dudes en contactarnos.

¡Gracias por confiar en nosotros y esperamos verte pronto en el Hotel Santa Cecilia!

Atentamente,
El Equipo del Hotel Santa Cecilia
    `,
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

async function correoExiste(correo) {
  try {
    const request = pool.request();
    request.input("correo", sql.NVarChar, correo);

    const result = await request.query(
      "SELECT Id_usuario FROM tblusuario WHERE vchcorreo = @correo"
    );

    return result.recordset.length > 0;
  } catch (error) {
    console.error(error);
    throw new Error("Error interno del servidor");
  }
}

async function consultarUsuario(correo) {
  const request = pool.request();
  request.input("correo", sql.NVarChar, correo);

  const result = await request.query(`
    SELECT u.Id_usuario, ua.RespuestaSecreta 
    FROM tblusuario u
    INNER JOIN tblusuario_autenticacion ua ON u.Id_usuario = ua.Id_usuario
    WHERE u.vchcorreo = @correo
  `);

  return result.recordset;
}

async function actualizarContrasena(userId, nuevaContrasena) {
  const hashedContrasena = await bcrypt.hash(nuevaContrasena, 10);
  const request = pool.request();
  request.input("usuarioId", sql.Int, userId);
  request.input("contraseña", sql.NVarChar, hashedContrasena);

  try {
    const result = await request.query(
      "UPDATE tblusuario_autenticacion SET Contraseña = @contraseña WHERE Id_usuario = @usuarioId"
    );

    // console.log("Número de filas actualizadas:", result.rowsAffected[0]);
  } catch (error) {
    console.error("Error al actualizar la contraseña:", error);
    throw error;
  }
}
module.exports = {
  generateRememberToken,
  saveRememberToken,
  deleteRememberToken,
  generarContrasenaAleatoria,
  enviarCorreoElectronico,
  correoExiste,
  consultarUsuario,
  actualizarContrasena,
};
