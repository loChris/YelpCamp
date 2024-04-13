const express = require('express');
const router = express.Router();
const passport = require('passport');
const CatchAsync = require('../utils/CatchAsync');
const authController = require('../controllers/auth');
const passportAuth = passport.authenticate('local', {
  failureFlash: true,
  failureRedirect: '/login'
});

router
  .route('/register')
  .get(authController.registerShow)
  .post(CatchAsync(authController.registerNewUser));

router
  .route('/login')
  .get(authController.loginShow)
  .post(passportAuth, authController.loginUser);

router.get('/logout', authController.logoutUser);

module.exports = router;
