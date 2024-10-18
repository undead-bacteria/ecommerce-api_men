import mongoose from "mongoose";
import { defaultBrandImagePath } from "../app/secret.js"

const brandSchema = mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: true,
    unique: [true, "Brand name already exist."],
    minLength: [3, "Brand name must be at least 3 characters"],
    minLength: [50, "Brand name is too large"],
  },

  slug: {
    type: String,
    trim: true,
    required: [true, "Slug is required"],
    unique: [true, "Slug must be unique"],
    lowercase: true,
  },

  image: {
    type: String,
    default: defaultBrandImagePath,
  },

  description: {
    type: String,
    trim: true,
    required: [true, "Brand description is required."]
  },

  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "Creator id is required."]
  },

  status: {
    type: String,
    default: "active",
    enum: {
      values: ["active", "inactive"],
      message: "{VALUE} is invalid for brand status"
    }
  }
}, { timestamp: true })


brandSchema.pre("validate", function (next) {
  this.slug = this.name.split(" ").join("-").toLowerCase().trim();
  next();
});

export default mongoose.model("Brand", brandSchema);