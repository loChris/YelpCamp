const express = require('express');
const router = express.Router();
const { isAuthed, isAuthor, joiValidateCampground } = require('../middleware');
const campgroundsController = require('../controllers/campgrounds');
const CatchAsync = require('../utils/CatchAsync');

router
	.route('/')
	.get(CatchAsync(campgroundsController.index))
	.post(
		isAuthed,
		joiValidateCampground,
		CatchAsync(campgroundsController.addNewCampground)
	);

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

router.get('/new', isAuthed, campgroundsController.newCampgroundShow);

router.get(
	'/:id/edit',
	isAuthed,
	isAuthor,
	CatchAsync(campgroundsController.editCampgroundShow)
);

module.exports = router;
