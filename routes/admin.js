const path = require('path');

const express = require('express');
const { body } = require('express-validator');

const adminController = require('../controllers/admin');

const adminAuth = require('../middleware/admin-auth');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

router.get('/products', isAuth, adminAuth, adminController.getProducts);

router.get('/add-product', isAuth, adminAuth, adminController.getAddProduct);

router.post(
  '/add-product',
  [
    body('title').isString().isLength({ min: 3 }).trim(),
    body('price').isFloat(),
    body('description').isString().isLength({ min: 5, max: 400 }).trim(),
  ],
  isAuth,
  adminAuth,
  adminController.postAddProduct
);

router.get(
  '/edit-product/:productId',
  adminAuth,
  adminController.getEditProduct
);

router.post(
  '/edit-product',
  [
    body('title').isString().isLength({ min: 3 }).trim(),
    body('price').isFloat(),
    body('description').isString().isLength({ min: 5, max: 400 }).trim(),
  ],
  isAuth,
  adminAuth,
  adminController.postEditProduct
);

router.post(
  '/delete-product',
  isAuth,
  adminAuth,
  adminController.deleteProduct
);

router.get('/order-admin', adminAuth, adminController.getOrderAdmin);

router.post('/order-admin/:orderId', adminAuth, adminController.postOrderAdmin);

router.get('/slides', adminAuth, adminController.getSlides);

router.get('/edit-slide/:slideId', adminAuth, adminController.getEditSlide);

router.post(
  '/edit-slide',
  [
    body('title1').isString().isLength({ min: 5, max: 50 }).trim(),
    body('text').isString().isLength({ min: 5, max: 50 }).trim(),
  ],
  isAuth,
  adminAuth,
  adminController.postEditSlide
);

router.get('/add-layer', isAuth, adminAuth, adminController.getAddLayer);

router.post(
  '/add-layer',
  [
    body('title1').isString().isLength({ max: 50 }).trim(),
    body('title2').isString().isLength({ max: 50 }).trim(),
    body('title3').isString().isLength({ max: 400 }).trim(),
  ],
  isAuth,
  adminAuth,
  adminController.postAddLayer
);

router.get('/edit-layer/:layerId', adminAuth, adminController.getEditLayer);

router.post(
  '/edit-layer',
  [
    body('title1').isString().isLength({ max: 50 }).trim(),
    body('title2').isString().isLength({ max: 50 }).trim(),
    body('title3').isString().isLength({ max: 400 }).trim(),
  ],
  isAuth,
  adminAuth,
  adminController.postEditLayer
);

router.post('/delete-layer', isAuth, adminAuth, adminController.deleteLayer);

module.exports = router;
