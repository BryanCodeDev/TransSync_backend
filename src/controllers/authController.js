// src/controllers/authController.js

const pool = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { sendEmail } = require("../utils/emailService");

const register = async (req, res) => {
    const { email, password } = req.body;
    const idEmpresa = 1; // Empresa por defecto

    // Validaciones básicas
    if (!email || !password) {
        return res
            .status(400)
            .json({ message: "Todos Los Campos Son Requeridos." });
    }

    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        // Verificar si email ya existe
        const [existingEmail] = await connection.query(
            "SELECT idUsuario FROM Usuarios WHERE email = ?",
            [email]
        );
        if (existingEmail.length > 0) {
            await connection.rollback();
            return res
                .status(409)
                .json({ message: "El Correo Electrónico Ya Está Registrado." });
        }

        // **CORREGIDO: Buscar el ID del rol PENDIENTE en lugar de usar ID hardcodeado**
        const [roleResult] = await connection.query(
            "SELECT idRol FROM Roles WHERE nomRol = 'PENDIENTE'",
            []
        );
        
        if (roleResult.length === 0) {
            await connection.rollback();
            return res
                .status(500)
                .json({ message: "Error de configuración: Rol PENDIENTE no encontrado." });
        }
        
        const idRol = roleResult[0].idRol;

        // Verificar que existe la empresa
        const [empresaResult] = await connection.query(
            "SELECT idEmpresa FROM Empresas WHERE idEmpresa = ?",
            [idEmpresa]
        );
        
        if (empresaResult.length === 0) {
            await connection.rollback();
            return res
                .status(500)
                .json({ message: "Error de configuración: Empresa no encontrada." });
        }

        // Hashear la contraseña
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // Insertar usuario con el rol PENDIENTE encontrado
        const [userResult] = await connection.query(
            "INSERT INTO Usuarios (email, passwordHash, idRol, idEmpresa) VALUES (?, ?, ?, ?)",
            [email, passwordHash, idRol, idEmpresa]
        );
        const newUserId = userResult.insertId;

        // Generar token de verificación y construir URL
        const verifyToken = jwt.sign({ id: newUserId }, process.env.JWT_SECRET, { expiresIn: '1d' });
        const verifyUrl = `http://localhost:5000/api/auth/verify?token=${verifyToken}`;

        await sendEmail(
            email,
            "Verifica Tu Cuenta De Transync",
            `
            <html lang="es">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Verificación de Cuenta - Transync</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        margin: 0;
                        padding: 0;
                        background-color: #f4f4f9;
                    }
                    .email-container {
                        width: 100%;
                        max-width: 600px;
                        margin: 0 auto;
                        background-color: #ffffff;
                        border-radius: 8px;
                        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                        overflow: hidden;
                    }
                    .email-header {
                        background-color: #007bff;
                        color: #ffffff;
                        padding: 20px;
                        text-align: center;
                    }
                    .email-header h1 {
                        margin: 0;
                        font-size: 24px;
                    }
                    .email-body {
                        padding: 30px;
                        color: #333333;
                    }
                    .email-body p {
                        font-size: 16px;
                        line-height: 1.6;
                    }
                    .email-button {
                        display: inline-block;
                        padding: 12px 25px;
                        background-color: #28a745;
                        color: #ffffff;
                        text-decoration: none;
                        border-radius: 4px;
                        margin-top: 20px;
                    }
                    .footer {
                        text-align: center;
                        background-color: #f9f9f9;
                        padding: 20px;
                        color: #888888;
                        font-size: 14px;
                    }
                    @media (max-width: 600px) {
                        .email-container {
                            width: 100%;
                            padding: 15px;
                        }
                        .email-header h1 {
                            font-size: 20px;
                        }
                    }
                </style>
            </head>
            <body>
                <div class="email-container">
                    <div class="email-header">
                        <h1>Bienvenido a TranSync</h1>
                    </div>
                    <div class="email-body">
                        <p>¡Hola!</p>
                        <p>Gracias por registrarte en <strong>TranSync</strong>. Para completar tu proceso de registro, por favor verifica tu cuenta haciendo clic en el siguiente enlace:</p>
                        <a href="${verifyUrl}" class="email-button" target="_blank">Verificar mi cuenta</a>
                        <p>Este enlace expirará en 24 horas. Si no realizaste esta solicitud, puedes ignorar este correo.</p>
                        <p>Si tienes alguna pregunta, no dudes en contactarnos.</p>
                        <p>¡Gracias por ser parte de TranSync!</p>
                    </div>
                    <div class="footer">
                        <p>Transync &copy; 2025</p>
                        <p><a href="mailto:support@transync.com" style="color: #007bff;">support@transync.com</a></p>
                    </div>
                </div>
            </body>
            </html>
            `
        );

        await connection.commit();
        res
            .status(201)
            .json({
                message:
                    "Usuario Registrado Con Rol Pendiente. Por Favor, Verifica Tu Correo Electronico Para Completar El Registro.",
            });
    } catch (error) {
        await connection.rollback();
        console.error("Error En El Registro:", error);
        res
            .status(500)
            .json({ message: "Error En El Servidor Al Registrar El usuario." });
    } finally {
        connection.release();
    }
};

const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res
            .status(400)
            .json({ message: "El Correo Y La Contraseña Son Requeridos." });
    }

    try {
        const query = `
        SELECT 
            u.idUsuario, u.email, u.passwordHash, r.nomRol as rol, u.estActivo,
            a.nomAdministrador, a.apeAdministrador,
            c.nomConductor, c.apeConductor
        FROM Usuarios u
        JOIN Roles r ON u.idRol = r.idRol
        LEFT JOIN Administradores a ON u.idUsuario = a.idUsuario
        LEFT JOIN Conductores c ON u.idUsuario = c.idUsuario
        WHERE u.email = ?
        `;

        const [rows] = await pool.query(query, [email]);
        const user = rows[0];

        console.log("Usuario Encontrado", user);

        if (!user) {
            return res.status(401).json({ message: "Credenciales Inválidas." });
        }

        if (!user.estActivo) {
            return res.status(403).json({ message: "Cuenta No Activada." });
        }

        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) {
            return res.status(401).json({ message: "Credenciales Inválidas." });
        }

        // Lógica para nombre y apellido según el rol
        let nombre = '';
        let apellido = '';

        if (user.rol === "ADMINISTRADOR" || user.rol === "SUPERADMIN") {
            nombre = user.nomAdministrador || "Admin";
            apellido = user.apeAdministrador || "Usuario";
        } else if (user.rol === "CONDUCTOR") {
            nombre = user.nomConductor || "Conductor";
            apellido = user.apeConductor || "Usuario";
        } else {
            // PENDIENTE u otros roles
            nombre = "Usuario";
            apellido = "Pendiente";
        }

        const token = jwt.sign(
            { id: user.idUsuario, role: user.rol },
            process.env.JWT_SECRET,
            { expiresIn: "8h" }
        );

        res.json({
            token,
            user: {
                id: user.idUsuario,
                name: `${nombre} ${apellido}`.trim(),
                email: user.email,
                role: user.rol,
            },
        });
    } catch (error) {
        console.error("Error En El login:", error);
        res.status(500).json({ message: "Error En El Servidor." });
    }
};

const verifyAccount = async (req, res) => {
    const { token } = req.query;

    if (!token) {
        return res.status(400).json({ message: 'Token De Verificación No Proporcionado.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.id;

        // Activar la cuenta
        const [result] = await pool.query(
            'UPDATE Usuarios SET estActivo = 1 WHERE idUsuario = ?',
            [userId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Usuario No Encontrado O Ya Verificado.' });
        }

        res.status(200).json({ message: 'Cuenta Verificada Exitosamente. Ya Puedes Iniciar sesión :) .' });

    } catch (error) {
        if (process.env.NODE_ENV === 'development') {
            console.error('Error Al Verificar La Cuenta:', error);
            return res.status(400).json({ message: `Error Al Verificar La Cuenta: ${error.message}` });
        } else {
            console.error(`Token inválido: ${error.message}`);
        }
        return res.status(400).json({ message: 'Token inválido o expirado.' });
    }
};

const forgotPassword = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: "El correo electrónico es requerido." });
    }

    try {
        // Verificar si el email existe
        const [rows] = await pool.query(
            "SELECT idUsuario FROM Usuarios WHERE email = ?",
            [email]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: "El correo no está registrado." });
        }

        const userId = rows[0].idUsuario;

        // Generar token válido por 15 minutos
        const resetToken = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
            expiresIn: "15m",
        });

        const resetUrl = `http://localhost:3000/reset-password?token=${resetToken}`;

        // Enviar correo
        await sendEmail(
            email,
            "Restablece Tu Contraseña - TranSync",
            `
            <html lang="es">
            <head>
                <meta charset="UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <title>Restablecimiento de Contraseña - TranSync</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        margin: 0;
                        padding: 0;
                        background-color: #f4f4f9;
                    }
                    .email-container {
                        width: 100%;
                        max-width: 600px;
                        margin: 0 auto;
                        background-color: #ffffff;
                        border-radius: 8px;
                        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                        overflow: hidden;
                    }
                    .email-header {
                        background-color: #007bff;
                        color: #ffffff;
                        padding: 20px;
                        text-align: center;
                    }
                    .email-header h1 {
                        margin: 0;
                        font-size: 24px;
                    }
                    .email-body {
                        padding: 30px;
                        color: #333333;
                    }
                    .email-body p {
                        font-size: 16px;
                        line-height: 1.6;
                    }
                    .email-button {
                        display: inline-block;
                        padding: 12px 25px;
                        background-color: #dc3545;
                        color: #ffffff;
                        text-decoration: none;
                        border-radius: 4px;
                        margin-top: 20px;
                    }
                    .footer {
                        text-align: center;
                        background-color: #f9f9f9;
                        padding: 20px;
                        color: #888888;
                        font-size: 14px;
                    }
                    @media (max-width: 600px) {
                        .email-container {
                            width: 100%;
                            padding: 15px;
                        }
                        .email-header h1 {
                            font-size: 20px;
                        }
                    }
                </style>
            </head>
            <body>
                <div class="email-container">
                    <div class="email-header">
                        <h1>TranSync</h1>
                    </div>
                    <div class="email-body">
                        <p>¡Hola!</p>
                        <p>Has solicitado restablecer la contraseña de tu cuenta TranSync. Haz clic en el siguiente botón para continuar:</p>
                        <a href="${resetUrl}" class="email-button" target="_blank">Restablecer mi contraseña</a>
                        <p>Este enlace expirará en 15 minutos. Si no solicitaste este cambio, por favor ignora este correo.</p>
                        <p>Si tienes alguna pregunta, no dudes en contactarnos.</p>
                        <p>¡Gracias por confiar en TranSync!</p>
                    </div>
                    <div class="footer">
                        <p>TranSync &copy; 2025</p>
                        <p><a href="mailto:support@transync.com" style="color: #007bff;">support@transync.com</a></p>
                    </div>
                </div>
            </body>
            </html>
            `
        );

        res.json({ message: "Correo de restablecimiento enviado." });
    } catch (error) {
        console.error("Error en forgotPassword:", error);
        res.status(500).json({ message: "Error en el servidor." });
    }
};

const resetPassword = async (req, res) => {
    const { token } = req.query;
    const { newPassword } = req.body;

    if (!token || !newPassword) {
        return res.status(400).json({ message: "Token y nueva contraseña son requeridos." });
    }

    if (!esPasswordSegura(newPassword)) {
        return res.status(400).json({
            message:
                "La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un símbolo."
        });
    }

    try {
        // Verificar y decodificar el token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.id;

        // Hashear nueva contraseña
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Actualizar la contraseña en la BD
        const [result] = await pool.query(
            "UPDATE Usuarios SET passwordHash = ? WHERE idUsuario = ?",
            [hashedPassword, userId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Usuario no encontrado." });
        }

        res.json({ message: "Contraseña actualizada correctamente." });
    } catch (error) {
        console.error("Error en resetPassword:", error);
        res.status(400).json({ message: "Token inválido o expirado." });
    }
};

function esPasswordSegura(password) {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    return regex.test(password);
}

module.exports = {
    register,
    login,
    verifyAccount,
    forgotPassword,
    resetPassword,
    esPasswordSegura
};