const path = require('path');
const _ = require('lodash');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const csrf = require('csurf');
const flash = require('connect-flash');
const multer = require('multer');
const helmet = require('helmet');
const compression = require('compression');

const errorController = require('./controllers/error');
const User = require('./models/user');

const MONGODB_URI = `mongodb+srv://max:Tannhim12@cluster0.9tnnpex.mongodb.net/ShopHurst?retryWrites=true&w=majority`;

const app = express();
const store = new MongoDBStore({
  uri: MONGODB_URI,
  collection: 'sessions',
});
const csrfProtection = csrf();

const fileStorage = multer.diskStorage({
  filename: (req, file, cb) => {
    cb(
      null,
      new Date().toDateString() +
        '-' +
        Math.round(Math.random() * 1e9) +
        '-' +
        file.originalname
    );
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === 'image/png' ||
    file.mimetype === 'image/jpg' ||
    file.mimetype === 'image/jpeg'
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

app.set('views', `${__dirname}/views`);
app.set('view engine', 'ejs');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const moreRoutes = require('./routes/more');
const userRoutes = require('./routes/user');
const authRoutes = require('./routes/auth');
const { userInfo } = require('os');

// app.use(
//   helmet({
//     contentSecurityPolicy: false,
//   })
// );
// app.use(compression());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).array('image')
);

app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, 'images')));

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Methods',
    'OPTIONS, GET, POST, PUT, PATCH, DELETE'
  );
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(
  session({
    secret: 'my secret',
    resave: false,
    saveUninitialized: false,
    store: store,
  })
);
app.use(csrfProtection);
app.use(flash());

app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.AdminAuthenticated = req.session.adminLoggedIn;
  res.locals.redirectUrl = req.session.redirect;
  if (!req.session.isLoggedIn) {
    res.locals.cartProducts = null;
  }
  res.locals.csrfToken = req.csrfToken();
  next();
});

app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then(user => {
      if (!user) {
        return next();
      }
      var sumProducts = new Number();
      var sumPrice = new Number();
      req.user = user;
      userCart = _.cloneDeep(user);
      userCart
        .populate('cart.items.productId')
        .then(user => {
          res.locals.cartProducts = _.cloneDeep(user.cart.items);
          cartTemp = _.cloneDeep(user.cart.items);
          return cartTemp;
        })
        .then(cartTemp => {
          cartTemp.forEach(cp => {
            sumProducts += cp.quantity;
            sumPrice += cp.productId.price * cp.quantity;
          });
          res.locals.cartProducts.totalProducts = sumProducts;
          res.locals.cartProducts.totalPrice = sumPrice;

          next();
        });
    })
    .catch(err => {
      next(new Error(err));
    });
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(moreRoutes);
app.use(userRoutes);
app.use(authRoutes);

app.use(errorController.get404);

mongoose
  .connect(MONGODB_URI)
  .then(result => {
    app.listen(3000);
  })
  .catch(err => {
    console.log(err);
  });
