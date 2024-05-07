const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const productSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    quantitySold: {
      type: Number,
      required: true,
    },
    priceSale: {
      type: Number,
    },
    description: {
      type: String,
      required: true,
    },
    information: {
      type: String,
    },
    color: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    imageUrls: [
      {
        type: String,
        required: true,
      },
    ],
    reviews: {
      ratingTotal: { type: Number },
      quantityRating: { type: Number },
      review: [
        {
          customerName: { type: String },
          subject: { type: String },
          comment: { type: String, required: true },
          rating: { type: Number },
          date: { type: Date, default: Date.now },
          userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
          },
        },
      ],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);
