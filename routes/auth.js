const express = require('express');
const router = express.Router();
const passport = require('passport');
const CatchAsync = require('../utils/CatchAsync');
const authController = require('../controllers/auth');

router.get('/register', authController.registerShow);

router.post('/register', CatchAsync(authController.registerNewUser));

router.get('/login', authController.loginShow);

router.post(
	'/login',
	passport.authenticate('local', {
		failureFlash: true,
		failureRedirect: '/login',
	}),
	authController.loginUser
);

router.get('/logout', authController.logoutUser);

module.exports = router;
