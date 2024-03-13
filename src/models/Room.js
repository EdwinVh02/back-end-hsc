const pool = require("../db");

async function getAll() {
  try {
    const result = await pool.query("SELECT * FROM tblhabitacion");
    return result.recordset;
  } catch (error) {
    throw error;
  }
}

module.exports = {
  getAll,
};
