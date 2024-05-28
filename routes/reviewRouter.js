// routes/reviewRouter.js
const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');

// Создание нового отзыва
router.post('/', reviewController.createReview);

// Получение всех отзывов
router.get('/', reviewController.getAllReviews);

// Получение одного отзыва по ID
router.get('/:id', reviewController.getReviewById);

// Обновление отзыва по ID
router.put('/:id', reviewController.updateReview);

// Удаление отзыва по ID
router.delete('/:id', reviewController.deleteReview);

module.exports = router;