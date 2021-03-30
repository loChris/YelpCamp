const express = require('express');
const router = express.Router();
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
			console.log(newUser);
			req.flash('success', 'Welcome to Yelp Camp!');
			res.redirect('/campgrounds');
		} catch (error) {
			req.flash('error', error.message);
			res.redirect('register');
		}
	})
);

module.exports = router;
