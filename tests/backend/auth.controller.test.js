// Importa el modelo de usuario desde el archivo user.model.js
import User from "../../models/user.model";

// Importa la biblioteca supertest para realizar pruebas HTTP
import request from "supertest";

// Importa la biblioteca mongoose para interactuar con MongoDB
import mongoose from "mongoose";

// Importa la aplicación y el servidor desde el archivo index.js
import { app, server } from "../../index.js";

// Importa la biblioteca bcryptjs para trabajar con contraseñas encriptadas
import bcryptjs from "bcryptjs";

// Después de realizar las pruebas, cerramos el servidor y la conexión con la base de datos
afterAll(async () => {
  // Elimina todos los usuarios de prueba con el nombre de usuario "testuser"
  await User.deleteMany({ username: "testuser" });
  // Cierra el servidor
  server.close();
  // Desconecta mongoose de la base de datos
  await mongoose.disconnect();
  // Cierra la conexión de mongoose
  mongoose.connection.close();
});

// Antes de realizar las pruebas, eliminamos los usuarios de prueba que creamos
beforeEach(async () => {
  // Elimina todos los usuarios de prueba con el nombre de usuario "testuser"
  await User.deleteMany({ username: "testuser" });
  // Elimina todos los usuarios de prueba con el nombre de usuario "testuser2"
  await User.deleteMany({ username: "testuser2" });
});

// Pruebas de registro de usuario
describe("POST /signup", () => {
  it("should create a new user and return the user data without the password", async () => {
    // Creamos un objeto con los datos ficticios de un usuario para la prueba
    const userData = {
      username: "testuser",
      email: "test@example.com",
      password: "testpassword",
    };

    // Hacemos una petición POST a la ruta /api/auth/signup con los datos del usuario
    const response = await request(app)
      .post("/api/auth/signup")
      .send(userData)
      .expect(201); // Esperamos que la respuesta sea un 201 (Created)

    // Comparamos lo que nos devuelve la respuesta con lo que esperamos
    expect(response.body).toEqual(
      expect.objectContaining({
        username: userData.username,
        email: userData.email,
      })
    );
    // Aseguramos que la contraseña no esté en el cuerpo de la respuesta
    expect(response.body.password).toBeUndefined();
  });

  it("should return an error if the username or email exists", async () => {
    // Creamos un objeto con los datos ficticios de un usuario para la prueba
    const userData = {
      username: "testuser",
      email: "test@example.com",
      password: "testpassword",
    };
    // Creamos y guardamos un usuario que tenga los mismos datos que el usuario que vamos a crear
    const testUserExist = new User(userData);
    await testUserExist.save();
    // Intentamos crear un usuario con los mismos datos
    const response = await request(app)
      .post("/api/auth/signup")
      .send(userData);
    // Esperamos un error 400 (Bad Request) porque el usuario ya existe
    expect(response.status).toBe(400);
    // Esperamos que el mensaje de la respuesta sea "Email or username already taken"
    expect(response.body.message).toBe("Email or username already taken");
  });

  it("should return an error if any required field is missing", async () => {
    // Creamos un objeto con datos incompletos para la prueba
    const userData = {
      username: "testuser",
      email: "",
      password: "testpassword",
    };
    // Hacemos una petición POST a la ruta /api/auth/signup con los datos incompletos del usuario
    const response = await request(app)
      .post("/api/auth/signup")
      .send(userData);
    // Esperamos un error 400 (Bad Request) debido a campos faltantes
    expect(response.status).toBe(400);
    // Esperamos que el mensaje de la respuesta sea "All fields are required"
    expect(response.body.message).toBe("All fields are required");
  });

  it("should sign up a user and return a token", async () => {
    // Creamos un objeto con los datos ficticios de un usuario para la prueba
    const userData = {
      username: "testuser",
      email: "test@example.com",
      password: "testpassword",
    };
    // Hacemos una petición POST a la ruta /api/auth/signup con los datos del usuario
    const response = await request(app)
      .post("/api/auth/signup")
      .send(userData);
    // Esperamos un estado 201 (Created)
    expect(response.status).toBe(201);
    // Esperamos que en el header de la respuesta haya una cookie llamada "set-cookie"
    expect(response.headers["set-cookie"]).toBeDefined();
  });

  it("should save the new user to the database", async () => {
    // Creamos un objeto con los datos ficticios de un usuario para la prueba
    const userData = {
      username: "testuser",
      email: "test@example.com",
      password: "testpassword",
    };
    // Hacemos una petición POST a la ruta /api/auth/signup con los datos del usuario
    const response = await request(app)
      .post("/api/auth/signup")
      .send(userData)
      .expect(201); // Esperamos un estado 201 (Created)

    // Aseguramos que en el header de la respuesta haya una cookie llamada "set-cookie"
    expect(response.headers["set-cookie"]).toBeDefined();
    // Buscamos en la base de datos el usuario que acabamos de crear
    const savedUser = await User.findOne({ email: userData.email });
    expect(savedUser).toBeDefined();
  });
});

// Pruebas de inicio de sesión
describe("POST /signin", () => {
  it("should return an error if required fields are missing", async () => {
    // Enviamos una petición sin datos para iniciar sesión
    const response = await request(app).post("/api/auth/signin").send({});

    // Esperamos un error 400 (Bad Request) debido a campos faltantes
    expect(response.status).toBe(400);
    // Esperamos que el mensaje de la respuesta sea "All fields are required"
    expect(response.body.message).toBe("All fields are required");
  });

  it("should return an error if email is not registered", async () => {
    // Enviamos una petición para iniciar sesión con un email no registrado
    const response = await request(app).post("/api/auth/signin").send({
      email: "unregistered@example.com",
      password: "pacheca",
    });
    // Esperamos un error 404 (Not Found) porque el email no está registrado
    expect(response.status).toBe(404);
    // Esperamos que el mensaje de la respuesta sea "Email not registered"
    expect(response.body.message).toBe("Email not registered");
  });

  it("should return an error if password is invalid", async () => {
    // Creamos y guardamos un usuario de prueba con una contraseña cifrada
    const hashedPassword = bcryptjs.hashSync("pacheca", 10);
    const testUser = new User({
      username: "testuser",
      email: "test@example.com",
      password: hashedPassword,
    });
    await testUser.save();

    // Enviamos una petición para iniciar sesión con una contraseña incorrecta
    const response = await request(app).post("/api/auth/signin").send({
      email: "test@example.com",
      password: "invalidpassword",
    });
    // Esperamos un error 400 (Bad Request) debido a la contraseña incorrecta
    expect(response.status).toBe(400);
    // Esperamos que el mensaje de la respuesta sea "Invalid password"
    expect(response.body.message).toBe("Invalid password");
  });

  it("should sign in a user and return a token", async () => {
    // Creamos y guardamos un usuario de prueba con una contraseña cifrada
    const hashedPassword = bcryptjs.hashSync("pacheca", 10);
    const testUser = new User({
      username: "testuser",
      email: "test@example.com",
      password: hashedPassword,
    });
    await testUser.save();

    // Enviamos una petición para iniciar sesión con los datos correctos del usuario
    const response = await request(app).post("/api/auth/signin").send({
      email: "test@example.com",
      password: "pacheca",
    });

    // Esperamos un estado 200 (OK)
    expect(response.status).toBe(200);
    // Esperamos que en el header de la respuesta haya una cookie llamada "set-cookie"
    expect(response.headers["set-cookie"]).toBeDefined();
  });
});
