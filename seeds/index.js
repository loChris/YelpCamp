const mongoose = require('mongoose');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');
const Campground = require('../models/campground');

mongoose.connect('mongodb://localhost:27017/yelp-camp', {
	useNewUrlParser: true,
	useCreateIndex: true,
	useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
	console.log('Database connected');
});

const sample = (array) => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
	await Campground.deleteMany({});
	for (let i = 0; i < 50; i++) {
		const random1000 = Math.floor(Math.random() * 1000);
		const price = Math.floor(Math.random() * 20) + 10;
		const camp = new Campground({
			author: '6063a16e0432bb6c78b99b11',
			location: `${cities[random1000].city}, ${cities[random1000].state}`,
			title: `${sample(descriptors)} ${sample(places)}`,
			images: [
				{
					url:
						'https://res.cloudinary.com/dxlpc7ymd/image/upload/v1617921255/YelpCamp/jyn6fzgzf6c64hcdljs2.jpg',
					filename: 'YelpCamp/jyn6fzgzf6c64hcdljs2',
				},
			],
			description:
				'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque tempor.',
			price: price,
			geometry: {
				type: 'Point',
				coordinates: [-113.1331, 47.0202],
			},
		});
		await camp.save();
	}
};

seedDB().then(() => {
	mongoose.connection.close();
});
