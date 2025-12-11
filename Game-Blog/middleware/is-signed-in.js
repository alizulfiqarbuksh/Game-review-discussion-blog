const isSignedIn = (req, res, next) => {
  if (req.session.user) {
    console.log('You are logged in and able to see this page!!!!');
    next();
  } else {
    console.log('Unauthorized!!!');
    res.redirect('/auth/sign-in');
  }
};

module.exports = isSignedIn;
