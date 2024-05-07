module.exports = (req, res, next) => {
  if (req.session.user.email != 'admin@gmail.com') {
    return res.redirect('/login');
  }
  next();
};
