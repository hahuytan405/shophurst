const Product = require('../models/product');
const Order = require('../models/order');
const Slide = require('../models/slide');
const path = require('path');
const fs = require('fs');
const { validationResult } = require('express-validator');
const size = require('window-size');

const ITEMS_PER_PAGE =
  size.win().width < 768 ? 3 : size.win().width < 992 ? 6 : 9;

const mongoose = require('mongoose');
const { google } = require('googleapis');
const { slides } = require('googleapis/build/src/apis/slides');
const KEYFILEPATH = path.join(__dirname, 'ServiceAcccoutCred.json');
const SCOPES = ['https://www.googleapis.com/auth/drive'];
const auth = new google.auth.GoogleAuth({
  keyFile: KEYFILEPATH,
  scopes: SCOPES,
});
const drive = google.drive({ version: 'v3', auth });

exports.getProducts = (req, res, next) => {
  const page = +req.query.page || 1;
  let totalItems;

  Product.find()
    .countDocuments()
    .then(numProducts => {
      totalItems = numProducts;
      return Product.find()
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE);
    })
    .then(products => {
      res.render('admin/products', {
        pageTitle: 'Products',
        path: '/products',
        prods: products,
        currentPage: page,
        itemPerPage: ITEMS_PER_PAGE,
        totalProducts: totalItems,
        hasNextPage: ITEMS_PER_PAGE * page < totalItems,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
        lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
      });
    })
    .catch(err => {
      console.log(err);
    });
};

exports.getAddProduct = (req, res, next) => {
  res.render('admin/edit-product', {
    pageTitle: 'Add Product',
    path: '/add-products',
    editing: false,
    hasError: false,
    errorMessage: null,
    validationErrors: [],
  });
};

exports.postAddProduct = async (req, res, next) => {
  const title = req.body.title;
  const images = req.files;
  const price = req.body.price;
  const amount = req.body.amount;
  const description = req.body.description;
  const information = req.body.infomation;
  const status = req.body.status;
  const type = req.body.type;
  const color = req.body.color;
  const priceSale = req.body.priceSale;

  if (images.length == 0) {
    return res.status(422).render('admin/edit-product', {
      pageTitle: 'Add Product',
      path: '/admin/add-product',
      editing: false,
      hasError: true,
      product: {
        title: title,
        price: price,
        amount: amount,
        description: description,
      },
      errorMessage: 'Attached file is not an image.',
      validationErrors: [],
    });
  }
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    console.log(errors.array());
    return res.status(422).render('admin/edit-product', {
      pageTitle: 'Add Product',
      path: '/admin/add-product',
      editing: false,
      hasError: true,
      product: {
        title: title,
        price: price,
        amount: amount,
        description: description,
      },
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array(),
    });
  }

  let imageUrls = [];

  for (const image of images) {
    await drive.files
      .create({
        resource: {
          name: image.filename,
          parents: ['1uMCWXVe1RyoRRf0NxgtVqpLIzqkLwKcR'],
        },
        media: {
          mimeType: image.mimetype,
          body: fs.createReadStream(image.path),
        },
        fields: 'id',
      })
      .then(result => {
        imageUrls.push(result.data.id);
      });
  }
  const product = new Product({
    title: title,
    imageUrls: imageUrls,
    price: price,
    amount: amount,
    quantitySold: 0,
    description: description,
    information: information,
    type: type,
    status: status,
    color: color,
    priceSale: priceSale,
  });
  product
    .save()
    .then(result => {
      // console.log(result);
      console.log('Created Product');
      res.redirect('/admin/products');
    })
    .catch(err => {
      console.log(err);
    });
};

exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect('/');
  }
  const prodId = req.params.productId;
  Product.findById(prodId)
    .then(product => {
      if (!product) {
        return res.redirect('/');
      }
      res.render('admin/edit-product', {
        pageTitle: 'Edit Product',
        path: '/admin/edit-product',
        editing: editMode,
        product: product,
        hasError: false,
        errorMessage: null,
        validationErrors: [],
      });
    })
    .catch(err => {
      console.log(err);
    });
};

exports.postEditProduct = (req, res, next) => {
  const prodId = req.body.productId;
  const updatedTitle = req.body.title;
  const updatedPrice = req.body.price;
  const updatedAmount = req.body.amount;
  const images = req.files;
  const updatedDesc = req.body.description;
  const updatedInformation = req.body.information;
  const updatedStatus = req.body.status;
  const updatedType = req.body.type;
  const updatedColor = req.body.color;
  const updatedPriceSale = req.body.priceSale;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    console.log(errors.array());
    return res.status(422).render('admin/edit-product', {
      pageTitle: 'Edit Product',
      editing: false,
      hasError: true,
      product: {
        title: title,
        price: price,
        amount: amount,
        description: description,
      },
      errorMessage: errors.array()[0].msg,
      validationErrors: [],
    });
  }

  Product.findById(prodId)
    .then(async product => {
      // if (product.userId.toString() !== req.user._id.toString()) {
      //   console.log();
      //   return res.redirect('/');
      // }
      let imageUrls = [];
      product.title = updatedTitle;
      product.price = updatedPrice;
      product.amount = updatedAmount;
      product.description = updatedDesc;
      product.information = updatedInformation;
      product.status = updatedStatus;
      product.type = updatedType;
      product.color = updatedColor;
      product.priceSale = updatedPriceSale;

      if (images.length !== 0) {
        for (const imageUrl of product.imageUrls) {
          drive.files.delete({
            fileId: imageUrl,
          });
        }

        for (const image of images) {
          const filemetadata = {
            name: image.filename,
            parents: ['1uMCWXVe1RyoRRf0NxgtVqpLIzqkLwKcR'],
          };
          const media = {
            mimeType: image.mimetype,
            body: fs.createReadStream(image.path),
          };
          await drive.files
            .create({
              resource: filemetadata,
              media: media,
              fields: 'id',
            })
            .then(result => {
              imageUrls.push(result.data.id);
            });
        }
        product.imageUrls = imageUrls;
        product
          .save()
          .then(result => {
            // console.log(result);
            console.log('UPDATED Product');
            res.redirect('/admin/products');
          })
          .catch(err => {
            console.log(err);
          });
      } else {
        return product.save().then(result => {
          console.log('UPDATED PRODUCT!');
          res.redirect('/admin/products');
        });
      }
    })
    .catch(err => {
      console.log(err);
    });
};

exports.deleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findById(prodId)
    .then(product => {
      if (!product) {
        return next(new Error('Product not found'));
      }
      for (const imageUrl of product.imageUrls) {
        if (imageUrl) {
          drive.files.delete({
            fileId: imageUrl,
          });
        }
      }
      return Product.deleteOne({ _id: prodId });
    })
    .then(() => {
      console.log('DESTROYED PRODUCT');
      res.redirect('/admin/products');
    })
    .catch(err => {
      console.log(err);
    });
};

exports.getOrderAdmin = (req, res, next) => {
  Order.find().then(order => {
    res.render('admin/order-admin', {
      orders: order,
      pageTitle: 'Order Admin',
    });
  });
};

exports.postOrderAdmin = (req, res, next) => {
  orderId = req.body.orderId;
  statusOrder = req.body.setStatusOrder;
  Order.findById(orderId).then(order => {
    order.status = statusOrder;
    order.save().then(() => {
      console.log('update order status');
      res.redirect('/admin/order-admin');
    });
  });
};

exports.getSlides = (req, res, next) => {
  Slide.findById('657597d6598cc57687228dfc').then(slide => {
    res.render('admin/slides', {
      pageTitle: 'Slides',
      slides: slide,
    });
  });
};

exports.getEditSlide = (req, res, next) => {
  const slideId = req.params.slideId;
  Slide.findById('657597d6598cc57687228dfc').then(slides => {
    if (slideId == 'extra1') {
      slide = slides.extraSlide1;
    } else if (slideId == 'extra2') {
      slide = slides.extraSlide2;
    } else {
      return res.redirect('/admin/slides');
    }
    if (!slide) {
      return res.redirect('/admin/slides');
    }
    res.render('admin/edit-slide', {
      pageTitle: 'Edit Slide',
      slide: slide,
      hasError: false,
      slideMode: slideId,
      errorMessage: null,
      validationErrors: [],
    });
  });
};

exports.getEditLayer = (req, res, next) => {
  const editMode = req.query.edit;
  const slideMode = req.query.slide;
  const layerId = req.params.layerId;
  if (!editMode) {
    return res.redirect('/admin/slides');
  }
  Slide.findById('657597d6598cc57687228dfc').then(slides => {
    if (slideMode == 'main') {
      layer = slides.mainSlide.find(s => {
        return s._id.toString() == layerId;
      });
    } else if (slideMode == 'mid') {
      layer = slides.midSlide.find(s => {
        return s._id.toString() == layerId;
      });
    } else {
      return res.redirect('/admin/slides');
    }
    if (!layer) {
      return res.redirect('/admin/slides');
    }
    res.render('admin/edit-layer', {
      pageTitle: 'Edit Layer',
      editing: editMode,
      layer: layer,
      hasError: false,
      errorMessage: null,
      validationErrors: [],
      slideMode: slideMode,
    });
  });
};

exports.postEditSlide = (req, res, next) => {
  const slideMode = req.body.slideMode;
  const updatedTitle1 = req.body.title1;
  const updatedText = req.body.text;
  const updatedLinkProduct = req.body.linkProduct;
  const image = req.files;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    console.log(errors.array());
    return res.status(422).render(`admin/edit-slide/${slideMode}`, {
      pageTitle: 'Add Slide',
      editing: false,
      hasError: true,
      slide: {
        title1: title1,
        text: text,
        linkProduct: linkProduct,
      },
      errorMessage: errors.array()[0].msg,
      validationErrors: [],
    });
  }

  Slide.findById('657597d6598cc57687228dfc')
    .then(async slides => {
      if (slideMode == 'extra1') {
        slide = slides.extraSlide1;
        slide.title1 = updatedTitle1;
        slide.text = updatedText;
        slide.linkProduct = updatedLinkProduct;
        imageUrl = slide.imageUrl;

        if (image.length !== 0) {
          drive.files.delete({
            fileId: imageUrl,
          });

          await drive.files
            .create({
              resource: {
                name: image[0].filename,
                parents: ['1MgdiENZfbSNQUAE7ofpH22CY-S4Z88Ht'],
              },
              media: {
                mimeType: image[0].mimetype,
                body: fs.createReadStream(image[0].path),
              },
              fields: 'id',
            })
            .then(result => {
              imageUrl = result.data.id;
            });
          slide.imageUrl = imageUrl;
          slides
            .save()
            .then(result => {
              console.log('UPDATED Slide !');
              res.redirect('/admin/slides');
            })
            .catch(err => {
              console.log(err);
            });
        } else {
          return slides.save().then(result => {
            console.log('UPDATED Slide !');
            res.redirect('/admin/slides');
          });
        }
      } else if (slideMode == 'extra2') {
        slide = slides.extraSlide2;
        slide.title1 = updatedTitle1;
        slide.text = updatedText;
        slide.linkProduct = updatedLinkProduct;
        imageUrl = slide.imageUrl;

        if (image.length !== 0) {
          drive.files.delete({
            fileId: imageUrl,
          });

          await drive.files
            .create({
              resource: {
                name: image[0].filename,
                parents: ['1MgdiENZfbSNQUAE7ofpH22CY-S4Z88Ht'],
              },
              media: {
                mimeType: image[0].mimetype,
                body: fs.createReadStream(image[0].path),
              },
              fields: 'id',
            })
            .then(result => {
              imageUrl = result.data.id;
            });
          slide.imageUrl = imageUrl;
          slides
            .save()
            .then(result => {
              console.log('UPDATED Slide !');
              res.redirect('/admin/slides');
            })
            .catch(err => {
              console.log(err);
            });
        } else {
          return slides.save().then(result => {
            console.log('UPDATED Slide !');
            res.redirect('/admin/slides');
          });
        }
      } else {
        res.redirect('/admin/slides');
      }
    })
    .catch(err => {
      console.log(err);
    });
};

exports.getAddLayer = (req, res, next) => {
  const slideMode = req.query.slide;
  res.render('admin/edit-layer', {
    pageTitle: 'Add layer',
    path: '/add-layer',
    editing: false,
    hasError: false,
    errorMessage: null,
    validationErrors: [],
    slideMode: slideMode,
  });
};

exports.postAddLayer = (req, res, next) => {
  const title1 = req.body.title1;
  const title2 = req.body.title2;
  const title3 = req.body.title3;
  const linkProduct = req.body.linkProduct;
  const image = req.files;
  const slideMode = req.body.slideMode;
  if (image.length == 0) {
    return res.status(422).render(`admin/edit-layer`, {
      pageTitle: 'Add Layer',
      slideMode: slideMode,
      editing: false,
      hasError: true,
      layer: {
        title1: title1,
        title2: title2,
        title3: title3,
        linkProduct: linkProduct,
      },
      errorMessage: 'Attached file is not an image.',
      validationErrors: [],
    });
  }
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    console.log(errors.array());
    return res.status(422).render(`admin/edit-layer`, {
      pageTitle: 'Add Layer',
      slideMode: slideMode,
      editing: false,
      hasError: true,
      layer: {
        title1: title1,
        title2: title2,
        title3: title3,
        linkProduct: linkProduct,
      },
      errorMessage: errors.array()[0].msg,
      validationErrors: [],
    });
  }

  drive.files
    .create({
      resource: {
        name: image[0].filename,
        parents: ['1MgdiENZfbSNQUAE7ofpH22CY-S4Z88Ht'],
      },
      media: {
        mimeType: image[0].mimetype,
        body: fs.createReadStream(image[0].path),
      },
      fields: 'id',
    })
    .then(result => {
      imageUrl = result.data.id;
      if (slideMode == 'main') {
        Slide.findById('657597d6598cc57687228dfc').then(slide => {
          slide.mainSlide.push({
            title1: title1,
            title2: title2,
            title3: title3,
            linkProduct: linkProduct,
            imageUrl: imageUrl,
          });
          slide.save().then(result => {
            console.log('Add Slide');
            res.redirect('/admin/slides');
          });
        });
      } else if (slideMode == 'mid') {
        Slide.findById('657597d6598cc57687228dfc').then(slide => {
          slide.midSlide.push({
            title1: title1,
            title2: title2,
            title3: title3,
            linkProduct: linkProduct,
            imageUrl: imageUrl,
          });
          slide.save().then(result => {
            console.log('Add Slide');
            res.redirect('/admin/slides');
          });
        });
      } else {
        res.redirect('/admin/slides');
      }
    })
    .catch(err => {
      console.log(err);
    });
};

exports.postEditLayer = (req, res, next) => {
  const slideMode = req.body.slideMode;
  const layerId = req.body.layerId;
  const updatedTitle1 = req.body.title1;
  const updatedTitle2 = req.body.title2;
  const updatedTitle3 = req.body.title3;
  const updatedLinkProduct = req.body.linkProduct;
  const image = req.files;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    console.log(errors.array());
    return res.status(422).render(`admin/edit-layer`, {
      pageTitle: 'Add Layer',
      slideMode: slideMode,
      editing: false,
      hasError: true,
      layer: {
        title1: title1,
        title2: title2,
        title3: title3,
        linkProduct: linkProduct,
      },
      errorMessage: errors.array()[0].msg,
      validationErrors: [],
    });
  }

  Slide.findById('657597d6598cc57687228dfc')
    .then(async slides => {
      if (slideMode == 'main') {
        layer = slides.midSlide.find(s => {
          return s._id.toString() == layerId;
        });
        layer.title1 = updatedTitle1;
        layer.title2 = updatedTitle2;
        layer.title3 = updatedTitle3;
        layer.linkProduct = updatedLinkProduct;
        imageUrl = layer.imageUrl;

        if (image.length !== 0) {
          drive.files.delete({
            fileId: imageUrl,
          });

          await drive.files
            .create({
              resource: {
                name: image[0].filename,
                parents: ['1MgdiENZfbSNQUAE7ofpH22CY-S4Z88Ht'],
              },
              media: {
                mimeType: image[0].mimetype,
                body: fs.createReadStream(image[0].path),
              },
              fields: 'id',
            })
            .then(result => {
              imageUrl = result.data.id;
            });
          layer.imageUrl = imageUrl;
          slides
            .save()
            .then(result => {
              console.log('UPDATED Slide !');
              res.redirect('/admin/slides');
            })
            .catch(err => {
              console.log(err);
            });
        } else {
          return slides.save().then(result => {
            console.log('UPDATED Slide !');
            res.redirect('/admin/slides');
          });
        }
      } else if (slideMode == 'mid') {
        layer = slides.midSlide.find(s => {
          return s._id.toString() == layerId;
        });
        layer.title1 = updatedTitle1;
        layer.title2 = updatedTitle2;
        layer.title3 = updatedTitle3;
        layer.linkProduct = updatedLinkProduct;
        imageUrl = layer.imageUrl;

        if (image.length !== 0) {
          drive.files.delete({
            fileId: imageUrl,
          });

          await drive.files
            .create({
              resource: {
                name: image[0].filename,
                parents: ['1MgdiENZfbSNQUAE7ofpH22CY-S4Z88Ht'],
              },
              media: {
                mimeType: image[0].mimetype,
                body: fs.createReadStream(image[0].path),
              },
              fields: 'id',
            })
            .then(result => {
              imageUrl = result.data.id;
            });
          layer.imageUrl = imageUrl;
          slides
            .save()
            .then(result => {
              console.log('UPDATED Slide !');
              res.redirect('/admin/slides');
            })
            .catch(err => {
              console.log(err);
            });
        } else {
          return slides.save().then(result => {
            console.log('UPDATED Slide !');
            res.redirect('/admin/slides');
          });
        }
      } else {
        res.redirect('/admin/slides');
      }
    })
    .catch(err => {
      console.log(err);
    });
};

exports.deleteLayer = (req, res, next) => {
  const layerId = req.body.slideId;
  const slideMode = req.query.slide;
  if (slideMode == 'main') {
    Slide.findById('657597d6598cc57687228dfc').then(slides => {
      layer = slides.mainSlide.find(s => {
        return s._id.toString() == layerId;
      });
      if (!layer) {
        return next(new Error('Layer not found'));
      }
      drive.files.delete({
        fileId: layer.imageUrl,
      });
      const updatedLayers = slides.mainSlide.filter(item => {
        return item._id.toString() !== layerId;
      });
      slides.mainSlide = updatedLayers;
      slides.save().then(() => {
        console.log('DELETED Slide !');
        res.redirect('/admin/slides');
      });
    });
  } else if (slideMode == 'mid') {
    Slide.findById('657597d6598cc57687228dfc').then(slides => {
      layer = slides.midSlide.find(s => {
        return s._id.toString() == layerId;
      });
      if (!layer) {
        return next(new Error('Layer not found'));
      }
      drive.files.delete({
        fileId: layer.imageUrl,
      });
      const updatedLayers = slides.midSlide.filter(item => {
        return item._id.toString() !== layerId;
      });
      slides.midSlide = updatedLayers;
      slides.save().then(() => {
        console.log('DELETED Slide !');
        res.redirect('/admin/slides');
      });
    });
  } else {
    res.redirect('/admin/slides');
  }
};
