const express = require('express');
const path = require('path');
const session = require('express-session');
const flash = require('connect-flash');
const mongoose = require('mongoose');
const morgan = require('morgan');
const ejsMate = require('ejs-mate');
const methodOverride = require('method-override');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const ExpressError = require('./utils/ExpressError');
const campgrounds = require('./routes/campgrounds');
const reviews = require('./routes/reviews');
const User = require('./models/user');
const app = express();
const db = mongoose.connection;
const PORT = 3000;

const sessionConfig = {
	secret: 'thisshouldbeabettersecret',
	resave: false,
	saveUninitialized: true,
	cookie: {
		httpOnly: true,
		expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
		maxAge: Date.now(),
	},
};

mongoose.connect('mongodb://localhost:27017/yelp-camp', {
	useNewUrlParser: true,
	useCreateIndex: true,
	useUnifiedTopology: true,
	useFindAndModify: false,
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
app.use(express.static(path.join(__dirname, 'public')));
app.use(session(sessionConfig));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get('/', (req, res) => {
	res.render('home');
});

app.use((req, res, next) => {
	res.locals.success = req.flash('success');
	res.locals.error = req.flash('error');
	return next();
});

app.get('/fakeUser', async (req, res) => {
	const user = new User({
		email: 'juice@gmail.com',
		username: 'juiceee',
	});
	const newUser = await User.register(user, 'chicken');
	res.send(newUser);
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
