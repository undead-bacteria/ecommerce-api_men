import mongoose from "mongoose";

const cartSchema = mongoose.Schema({
  cartId: {
    type: String,
    required: true,
    unique: true,
  },

  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  billingAddress: {
    address: {
      country: {
        type: String,
        required: true,
      },

      city: {
        type: String,
        required: true,
      },

      postalCode: {
        type: String,
        required: true,
      },
    },

    contact: {
      email: {
        country: {
          type: String,
          required: true,
        },

        phone: {
          type: String,
          required: true,
        },
      },
    }
  },

  totals: {
    quantity: {
      type: Number,
      required: true,
    },

    discount: {
      type: Number,
      required: true,
      default: 0,
    },

    subtotal: {
      type: Number,
      required: true,
    },

    total: {
      type: Number,
      required: true,
    },
  },

  currency: {
    type: String,
    required: true,
  },

  status: {
    type: String,
    required: true,
    enum: {
      values: ["completed", "pending", "cancelled"],
      message: "{VALUE} is invalid for status"
    }
  }
}, { timestamp: true })


export default mongoose.model("Cart", cartSchema);