const sql = require("mssql");

const config = {
  user: "sa",
  password: "2402",
  server: "localhost",
  database: "hotelsc",
  options: {
    encrypt: false,
    trustServerCertificate: false,
  },
};

const pool = new sql.ConnectionPool(config);

async function connect() {
  try {
    await pool.connect();
    console.log("Conexión a la base de datos establecida correctamente");
  } catch (error) {
    console.error("Error al conectar con la base de datos:", error);
  }
}

connect();

module.exports = pool;
