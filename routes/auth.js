const express = require('express');
const router = express.Router();
const passport = require('passport');
const CatchAsync = require('../utils/CatchAsync');
const User = require('../models/user');

router.get('/register', (req, res) => {
	res.render('auth/register');
});

router.post(
	'/register',
	CatchAsync(async (req, res) => {
		try {
			const { email, username, password } = req.body;
			const user = new User({
				email,
				username,
			});
			const newUser = await User.register(user, password);
			req.login(newUser, (error) => {
				if (error) {
					return next(error);
				} else {
					req.flash('success', 'Welcome to Yelp Camp!');
					res.redirect('/campgrounds');
				}
			});
		} catch (error) {
			req.flash('error', error.message);
			res.redirect('register');
		}
	})
);

router.get('/login', (req, res) => {
	res.render('auth/login');
});

router.post(
	'/login',
	passport.authenticate('local', {
		failureFlash: true,
		failureRedirect: '/login',
	}),
	(req, res) => {
		req.flash('success', 'Welcome Back!');
		res.redirect('/campgrounds');
	}
);

router.get('/logout', (req, res) => {
	req.logout();
	req.flash('success', 'Goodbye!');
	res.redirect('/campgrounds');
});

module.exports = router;
