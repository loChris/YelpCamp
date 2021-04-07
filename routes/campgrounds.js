const express = require('express');
const router = express.Router();
const { isAuthed, isAuthor, joiValidateCampground } = require('../middleware');
const campgroundsController = require('../controllers/campgrounds');
const CatchAsync = require('../utils/CatchAsync');
const multer = require('multer');
const { storage } = require('../cloudinary.config');
const upload = multer({ storage });

router
	.route('/')
	.get(CatchAsync(campgroundsController.index))
	// .post(
	// 	isAuthed,
	// 	joiValidateCampground,
	// 	CatchAsync(campgroundsController.addNewCampground)
	// );
	.post(upload.array('image'), (req, res) => {
		res.send(req.files);
	});

router.get('/new', isAuthed, campgroundsController.newCampgroundShow);

router
	.route('/:id')
	.get(CatchAsync(campgroundsController.campgroundShow))
	.put(
		isAuthed,
		isAuthor,
		joiValidateCampground,
		CatchAsync(campgroundsController.updateCampground)
	)
	.delete(
		isAuthed,
		isAuthor,
		CatchAsync(campgroundsController.deleteCampground)
	);

router.get(
	'/:id/edit',
	isAuthed,
	isAuthor,
	CatchAsync(campgroundsController.editCampgroundShow)
);

module.exports = router;
