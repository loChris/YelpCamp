const express = require('express');
const router = express.Router({ mergeParams: true });
const { reviewJoiSchema } = require('../schemas.js');
const { isAuthed } = require('../middleware');
const CatchAsync = require('../utils/CatchAsync');
const ExpressError = require('../utils/ExpressError');
const Campground = require('../models/campground');
const Review = require('../models/review');

const joiValidateReview = (req, res, next) => {
	const { error } = reviewJoiSchema.validate(req.body);
	if (error) {
		const message = error.details.map((el) => el.message).join(',');
		throw new ExpressError(400, message);
	} else {
		return next();
	}
};

// flashes success banner when review is created
router.post(
	'/',
	isAuthed,
	joiValidateReview,
	CatchAsync(async (req, res) => {
		const campground = await Campground.findById(req.params.id);
		const review = new Review(req.body.review);
		review.author = req.user._id;
		campground.reviews.push(review);
		await review.save();
		await campground.save();
		req.flash('success', 'Created new review!');
		res.redirect(`/campgrounds/${campground._id}`);
	})
);

router.delete(
	'/:reviewId',
	CatchAsync(async (req, res) => {
		const { id, reviewId } = req.params;
		await Campground.findByIdAndUpdate(id, {
			$pull: { reviews: reviewId },
		});
		await Review.findByIdAndDelete(req.params.reviewId);
		req.flash('success', 'Successfully deleted review!');
		res.redirect(`/campgrounds/${id}`);
	})
);

module.exports = router;
