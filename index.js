const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const morgan = require('morgan');
const ejsMate = require('ejs-mate');
const methodOverride = require('method-override');
const { campgroundJoiSchema, reviewJoiSchema } = require('./schemas.js');
const Campground = require('./models/campground');
const Review = require('./models/review');
const CatchAsync = require('./utils/CatchAsync');
const ExpressError = require('./utils/ExpressError');
const campground = require('./models/campground');
const review = require('./models/review');
const app = express();
const db = mongoose.connection;
const PORT = 3000;

// Joi serverside validation for forms
const joiValidateCampground = (req, res, next) => {
	const { error } = campgroundJoiSchema.validate(req.body);
	if (error) {
		const message = error.details.map((el) => el.message).join(',');
		throw new ExpressError(400, message);
	} else {
		return next();
	}
};

const joiValidateReview = (req, res, next) => {
	const { error } = reviewJoiSchema.validate(req.body);
	if (error) {
		const message = error.details.map((el) => el.message).join(',');
		throw new ExpressError(400, message);
	} else {
		return next();
	}
};

mongoose.connect('mongodb://localhost:27017/yelp-camp', {
	useNewUrlParser: true,
	useCreateIndex: true,
	useUnifiedTopology: true,
});

db.on('error', console.error.bind(console.error, 'connection error:'));
db.once('open', () => {
	console.log('Database connected...');
});

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(morgan('combined'));

app.get('/', (req, res) => {
	res.render('home');
});

// *** CAMPGROUND ROUTES ***
app.get(
	'/campgrounds',
	CatchAsync(async (req, res) => {
		const campgrounds = await Campground.find({});
		res.render('campgrounds/index', { campgrounds });
	})
);

app.get('/campgrounds/new', (req, res) => {
	res.render('campgrounds/new');
});

app.get(
	'/campgrounds/:id',
	CatchAsync(async (req, res) => {
		const id = req.params.id;
		const campground = await Campground.findById(id).populate('reviews');
		res.render('campgrounds/show', { campground });
	})
);

app.get(
	'/campgrounds/:id/edit',
	CatchAsync(async (req, res) => {
		const campground = await Campground.findById(req.params.id);
		res.render('campgrounds/edit', { campground });
	})
);

app.post(
	'/campgrounds',
	joiValidateCampground,
	CatchAsync(async (req, res, next) => {
		const campground = new Campground(req.body.campground);
		await campground.save();
		res.redirect(`/campgrounds/${campground._id}`);
	})
);

app.put(
	'/campgrounds/:id',
	joiValidateCampground,
	CatchAsync(async (req, res) => {
		const { id } = req.params;
		const campground = await Campground.findByIdAndUpdate(id, {
			...req.body.campground,
		});
		res.redirect(`/campgrounds/${campground._id}`);
	})
);

app.delete(
	'/campgrounds/:id',
	CatchAsync(async (req, res) => {
		const { id } = req.params;
		await Campground.findByIdAndDelete(id);
		res.redirect('/campgrounds');
	})
);

// *** REVIEW ROUTES ***
app.post(
	'/campgrounds/:id/reviews',
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

app.delete(
	'/campgrounds/:campId/reviews/:reviewId',
	CatchAsync(async (req, res) => {
		const { campId, reviewId } = req.params;
		await Campground.findByIdAndUpdate(campId, {
			$pull: { reviews: reviewId },
		});
		await Review.findByIdAndDelete(req.params.reviewId);
		res.redirect(`/campgrounds/${campId}`);
	})
);

app.all('*', (req, res, next) => {
	return next(new ExpressError(404, 'Page Not Found'));
});

app.use((err, req, res, next) => {
	const { statusCode = 500, message } = err;
	if (!err.message) {
		err.message = 'Oops! Something went wrong...';
	}
	res.status(statusCode).render('error', { err });
});

app.listen(PORT, () => {
	console.log(`Listening on port ${PORT}...`);
});
