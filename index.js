// ======> IMPORTACIONES <====== // 
import express from "express";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes.js";
import cors from "cors";
// dotenv.config() se utiliza para cargar las variables de entorno de un archivo .env en el objeto process.env
import dotenv from "dotenv";
dotenv.config();
// Creamos la conexión a la BDD con mongoose
mongoose
  .connect(process.env.MONGO)
  .then(console.log("Connected to MongoDB"))
  .catch((err) => console.log(err));
// Creamos una instancia de express y la exportamos 
export const app = express();
// ======> MIDDLEWARES <====== // 
// express.json() es un middleware que se utiliza para analizar las solicitudes entrantes con cargas JSON
app.use(express.json());
// cors() es un middleware que se utiliza para permitir las solicitudes de recursos de origen cruzado
app.use(cors());
// cookieParser() es un middleware que se utiliza para analizar las cookies de las solicitudes entrantes
app.use(cookieParser());
// ======> RUTAS <====== // 
app.use("/api/auth", authRoutes);
// Creamos el puerto donde se va a estar ejecutando nuestro servidor
const port = process.env.PORT || 3000;
// Iniciamos el servidor en el puerto que definimos
export const server = app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
// Ultimo middleware de la cadena, se ejecuta si hay un error en algún error y lo manejo con "next" y no con errorHandler
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal server error MW";
  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  });
});
// Exportamos la app (o el servidor) para poder importarlo en otros archivos
export default app;
