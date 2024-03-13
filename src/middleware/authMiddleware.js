const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../constants");

function authenticate(req, res, next) {
  const token = req.headers["authorization"];
  if (!token) {
    return res
      .status(401)
      .json({ error: "Token de autenticación no proporcionado" });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: "Token de autenticación inválido" });
    } else {
      req.user = decoded;
      next();
    }
  });
}


module.exports = {
  authenticate,
};
