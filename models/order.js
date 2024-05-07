const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const orderSchema = new Schema(
  {
    totalPrice: {
      type: Number,
    },
    checkoutComplete: {
      type: Boolean,
    },
    status: {
      type: String,
      required: true,
    },
    products: [
      {
        product: { type: Object, required: true },
        quantity: { type: Number, required: true },
      },
    ],
    user: {
      email: {
        type: String,
        required: true,
      },
      name: {
        type: String,
      },
      phone: {
        type: Number,
      },
      contry: {
        type: String,
      },
      state: {
        type: String,
      },
      city: {
        type: String,
      },
      address: {
        type: String,
      },
      coupon: {
        type: String,
      },
      userId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'User',
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
