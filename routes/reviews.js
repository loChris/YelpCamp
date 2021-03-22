const express = require('express');
const router = express.Router({ mergeParams: true });
const { reviewJoiSchema } = require('../schemas.js');
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

router.post(
	'/',
	joiValidateReview,
	CatchAsync(async (req, res) => {
		const campground = await Campground.findById(req.params.id);
		const review = new Review(req.body.review);
		campground.reviews.push(review);
		await review.save();
		await campground.save();
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
		res.redirect(`/campgrounds/${id}`);
	})
);

module.exports = router;
