require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

app.use("/auth", require("./src/routes/authRoutes"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
