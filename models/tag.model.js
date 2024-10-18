import mongoose from "mongoose";

const tagSchema = mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: [true, "Tag name is required."],
    unique: [true, "Tag name already exist."],
    minLength: [3, "Tag name must be at least 3 characters"],
    minLength: [50, "Tag name is too large"],
  },

  slug: {
    type: String,
    trim: true,
    required: [true, "Slug is required"],
    unique: [true, "Slug must be unique"],
    lowercase: true,
  },

  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "Creator id is required."]
  },

  status: {
    type: Boolean,
    default: true,
  }
}, { timestamp: true })


tagSchema.pre("validate", function (next) {
  this.slug = this.name.split(" ").join("-").toLowerCase().trim();
  next();
});

export default mongoose.model("Tag", tagSchema);