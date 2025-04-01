const mysql = require("mysql2");

const db = mysql.createPool({
  host: "localhost",
  user: "Santiago@",
  password: "Santimajo101219@",
  database: "transsync",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

db.getConnection((err, connection) => {
  if (err) {
    console.error("❌ Error conectando a MySQL:", err);
    return;
  }
  console.log("📌 Conectado a la base de datos MySQL");
  connection.release();
});

module.exports = db;
