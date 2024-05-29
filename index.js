import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
// import path from "path";
dotenv.config();
import authRoutes from "./routes/auth.routes.js";

mongoose
  .connect(process.env.MONGO)
  .then(console.log("Connected to MongoDB"))
  .catch((err) => console.log(err));

// const __dirname = path.resolve();
export const app = express();
app.use(express.json());
app.use(cookieParser());
app.use("/api/auth", authRoutes);
const port = process.env.PORT || 3000;
export const server = app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
// app.use(express.static(path.join(__dirname, "/frontend/dist")));
// app.get("*", (req, res) => {
//   res.sendFile(path.join(__dirname, "frontend", "dist", "index.html"));
// });
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal server error MW";
  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  });
});

export default app;
