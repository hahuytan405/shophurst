const path = require('path');
const User = require('../models/user');
const Order = require('../models/order');
const Product = require('../models/product');

exports.getCart = (req, res, next) => {
  req.user
    .populate('cart.items.productId')
    .then(user => {
      const products = user.cart.items;
      res.render('user/cart', {
        pageTitle: 'Your Cart',
        products: products,
      });
    })
    .catch(err => {
      console.log(err);
    });
};

exports.postAddCart = (req, res, next) => {
  const prodId = req.body.prodId;
  const qty = req.body.qty;

  Product.findById(prodId)
    .then(product => {
      if (!product) {
        return next(new Error('Product not found'));
      }
      return req.user.addToCart(product, qty);
    })
    .then(result => {
      req.user.populate('cart.items.productId').then(user => {
        const product = user.cart.items.find(item => {
          if (item.productId._id.toString() === prodId) {
            return item;
          }
        });
        const qtyP = product.quantity;
        const imageUrlP = product.productId.imageUrls[0];
        const priceP = product.productId.price;
        const titleP = product.productId.title;
        const totalCartProducts = res.locals.cartProducts.totalProducts;
        const totalCartPrice = res.locals.cartProducts.totalPrice;
        const csrfToken = res.locals.csrfToken;
        console.log('Added product to cart');
        res.status(200).json({
          message: 'Success',
          qtyP: qtyP,
          titleP: titleP,
          imageUrlP: imageUrlP,
          priceP: priceP,
          totalCartProducts: totalCartProducts,
          totalCartPrice: totalCartPrice,
          csrfToken: csrfToken,
        });
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.replaceAddCart = (req, res, next) => {
  const prodId = req.body.prodId;
  const qty = req.body.qty;

  Product.findById(prodId)
    .then(product => {
      if (!product) {
        return next(new Error('Product not found'));
      }
      req.user.replaceToCart(product, qty).then(result => {
        console.log('Added product to cart');
        res.status(200).json({ message: 'Success' });
      });
    })
    .catch(err => {
      console.log(err);
      // const error = new Error(err);
      // error.httpStatusCode = 500;
      // return next(error);
    });
};

exports.postDeleteProductCart = (req, res, next) => {
  const prodId = req.params.productId;
  req.user
    .removeFromCart(prodId)
    .then(result => {
      // res.redirect('/cart');
      console.log('Delete Product successfully');
      res.status(200).json({ message: 'Successfully deleted! ' });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postDeleteMultiProductCart = (req, res, next) => {
  const prodIds = req.body.prodIds;
  req.user
    .removeMultiFromCart(prodIds)
    .then(result => {
      // res.redirect('/cart');
      console.log('Delete Product successfully');
      res.status(200).json({ message: 'Successfully deleted multi! ' });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postCartToCheckout = (req, res, next) => {
  if (req.user.isCheckout) {
    res.status(200).json({
      message: 'Check out already exists',
    });
  } else {
    let total = 0;
    req.user.isCheckout = true;
    const prodIds = req.body.prodIds;
    req.user
      .populate('cart.items.productId')
      .then(user => {
        const CheckedProducts = user.cart.items.filter(item => {
          return prodIds.includes(item.productId._id.toString());
        });
        const products = CheckedProducts.map(i => {
          return { quantity: i.quantity, product: { ...i.productId._doc } };
        });
        products.forEach(p => {
          total += p.quantity * p.product.price;
        });
        const order = new Order({
          totalPrice: total,
          user: {
            email: req.user.email,
            userId: req.user,
          },
          products: products,
          checkoutComplete: false,
          status: 'confirming',
        });
        order.save();
        return user;
      })
      .then(user => {
        user
          .depopulate('cart.items.productId')
          .removeMultiFromCart(prodIds)
          .then(() => {
            res.status(200).json({ message: 'Successfully deleted multi! ' });
          });
      })
      .catch(err => {
        console.log(err);
      });
  }
};

exports.getCheckOut = (req, res, next) => {
  let total = 0;
  User.findById(req.session.user._id).then(user => {
    if (!user) {
      return res.redirect('/');
    }
    Order.find({ 'user.userId': req.user._id, checkoutComplete: false }).then(
      orders => {
        if (orders.length < 1) {
          res.render('user/checkout', {
            pageTitle: 'Checkout',
            order: false,
            user: user,
            total: total,
          });
        } else {
          res.render('user/checkout', {
            pageTitle: 'Checkout',
            order: orders[0],
            user: user,
          });
        }
      }
    );
  });
};

exports.postDeleteCheckout = (req, res, next) => {
  const orderId = req.params.orderId;
  Order.findByIdAndRemove(orderId).then(() => {
    req.user.isCheckout = false;
    req.user.save();
    console.log('destroy order');
    res.redirect('/checkout');
  });
};

exports.postCheckout = (req, res, next) => {
  const orderId = req.body.orderId;
  const name = req.body.name;
  const phone = req.body.phone;
  const contry = req.body.contry;
  const state = req.body.state;
  const city = req.body.city;
  const address = req.body.address;
  const coupon = req.body.coupon;

  Order.findById(orderId).then(order => {
    order.user.name = name;
    order.user.phone = phone;
    order.user.contry = contry;
    order.user.state = state;
    order.user.city = city;
    order.user.address = address;
    order.user.coupon = coupon;
    order.checkoutComplete = true;
    order.status = 'confirming';
    order.products.forEach(p => {
      Product.findById(p.product._id).then(i => {
        i.amount = i.amount - p.quantity;
        i.quantitySold = i.quantitySold + p.quantity;
        i.save();
      });
    });
    return order
      .save()
      .then(() => {
        req.user.isCheckout = false;
        req.user.save();
      })
      .then(() => {
        console.log('post order');
        res.redirect('/order-complete');
      })
      .catch(err => {
        console.log(err);
      });
  });
};

exports.getOrderComplete = (req, res, next) => {
  Order.find({ 'user.userId': req.user._id, checkoutComplete: true }).then(
    orders => {
      res.render('user/order-complete', {
        pageTitle: 'Order',
        orders: orders,
      });
    }
  );
};

exports.getWishList = (req, res, next) => {
  req.user
    .populate('wishlist.items.productId')
    .then(user => {
      const products = user.wishlist.items;
      res.render('user/wishlist', {
        pageTitle: 'Your Wishlist',
        products: products,
      });
    })
    .catch(err => {
      console.log(err);
    });
};

exports.addWishList = (req, res, next) => {
  const prodId = req.params.productId;
  if (
    req.user.wishlist.items.some(item => {
      return item.productId.toString() === prodId.toString();
    })
  ) {
    return res
      .status(200)
      .json({ message: 'The product is already on the wishlish' });
  }
  req.user.wishlist.items.push({
    productId: prodId,
  });
  req.user
    .save()
    .then(() => {
      res.status(200).json({ message: 'Successfully add wishlist' });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.addMultiWishList = (req, res, next) => {
  const prodIds = req.body.prodIds;
  for (const prodId of prodIds) {
    if (
      !req.user.wishlist.items.some(
        item => item.productId.toString() === prodId
      )
    ) {
      req.user.wishlist.items.push({ productId: prodId });
    } else {
      return res
        .status(200)
        .json({ message: 'The product is already on the wishlish' });
    }
  }
  req.user
    .save()
    .then(() => {
      res.status(200).json({ message: 'Successfully add wishlist multi ' });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postDeleteProductWishlist = (req, res, next) => {
  const prodId = req.params.productId;
  req.user
    .removeFromWishlist(prodId)
    .then(result => {
      // res.redirect('/cart');
      console.log('Delete Product from Wishlist successfully');
      res.status(200).json({ message: 'Successfully deleted! ' });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getMyAccount = (req, res, next) => {
  User.findById(req.session.user._id).then(user => {
    if (!user) {
      return res.redirect('/');
    }
    res.render('user/my-account', {
      pageTitle: 'MyAccount',
      user: user,
    });
  });
};

exports.postMyAccount = (req, res, next) => {
  const name = req.body.name;
  const phone = req.body.phone;
  const contry = req.body.contry;
  const state = req.body.state;
  const city = req.body.city;
  const address = req.body.address;

  User.findById(req.session.user._id).then(user => {
    user.name = name;
    user.phone = phone;
    user.contry = contry;
    user.state = state;
    user.city = city;
    user.address = address;
    return user.save().then(() => {
      req.user.isCheckout = flase;
      req.user
        .save()
        .then(() => {
          console.log('UPDATED USER');
          res.redirect('/my-account');
        })
        .catch(err => {
          console.log(err);
        });
    });
  });
};
