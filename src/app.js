const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors"); // Importa el middleware CORS
const authRoutes = require("./routes/authRoutes");
const roomRoutes = require("./routes/roomRoutes");

const app = express();

app.use(bodyParser.json());

// Aplica el middleware CORS a todas las rutas
app.use(cors());

app.use("/api/rooms", roomRoutes);
app.use("/api/auth", authRoutes);
//hola
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
