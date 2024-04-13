const { campgroundJoiSchema, reviewJoiSchema } = require('./schemas');
const ExpressError = require('./utils/ExpressError');
const Campground = require('./models/campground');
const Review = require('./models/review');

module.exports.isAuthed = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.flash('error', 'You must be signed in.');
    return res.redirect('/campgrounds');
  } else {
    return next();
  }
};

module.exports.isAuthor = async (req, res, next) => {
  const { id } = req.params;
  const campground = await Campground.findById(id);
  if (!campground.author.equals(req.user._id)) {
    req.flash('error', 'You do not have permission to do that.');
    res.redirect(`/campgrounds/${id}`);
  }
  return next();
};

module.exports.isReviewAuthor = async (req, res, next) => {
  const { id, reviewId } = req.params;
  const review = await Review.findById(reviewId);
  if (!review.author.equals(req.user._id)) {
    req.flash('error', 'You do not have permission to do that.');
    res.redirect(`/campgrounds/${id}`);
  }
  return next();
};

module.exports.joiValidateCampground = (req, res, next) => {
  const { error } = campgroundJoiSchema.validate(req.body);
  if (error) {
    const message = error.details.map((el) => el.message).join(',');
    throw new ExpressError(400, message);
  } else {
    return next();
  }
};

module.exports.joiValidateReview = (req, res, next) => {
  const { error } = reviewJoiSchema.validate(req.body);
  if (error) {
    const message = error.details.map((el) => el.message).join(',');
    throw new ExpressError(400, message);
  } else {
    return next();
  }
};
