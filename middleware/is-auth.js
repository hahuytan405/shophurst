module.exports = (req, res, next) => {
  if (!req.session.isLoggedIn) {
    req.session.redirect = req.originalUrl;
    return res.redirect('/login');
  }
  next();
};
