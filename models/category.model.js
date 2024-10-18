import mongoose from "mongoose";
import { defaultCategoryImagePath } from "../app/secret.js"

const categorySchema = mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: true,
    unique: [true, "Category name already exist."],
    minLength: [3, "Category name must be at least 3 characters"],
    minLength: [50, "Category name is too large"],
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
    trim: true,
    default: defaultCategoryImagePath,
  },

  description: {
    type: String,
    trim: true,
    required: [true, "Category description is required"],
  },

  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
  },

  status: {
    type: Boolean,
    default: true,
  }
}, { timestamp: true })


categorySchema.pre("validate", function (next) {
  this.slug = this.name.split(" ").join("-").toLowerCase().trim();
  next();
});

export default mongoose.model("Category", categorySchema);