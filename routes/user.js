const path = require('path');

const express = require('express');

const userController = require('../controllers/user');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

router.get('/cart', isAuth, userController.getCart);

router.post('/add-cart', isAuth, userController.postAddCart);

router.post('/replace-cart', isAuth, userController.replaceAddCart);

router.delete(
  '/delete-product-cart/:productId',
  isAuth,
  userController.postDeleteProductCart
);

router.delete(
  '/delete-multi-product-cart',
  isAuth,
  userController.postDeleteMultiProductCart
);

router.post('/cart-to-checkout', isAuth, userController.postCartToCheckout);

router.get('/checkout', isAuth, userController.getCheckOut);

router.post(
  '/delete-checkout/:orderId',
  isAuth,
  userController.postDeleteCheckout
);

router.post('/checkout', isAuth, userController.postCheckout);

router.delete(
  '/delete-product-wishlish/:productId',
  isAuth,
  userController.postDeleteProductWishlist
);

router.get('/order-complete', isAuth, userController.getOrderComplete);

router.get('/wishlist', isAuth, userController.getWishList);

router.post('/add-wishlist/:productId', isAuth, userController.addWishList);

router.post(
  '/add-multi-product-wishlist',
  isAuth,
  userController.addMultiWishList
);

router.get('/my-account', isAuth, userController.getMyAccount);

router.post('/my-account', isAuth, userController.postMyAccount);

module.exports = router;
