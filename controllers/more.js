const path = require('path');

exports.getAbout = (req, res, next) => {
  res.render('more/about', {
    pageTitle: 'About',
    path: '/about',
  });
};

exports.getContact = (req, res, next) => {
  res.render('more/contact', {
    pageTitle: 'Contact',
    path: '/contact',
  });
};
