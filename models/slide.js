const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const slideSchema = new Schema({
  mainSlide: [
    {
      title1: { type: String },
      title2: { type: String },
      title3: { type: String },
      linkProduct: { type: String },
      imageUrl: { type: String, required: true },
    },
  ],
  midSlide: [
    {
      title1: { type: String },
      title2: { type: String },
      title3: { type: String },
      linkProduct: { type: String },
      imageUrl: { type: String, required: true },
    },
  ],
  extraSlide1: {
    title1: { type: String, required: true },
    text: { type: String },
    linkProduct: { type: String },
    imageUrl: { type: String, required: true },
  },
  extraSlide2: {
    title1: { type: String, required: true },
    text: { type: String },
    linkProduct: { type: String },
    imageUrl: { type: String, required: true },
  },
});

module.exports = mongoose.model('Slide', slideSchema);
