const path = require('path');

const express = require('express');

const shopController = require('../controllers/shop');

const router = express.Router();

router.get('/', shopController.getIndex);

router.get('/shop', shopController.getShop);

router.post('/shop/search', shopController.postShopSearch);

router.post('/shop/filter', shopController.postShopFilter);

router.get('/products/:productId', shopController.getProduct);

router.post('/products-review/:productId', shopController.postProductReview);

router.delete('/delete-product-review', shopController.deleteProductReview);

module.exports = router;
