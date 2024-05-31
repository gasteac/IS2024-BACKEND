import express from "express";
// Importo los controladores de autenticación
import { signup, signin } from "../controllers/auth.controller.js";
// Creo una instancia de router de express
const router = express.Router();

// Defino mis endpoints. 
router.post("/signup", signup);
router.post("/signin", signin);

export default router;
