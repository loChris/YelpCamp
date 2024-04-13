const express = require('express')
const router = express.Router({ mergeParams: true })
const { isAuthed, isReviewAuthor, joiValidateReview } = require('../middleware')
const CatchAsync = require('../utils/CatchAsync')
const reviewsController = require('../controllers/reviews')

// flashes success banner when review is created
router.post(
  '/',
  isAuthed,
  joiValidateReview,
  CatchAsync(reviewsController.newReview)
)

router.delete(
  '/:reviewId',
  isAuthed,
  isReviewAuthor,
  CatchAsync(reviewsController.deleteReview)
)

module.exports = router
