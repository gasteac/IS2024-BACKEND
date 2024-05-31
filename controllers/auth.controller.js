// Importa el modelo de usuario desde el archivo user.model.js
import User from "../models/user.model.js";

// Importa la biblioteca bcryptjs para trabajar con contraseñas encriptadas
import bcryptjs from "bcryptjs";

// Importa una función de manejo de errores desde el archivo error.js
import { errorHandler } from "../utils/error.js";

// Importa la biblioteca jsonwebtoken para trabajar con tokens JWT
import jwt from "jsonwebtoken";

export const signin = async (req, res, next) => {
  // Extrae el email y la contraseña del cuerpo de la solicitud (lo que le manda el front)
  const { email, password } = req.body;

  // Verifica si el email o la contraseña no están presentes
  if (!email || !password) {
    // Llama a la función errorHandler con un error 400 (Solicitud incorrecta)
    next(errorHandler(400, "All fields are required"));
  }

  try {
    // Busca un usuario en la base de datos por su email
    const validUser = await User.findOne({ email });

    // Si el usuario no se encuentra, devuelve un error 404 (No encontrado)
    if (!validUser) {
      return next(errorHandler(404, "Email not registered"));
    }

    // Compara la contraseña proporcionada con la contraseña encriptada del usuario
    const validPassword = bcryptjs.compareSync(password, validUser.password);

    // Si la contraseña no es válida, devuelve un error 400 (Solicitud incorrecta)
    if (!validPassword) {
      return next(errorHandler(400, "Invalid password"));
    }

    // Genera un token JWT utilizando el id del usuario y una clave secreta
    const token = jwt.sign(
      { id: validUser._id },
      process.env.JWT_SECRET
    );

    // Extrae la contraseña del objeto usuario para no enviarla en la respuesta
    const { password: pass, ...rest } = validUser._doc;

    // Configura la respuesta con estado 200 (OK), agrega una cookie con el token y envía el resto de los datos del usuario
    res
      .status(200)
      .cookie("access_token", token, {
        httpOnly: true,
      })
      .json(rest);

  } catch (error) {
    // Maneja cualquier error llamando a la función next con el error
    next(error);
  }
};

export const signup = async (req, res, next) => {
  // Extrae el nombre de usuario, email y contraseña del cuerpo de la solicitud
  const { username, email, password } = req.body;

  // Verifica si el nombre de usuario, email o contraseña no están presentes o están vacíos
  if (
    !username ||
    !email ||
    !password ||
    username === "" ||
    email === "" ||
    password === ""
  ) {
    // Llama a la función errorHandler con un error 400 (Solicitud incorrecta)
    next(errorHandler(400, "All fields are required"));
  }

  // Busca un usuario en la base de datos que tenga el mismo email o nombre de usuario
  const existingUser = await User.findOne({
    $or: [{ email }, { username }],
  });

  // Si el usuario ya existe, devuelve un error 400 (Solicitud incorrecta)
  if (existingUser) {
    return next(errorHandler(400, "Email or username already taken"));
  }

  // Encripta la contraseña proporcionada
  const hashedPassword = bcryptjs.hashSync(password, 10);

  // Crea un nuevo usuario con el nombre de usuario, email y la contraseña encriptada
  const newUser = new User({
    username,
    email,
    password: hashedPassword,
  });

  try {
    // Guarda el nuevo usuario en la base de datos
    await newUser.save();

    // Genera un token JWT utilizando el id del nuevo usuario y una clave secreta
    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET);

    // Extrae la contraseña del objeto nuevo usuario para no enviarla en la respuesta
    const { password, ...rest } = newUser._doc;

    // Configura la respuesta con estado 201 (Creado), agrega una cookie con el token y envía el resto de los datos del usuario
    res
      .status(201)
      .cookie("access_token", token, {
        httpOnly: true,
      })
      // Este comentario indica un cambio temporal para pruebas: ".json(rest)" se reemplaza por ".json(newUser._doc)" para que el test falle mostrando la contraseña.
      .json(rest);

  } catch (error) {
    // Maneja cualquier error llamando a la función next con el error
    next(error);
  }
};
