import mongoose from "mongoose";

const productSchema = mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: true,
    minLength: [3, "Product name must be at least 3 characters"],
    minLength: [50, "Product name is too large"],
  },
  
  title: {
    type: String,
    trim: true,
    required: true,
    minLength: [3, "Title must be at least 3 characters"],
    minLength: [50, "Title is too large"],
  }, 

  slug: {
    type: String,
    trim: true,
    required: [true, "Slug is required"],
    unique: [true, "Slug must be unique"],
  },

  brand: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Brand",
    required: [true, "Brand id is required"],
  },

  description: {
    short: {
      type: String,
      trim: true,
      required: [true, "Short description is required"],
    },
    
    long: {
      type: String,
      trim: true,
      required: [true, "Long description is required"],
    }
  },

  price: {
    regular: {
      type: Number,
      required: [true, "Regular price is required"],
      validate: {
        validator: (value) => value > 0,
        message: (props) => 
          `${props.value} is not a valid price! Price must be greater than 0`,
      }
    },

    sale: {
      type: Number,
      validate: {
        validator: (value) => value > 0,
        message: (props) => 
          `${props.value} is not a valid price! Price must be greater than 0`,
      }
    }
  },

  qunatity: {
    type: Number,
    required: [true, "Quantity is required"],
    validate: {
      validator: (value) => value > 0,
      message: (props) => 
        `${props.value} is not a valid quantity! Quantity must be greater than 0`,
    }
  },

  sold: {
    type: Number,
    default: 0,
  },

  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "Creator id is required."]
  },

  shipping: {
    type: {
      type: String,
      enum: ["free", "paid"],
      default: "free",
    },

    fee: {
      type: Number,
      default: 0,
    }
  },

  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
  },

  tags: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Tag",
  },

  rating: {
    type: Number,
    default: 0,
  },

  images: [
    {
      type: String,
      trim: true,
    },
  ],

  status: {
    type: String, 
    enum: ["active, inactive"],
    default: "active",
  }
}, { timestamps: true })


productSchema.pre("validate", function (next) {
  this.slug = this.name.split(" ").join("-").toLowerCase().trim()
  next()
})

export default mongoose.model("Product", productSchema)