const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
  },
  password: {
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
  isCheckout: {
    type: Boolean,
  },
  resetToken: String,
  resetTokenExpiration: Date,
  cart: {
    items: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        quantity: { type: Number, required: true },
      },
    ],
  },
  wishlist: {
    items: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
      },
    ],
  },
});

userSchema.methods.addToCart = function (product, qty) {
  const cartProductIndex = this.cart.items.findIndex(cp => {
    return cp.productId.toString() === product._id.toString();
  });
  qty = Number(qty);
  let newQuantity = qty;
  const updatedCartItems = [...this.cart.items];

  if (cartProductIndex >= 0) {
    newQuantity = this.cart.items[cartProductIndex].quantity + qty;
    updatedCartItems[cartProductIndex].quantity = newQuantity;
  } else {
    updatedCartItems.push({
      productId: product._id,
      quantity: newQuantity,
    });
  }
  const updatedCart = {
    items: updatedCartItems,
  };
  this.cart = updatedCart;
  return this.save();
};

userSchema.methods.replaceToCart = function (product, qty) {
  const cartProductIndex = this.cart.items.findIndex(cp => {
    return cp.productId.toString() === product._id.toString();
  });
  qty = Number(qty);
  let newQuantity = qty;
  const updatedCartItems = [...this.cart.items];

  if (qty > 0) {
    updatedCartItems[cartProductIndex].quantity = newQuantity;
    const updatedCart = {
      items: updatedCartItems,
    };
    this.cart = updatedCart;
  }
  return this.save();
};

userSchema.methods.removeFromCart = function (productId) {
  const updatedCartItems = this.cart.items.filter(item => {
    return item.productId.toString() !== productId.toString();
  });
  this.cart.items = updatedCartItems;
  return this.save();
};

userSchema.methods.removeMultiFromCart = function (productIds) {
  const updatedCartItems = this.cart.items.filter(item => {
    return !productIds.includes(item.productId.toString());
  });
  this.cart.items = updatedCartItems;
  return this.save();
};

userSchema.methods.clearCart = function () {
  this.cart = { items: [] };
  return this.save();
};

userSchema.methods.removeFromWishlist = function (productId) {
  const updatedWishlishItems = this.wishlist.items.filter(item => {
    return item.productId.toString() !== productId.toString();
  });
  this.wishlist.items = updatedWishlishItems;
  return this.save();
};

module.exports = mongoose.model('User', userSchema);
