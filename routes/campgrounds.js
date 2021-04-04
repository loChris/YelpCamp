const express = require('express');
const router = express.Router();
const { isAuthed, isAuthor, joiValidateCampground } = require('../middleware');
const campgroundsController = require('../controllers/campgrounds');
const CatchAsync = require('../utils/CatchAsync');

router.get('/', CatchAsync(campgroundsController.index));

router.get('/new', isAuthed, campgroundsController.newCampgroundShow);

router.get('/:id', CatchAsync(campgroundsController.campgroundShow));

router.get(
	'/:id/edit',
	isAuthed,
	isAuthor,
	CatchAsync(campgroundsController.editCampgroundShow)
);

// flashes a success banner when campground is successfully added via partial (same with other flashes)
router.post(
	'/',
	isAuthed,
	joiValidateCampground,
	CatchAsync(campgroundsController.addNewCampground)
);

// flashes banner when campground is updated
router.put(
	'/:id',
	isAuthed,
	isAuthor,
	joiValidateCampground,
	CatchAsync(campgroundsController.updateCampground)
);

// flashes banner when campground is deleted
router.delete(
	'/:id',
	isAuthed,
	isAuthor,
	CatchAsync(campgroundsController.deleteCampground)
);

module.exports = router;
