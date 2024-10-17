import mongoose from "mongoose";
import { defaultUserImagePath } from "../app/secret.js";
import { isEmail } from "../helper/helper.js";
import hashPassword from "../utils/hashPassword.mjs";

const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please provide your name"],
    trim: true,
    maxLength: [50, "Name cannot be more than 50 characters"],
    minLength: [8, "Name must be at least 8 characters"],
  }, 

  email: {
    type: String,
    required: [true, "Please provide your email"],
    trim: true,
    unique: [true, "Email already exists."],
    lowercase: true,
    validate: {
      validator: (value) => {
        return isEmail(value)
      },
      message: "Please enter a valid email"
    },
  },

  phone: {
    type: String,
    trim: true, 
  },

  password: {
    type: String,
    required: true, 
    minLength: [8, "Password must be at least 8 characters"],
    select: false,
    set: (value) => {
      return hashPassword(value)
    }
  }, 

  wishList: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    },
  ],
  
  gender: {
    type: String,
    lowercase: true,
    enum: {
      values: ["male", "female"],
      message: "{VALUE} is invalid for gender",
    },
    required: [true, "Please provide your gender"],
  },
  
  isBanned: {
    type: Boolean,
    default: false,
  },
  
  address: {
    type: String,
  }, 
  
  role: {
    type: String,
    enum: ["user", "admin", "seller"],
    default: "user",
    lowercase: true,
  }, 
  
  active: {
    type: Boolean,
    default: true,
  },
  
  photo: {
    type: String,
    default: defaultUserImagePath,
  },
}, { timestamps: true })

export default mongoose.model("User", userSchema)