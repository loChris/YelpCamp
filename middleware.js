module.exports.isAuthed = (req, res, next) => {
	if (!req.isAuthenticated()) {
		req.flash('error', 'You must be signed in.');
		return res.redirect('/campgrounds');
	} else {
		return next();
	}
};
