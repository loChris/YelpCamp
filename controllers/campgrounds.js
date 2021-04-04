const Campground = require('../models/campground');

module.exports.index = async (req, res) => {
	const campgrounds = await Campground.find({});
	res.render('campgrounds/index', { campgrounds });
};

module.exports.newCampgroundShow = (req, res) => {
	res.render('campgrounds/new');
};

module.exports.campgroundShow = async (req, res) => {
	const id = req.params.id;
	const campground = await Campground.findById(id)
		.populate({
			path: 'reviews',
			populate: {
				path: 'author',
			},
		})
		.populate('author');
	console.log(campground);
	if (!campground) {
		req.flash('error', 'Cannot find that campground');
		return res.redirect('/campgrounds');
	}
	res.render('campgrounds/show', { campground });
};

module.exports.editCampgroundShow = async (req, res) => {
	const { id } = req.params;
	const campground = await Campground.findById(id);
	if (!campground) {
		req.flash('error', 'Cannot find that campground');
		return res.redirect('/campgrounds');
	}
	res.render('campgrounds/edit', { campground });
};

module.exports.addNewCampground = async (req, res, next) => {
	const campground = new Campground(req.body.campground);
	campground.author = req.user._id;
	await campground.save();
	req.flash('success', 'Successfully added a new campground!');
	res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.updateCampground = async (req, res) => {
	const udpateCampground = await Campground.findByIdAndUpdate(id, {
		...req.body.campground,
	});
	req.flash('success', 'Successfully updated campground!');
	res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.deleteCampground = async (req, res) => {
	const { id } = req.params;
	await Campground.findByIdAndDelete(id);
	req.flash('success', 'Successfully deleted campground!');
	res.redirect('/campgrounds');
};
