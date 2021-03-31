const express = require('express');
const router = express.Router();
const { isAuthed, isAuthor, joiValidateCampground } = require('../middleware');
const CatchAsync = require('../utils/CatchAsync');
const Campground = require('../models/campground');

router.get(
	'/',
	CatchAsync(async (req, res) => {
		const campgrounds = await Campground.find({});
		res.render('campgrounds/index', { campgrounds });
	})
);

router.get('/new', isAuthed, (req, res) => {
	res.render('campgrounds/new');
});

router.get(
	'/:id',
	CatchAsync(async (req, res) => {
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
	})
);

router.get(
	'/:id/edit',
	isAuthed,
	isAuthor,
	CatchAsync(async (req, res) => {
		const { id } = req.params;
		const campground = await Campground.findById(id);
		if (!campground) {
			req.flash('error', 'Cannot find that campground');
			return res.redirect('/campgrounds');
		}
		res.render('campgrounds/edit', { campground });
	})
);

// flashes a success banner when campground is successfully added via partial (same with other flashes)
router.post(
	'/',
	isAuthed,
	joiValidateCampground,
	CatchAsync(async (req, res, next) => {
		const campground = new Campground(req.body.campground);
		campground.author = req.user._id;
		await campground.save();
		req.flash('success', 'Successfully added a new campground!');
		res.redirect(`/campgrounds/${campground._id}`);
	})
);

// flashes banner when campground is updated
router.put(
	'/:id',
	isAuthed,
	isAuthor,
	joiValidateCampground,
	CatchAsync(async (req, res) => {
		const udpateCampground = await Campground.findByIdAndUpdate(id, {
			...req.body.campground,
		});
		req.flash('success', 'Successfully updated campground!');
		res.redirect(`/campgrounds/${campground._id}`);
	})
);

// flashes banner when campground is deleted
router.delete(
	'/:id',
	isAuthed,
	isAuthor,
	CatchAsync(async (req, res) => {
		const { id } = req.params;
		await Campground.findByIdAndDelete(id);
		req.flash('success', 'Successfully deleted campground!');
		res.redirect('/campgrounds');
	})
);

module.exports = router;
