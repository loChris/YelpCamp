if (process.env.NODE_ENV !== 'production') {
	require('dotenv').config();
}

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
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const MongoDBStore = require('connect-mongo');
const ExpressError = require('./utils/ExpressError');
const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');
const authRoutes = require('./routes/auth');
const User = require('./models/user');
const app = express();
const db = mongoose.connection;
const dbUrl = process.env.DB_URL;
const dbLocal = process.env.LOCAL_MONGO_DB;
const PORT = 3000;

mongoose.connect(dbLocal, {
	useNewUrlParser: true,
	useCreateIndex: true,
	useUnifiedTopology: true,
	useFindAndModify: false,
});

const mongoStoreOptions = {
	url: dbUrl,
	secret: 'thisshouldbeabettersecret',
	touchAfter: 24 * 60 * 60,
};

const sessionConfig = {
	name: '__mtfbw.session',
	secret: 'thisshouldbeabettersecret',
	resave: false,
	saveUninitialized: true,
	cookie: {
		httpOnly: true,
		// secure: true,
		expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
		maxAge: Date.now(),
	},
	store: MongoDBStore.create({
		mongoUrl: dbLocal,
		ttl: 14 * 24 * 60 * 60,
	}),
};

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
app.use(mongoSanitize());

const scriptSrcUrls = [
	'https://stackpath.bootstrapcdn.com/',
	'https://api.tiles.mapbox.com/',
	'https://api.mapbox.com/',
	'https://kit.fontawesome.com/',
	'https://cdnjs.cloudflare.com/',
	'https://cdn.jsdelivr.net',
];
const styleSrcUrls = [
	'https://kit-free.fontawesome.com/',
	'https://stackpath.bootstrapcdn.com/',
	'https://api.mapbox.com/',
	'https://api.tiles.mapbox.com/',
	'https://fonts.googleapis.com/',
	'https://use.fontawesome.com/',
	'https://cdn.jsdelivr.net/npm/bootstrap@5.0.0-beta2/dist/css/bootstrap.min.css',
];
const connectSrcUrls = [
	'https://api.mapbox.com/',
	'https://a.tiles.mapbox.com/',
	'https://b.tiles.mapbox.com/',
	'https://events.mapbox.com/',
];
const fontSrcUrls = [];

app.use(
	helmet.contentSecurityPolicy({
		directives: {
			defaultSrc: [],
			connectSrc: ["'self'", ...connectSrcUrls],
			scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
			styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
			workerSrc: ["'self'", 'blob:'],
			objectSrc: [],
			imgSrc: [
				"'self'",
				'blob:',
				'data:',
				'https://res.cloudinary.com/dxlpc7ymd/', //SHOULD MATCH YOUR CLOUDINARY ACCOUNT!
				'https://images.unsplash.com/',
			],
			fontSrc: ["'self'", ...fontSrcUrls],
		},
	})
);

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
	res.locals.currentUser = req.user;
	res.locals.success = req.flash('success');
	res.locals.error = req.flash('error');
	return next();
});

app.get('/', (req, res) => {
	res.render('home');
});

// *** CAMPGROUND ROUTES ***
app.use('/campgrounds', campgroundRoutes);

// *** REVIEW ROUTES ***
app.use('/campgrounds/:id/reviews', reviewRoutes);

// *** AUTH ROTUES ***
app.use('/', authRoutes);

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
