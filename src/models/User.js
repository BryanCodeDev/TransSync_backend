const db = require("../config/db");

class User {
  static async findByEmail(email) {
    return new Promise((resolve, reject) => {
      db.query("SELECT * FROM users WHERE email = ?", [email], (err, result) => {
        if (err) reject(err);
        resolve(result[0]);
      });
    });
  }

  static async create(name, email, hashedPassword) {
    return new Promise((resolve, reject) => {
      db.query(
        "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
        [name, email, hashedPassword],
        (err, result) => {
          if (err) reject(err);
          resolve(result);
        }
      );
    });
  }
}

module.exports = User;
