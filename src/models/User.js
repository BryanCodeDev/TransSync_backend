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

  static async create(name, last_name, document, email, phone, vehicle_plate, role, hashedPassword) {
    return new Promise((resolve, reject) => {
      db.query(
        "INSERT INTO users (name, last_name, document, email, phone, vehicle_plate, role, password) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        [name, last_name, document, email, phone, vehicle_plate, role, hashedPassword],
        (err, result) => {
          if (err) reject(err);
          resolve(result);
        }
      );
    });
  }

  static async getAll() {
    return new Promise((resolve, reject) => {
      db.query("SELECT id, name, last_name, document, email, phone, vehicle_plate, role, created_at FROM users", (err, result) => {
        if (err) reject(err);
        resolve(result);
      });
    });
  }

  static async getByRole(role) {
    return new Promise((resolve, reject) => {
      db.query("SELECT id, name, last_name, document, email, phone, vehicle_plate, role, created_at FROM users WHERE role = ?", [role], (err, result) => {
        if (err) reject(err);
        resolve(result);
      });
    });
  }

  static async update(id, userData) {
    const { name, last_name, document, email, phone, vehicle_plate, role } = userData;
    
    return new Promise((resolve, reject) => {
      db.query(
        "UPDATE users SET name = ?, last_name = ?, document = ?, email = ?, phone = ?, vehicle_plate = ?, role = ? WHERE id = ?",
        [name, last_name, document, email, phone, vehicle_plate, role, id],
        (err, result) => {
          if (err) reject(err);
          resolve(result);
        }
      );
    });
  }

  static async updatePassword(id, hashedPassword) {
    return new Promise((resolve, reject) => {
      db.query(
        "UPDATE users SET password = ? WHERE id = ?",
        [hashedPassword, id],
        (err, result) => {
          if (err) reject(err);
          resolve(result);
        }
      );
    });
  }

  static async deleteUser(id) {
    return new Promise((resolve, reject) => {
      db.query("DELETE FROM users WHERE id = ?", [id], (err, result) => {
        if (err) reject(err);
        resolve(result);
      });
    });
  }
}

module.exports = User;