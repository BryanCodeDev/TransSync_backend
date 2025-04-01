const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

exports.register = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: "El correo ya está registrado" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create(name, email, hashedPassword);

    res.status(201).json({ message: "Usuario registrado con éxito" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error en el servidor" });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(400).json({ message: "Correo no registrado" });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ message: "Contraseña incorrecta" });
    }

    const token = jwt.sign({ id: user.id, name: user.name }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.status(200).json({
      message: "Login exitoso",
      token,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error en el servidor" });
  }
};
