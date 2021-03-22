const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const morgan = require('morgan');
const ejsMate = require('ejs-mate');
const methodOverride = require('method-override');
const ExpressError = require('./utils/ExpressError');
const campgrounds = require('./routes/campgrounds');
const reviews = require('./routes/reviews');
const app = express();
const db = mongoose.connection;
const PORT = 3000;

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
app.use('/campgrounds', campgrounds);

// *** REVIEW ROUTES ***
app.use('/campgrounds/:id/reviews', reviews);

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
