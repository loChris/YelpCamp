const express = require('express');
const router = express.Router();
const { campgroundJoiSchema } = require('../schemas.js');
const CatchAsync = require('../utils/CatchAsync');
const ExpressError = require('../utils/ExpressError');
const Campground = require('../models/campground');

const joiValidateCampground = (req, res, next) => {
	const { error } = campgroundJoiSchema.validate(req.body);
	if (error) {
		const message = error.details.map((el) => el.message).join(',');
		throw new ExpressError(400, message);
	} else {
		return next();
	}
};

router.get(
	'/',
	CatchAsync(async (req, res) => {
		const campgrounds = await Campground.find({});
		res.render('campgrounds/index', { campgrounds });
	})
);

router.get('/new', (req, res) => {
	res.render('campgrounds/new');
});

router.get(
	'/:id',
	CatchAsync(async (req, res) => {
		const id = req.params.id;
		const campground = await Campground.findById(id).populate('reviews');
		res.render('campgrounds/show', { campground });
	})
);

router.get(
	'/:id/edit',
	CatchAsync(async (req, res) => {
		const campground = await Campground.findById(req.params.id);
		res.render('campgrounds/edit', { campground });
	})
);

router.post(
	'/',
	joiValidateCampground,
	CatchAsync(async (req, res, next) => {
		const campground = new Campground(req.body.campground);
		await campground.save();
		res.redirect(`/campgrounds/${campground._id}`);
	})
);

router.put(
	'/:id',
	joiValidateCampground,
	CatchAsync(async (req, res) => {
		const { id } = req.params;
		const campground = await Campground.findByIdAndUpdate(id, {
			...req.body.campground,
		});
		res.redirect(`/campgrounds/${campground._id}`);
	})
);

router.delete(
	'/:id',
	CatchAsync(async (req, res) => {
		const { id } = req.params;
		await Campground.findByIdAndDelete(id);
		res.redirect('/campgrounds');
	})
);

module.exports = router;
