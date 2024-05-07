const path = require('path');
const Product = require('../models/product');
const Slide = require('../models/slide');
const size = require('window-size');
const { name } = require('ejs');

const ITEMS_PER_PAGE =
  size.win().width < 768 ? 3 : size.win().width < 992 ? 6 : 9;

exports.getIndex = (req, res, next) => {
  Slide.findById('657597d6598cc57687228dfc').then(slide => {
    Product.find().then(product => {
      res.render('shop/index', {
        pageTitle: 'Hurst',
        path: '/',
        slide: slide,
        products: product,
      });
    });
  });
};

exports.getShop = (req, res, next) => {
  const page = +req.query.page || 1;
  const search = req.query.search || '';
  let sort = req.query.sort || 'name';
  let type = req.query.type || 'All';
  let color = req.query.color || 'All';
  let priceMin = req.query.priceMin || 0;
  let priceMax = req.query.priceMax || 1000;

  const typeOptions = [
    'sofa',
    'table',
    'chair',
    'bed',
    'cabinetsAndShelves',
    'accessories',
    'outdoor',
  ];

  const colorOptions = [
    'lightSalmon',
    'darkSalmon',
    'tomato',
    'deepSkyBlue',
    'atlantis',
    'deepLilac',
  ];

  type === 'All'
    ? (type = [...typeOptions])
    : (type = req.query.type.split(','));

  color === 'All'
    ? (color = [...colorOptions])
    : (color = req.query.color.split(','));

  req.query.sort ? (sort = req.query.sort.split(',')) : (sort = [sort]);
  let sortBy = {};
  if (sort[1]) {
    sortBy[sort[0]] = sort[1];
  } else {
    sortBy[sort[0]] = 'asc';
  }
  let totalItems;

  req.session.redirect = req.originalUrl;
  Product.find({
    title: { $regex: search, $options: 'i' },
    type: type,
    color: color,
    price: {
      $gte: priceMin,
      $lte: priceMax,
    },
  })
    // .where('type')
    // .in([...type])
    .countDocuments()
    .then(numProducts => {
      totalItems = numProducts;
      return (
        Product.find({
          title: { $regex: search, $options: 'i' },
          type: type,
          color: color,
          price: {
            $gte: priceMin,
            $lte: priceMax,
          },
        })
          // .where('type')
          // .in([...type])
          .sort(sortBy)
          .skip((page - 1) * ITEMS_PER_PAGE)
          .limit(ITEMS_PER_PAGE)
      );
    })
    .then(products => {
      res.render('shop/shop', {
        pageTitle: 'Shop',
        path: '/shop',
        prods: products,
        currentPage: page,
        itemPerPage: ITEMS_PER_PAGE,
        totalProducts: totalItems,
        hasNextPage: ITEMS_PER_PAGE * page < totalItems,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
        lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
        search: search,
        type: req.query.type,
        priceMin: priceMin,
        priceMax: priceMax,
        color: color,
        sortBy: sort[0],
        typeSort: sort[1],
      });
    })
    .catch(err => {
      console.log(err);
    });
};

exports.getProduct = (req, res, next) => {
  req.session.redirect = req.originalUrl;
  const prodId = req.params.productId;
  Product.findById(prodId)
    .then(product => {
      res.render('shop/product', {
        product: product,
        pageTitle: 'Product',
        path: '/product',
      });
    })
    .catch(err => {
      console.log(err);
    });
};

exports.postProductReview = (req, res, next) => {
  const prodId = req.params.productId;
  const rating = Number(req.body.radioRating);
  const name = req.body.name;
  const subject = req.body.subject;
  const userId = req.user;
  const comment = req.body.comment;
  const review = {
    customerName: name,
    subject: subject,
    comment: comment,
    rating: rating,
    date: new Date(),
    userId: userId,
  };
  Product.findById(prodId)
    .then(product => {
      product.reviews.review.push(review);
      if (!product.reviews.ratingTotal) {
        product.reviews.ratingTotal = 0;
      }
      if (!product.reviews.quantityRating) {
        product.reviews.quantityRating = 0;
      }
      product.reviews.ratingTotal += rating;
      product.reviews.quantityRating += 1;
      product.save();
    })
    .then(() => {
      console.log('post review done');
      res.redirect(`/products/${prodId}`);
    })
    .catch(err => {
      console.log(err);
    });
};

exports.deleteProductReview = (req, res, next) => {
  const reviewId = req.body.reviewId;
  const productId = req.body.productId;
  const reviewRating = req.body.reviewRating;
  const userId = req.body.userId;

  if (userId.toString() !== req.user._id.toString()) {
    return res
      .status(200)
      .json({ message: 'This is not your comment, you cannot delete it' });
  }
  Product.findById(productId)
    .then(product => {
      updatedReview = product.reviews.review.filter(r => {
        return r._id.toString() !== reviewId.toString();
      });
      product.reviews.review = updatedReview;
      product.reviews.ratingTotal -= reviewRating;
      product.reviews.quantityRating -= 1;
      product.save().then(() => {
        console.log('DESTROYED REVIEW');
        res.status(200).json({ message: 'DESTROYED REVIEW' });
      });
    })
    .catch(err => console.log(err));
};

exports.postShopSearch = (req, res, next) => {
  const search = req.body.search || '';
  res.redirect(`/shop/?search=${search}`);
};

exports.postShopFilter = (req, res, next) => {
  if (req.body.color) {
    color = req.body.color.toString();
  } else color = 'All';

  priceMin = req.body.priceMin;
  priceMax = req.body.priceMax;
  type = req.body.typeR;
  sort = req.body.sort;
  typeSort = req.body.typeSort;

  if (type) {
    res.redirect(
      `/shop/?type=${type}&color=${color}&priceMin=${priceMin}&priceMax=${priceMax}&sort=${sort},${typeSort}`
    );
  } else {
    res.redirect(
      `/shop/?color=${color}&priceMin=${priceMin}&priceMax=${priceMax}&sort=${sort},${typeSort}`
    );
  }
};
