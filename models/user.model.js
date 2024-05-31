import mongoose from "mongoose";
//Aca defino el modelo de mis usuarios. 
const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      
      required: true,
    },
  },
  { timestamps: true , strict: "throw", }
);

const User = mongoose.model("User", userSchema);
export default User;
