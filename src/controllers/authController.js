const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

exports.register = async (req, res) => {
  const { name, last_name, document, email, phone, vehicle_plate, role, password } = req.body;

  try {
    // Validación de campos requeridos
    if (!name || !last_name || !document || !email || !phone || !password) {
      return res.status(400).json({ message: "Todos los campos son obligatorios, excepto la placa del vehículo" });
    }

    // Validación de rol
    const validRoles = ["admin", "conductor", "usuario"];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: "Rol no válido" });
    }

    // Verificar si el usuario ya existe
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: "El correo ya está registrado" });
    }

    // Validar que los conductores proporcionen una placa de vehículo
    if (role === "conductor" && !vehicle_plate) {
      return res.status(400).json({ message: "La placa del vehículo es obligatoria para conductores" });
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear usuario
    await User.create(name, last_name, document, email, phone, vehicle_plate, role, hashedPassword);

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

    // Verificar contraseña
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ message: "Contraseña incorrecta" });
    }

    // Generar token JWT
    const token = jwt.sign(
      { 
        id: user.id, 
        name: user.name,
        last_name: user.last_name,
        role: user.role 
      }, 
      process.env.JWT_SECRET, 
      {
        expiresIn: "1h",
      }
    );

    res.status(200).json({
      message: "Login exitoso",
      token,
      user: { 
        id: user.id, 
        name: user.name, 
        last_name: user.last_name,
        email: user.email, 
        role: user.role 
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error en el servidor" });
  }
};