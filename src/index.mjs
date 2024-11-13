import express, { response } from "express";
import mongoose from "mongoose";

const app = express();
const PORT = process.env.PORT || 3000;

// Conexión con la base de datos
/*mongoose.connect('mongodb://nico:12345678@127.0.0.1:8083/miapp?authSource=admin')
    .then(() => console.log('Conectado a MongoDB'))
    .catch(err => console.error('Falló la conexión a MongoDB', err));
*/
// Conexión con la base de datos
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Conectado a MongoDB'))
    .catch(err => console.error('Falló la conexión a MongoDB', err));

    
app.use(express.json());

// Definimos el modelo de usuario
const Usuario = mongoose.model('usuario', new mongoose.Schema({
    username: { type: String, required: true },
    displayName: { type: String, required: true }
}));

// Definimos las constantes para mensajes
const MSG_USUARIO_CREADO = "Usuario creado exitosamente.";
const MSG_USUARIO_ACTUALIZADO = "Usuario actualizado correctamente.";
const MSG_USUARIO_ELIMINADO = "Usuario eliminado correctamente.";
const MSG_USUARIO_NO_ENCONTRADO = "Usuario no encontrado.";
const MSG_ID_INVALIDO = "Formato de ID inválido.";
const MSG_ERROR_SERVIDOR = "Error en el servidor.";

app.listen(PORT, () => {
    console.log(`API corriendo en el puerto ${PORT}`);
});

/**
 * Raíz de la API.
 * GET /api/v1
 */
app.get("/api/v1", (request, response) => {
    response.status(200).send({ msg: "Bienvenido a la API de usuarios." });
});

/**
 * Obtiene todos los usuarios.
 * GET /api/v1/usuarios
 */
app.get("/api/v1/usuarios", async (request, response) => {
    try {
        const usuarios = await Usuario.find();
        return response.status(200).json(usuarios);
    } catch (error) {
        console.error(error);
        return response.status(500).json({ msg: MSG_ERROR_SERVIDOR });
    }
});

/**
 * Crear un nuevo usuario.
 * POST /api/v1/usuarios/crear
 */
app.post("/api/v1/usuarios/crear", async (request, response) => {
    const { body } = request;
    try {
        const nuevoUsuario = await Usuario.create(body);
        return response.status(201).json({ msg: MSG_USUARIO_CREADO, usuario: nuevoUsuario });
    } catch (error) {
        console.error(error);
        return response.status(500).json({ msg: MSG_ERROR_SERVIDOR });
    }
});

/**
 * Obtiene un usuario específico por su ID.
 * GET /api/v1/usuarios/:usuarioId
 */
app.get("/api/v1/usuarios/:usuarioId", async (request, response) => {
    const usuario = await buscarUsuarioPorId(request.params.usuarioId, response);
    if (usuario) {
        response.status(200).json(usuario);
    }
});

/**
 * Actualizar un usuario específico por su ID.
 * PUT /api/v1/usuarios/:usuarioId/actualizar
 */
app.put("/api/v1/usuarios/:usuarioId/actualizar", async (request, response) => {
    const usuario = await buscarUsuarioPorId(request.params.usuarioId, response);
    if (usuario) {
        Object.assign(usuario, request.body);
        await usuario.save();
        response.status(200).json({ msg: MSG_USUARIO_ACTUALIZADO, usuario });
    }
});

/**
 * Eliminar un usuario específico por su ID.
 * DELETE /api/v1/usuarios/:usuarioId/eliminar
 */
app.delete("/api/v1/usuarios/:usuarioId/eliminar", async (request, response) => {
    const usuario = await buscarUsuarioPorId(request.params.usuarioId, response);
    if (usuario) {
        await usuario.remove();
        response.status(200).json({ msg: MSG_USUARIO_ELIMINADO });
    }
});

/**
 * Buscar un usuario por su ID.
 * Si el ID no es válido o el usuario no existe, devuelve un error.
 */
const buscarUsuarioPorId = async (usuarioId, response) => {
    // Validación del formato del ID
    if (!mongoose.Types.ObjectId.isValid(usuarioId)) {
        return response.status(400).json({ msg: MSG_ID_INVALIDO });
    }

    try {
        const usuario = await Usuario.findById(usuarioId);
        if (!usuario) {
            return response.status(404).json({ msg: MSG_USUARIO_NO_ENCONTRADO });
        }
        return usuario;
    } catch (error) {
        console.error(error);
        return response.status(500).json({ msg: MSG_ERROR_SERVIDOR });
    }
};
