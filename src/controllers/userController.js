const db = require("../config/db");
const bcrypt = require("bcryptjs");

const getUsers = (req, res) => {
    db.query("SELECT id, name, email FROM users", (err, results) => {
        if (err) {
            return res.status(500).json({ error: "Error obteniendo usuarios" });
        }
        res.json(results);
    });
};

const registerUser = async (req, res) => {
    const { name, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    db.query(
        "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
        [name, email, hashedPassword],
        (err, result) => {
            if (err) {
                return res.status(500).json({ error: "Error registrando usuario" });
            }
            res.json({ message: "Usuario registrado exitosamente" });
        }
    );
};

module.exports = { getUsers, registerUser };
