// routes/announcementRoutes.js
const Router = require('express');
const { body } = require('express-validator');
const router = new Router();
const authenticateToken = require('../middleware/authenticateToken');
const announcementController = require('../controllers/announcememntController');

router.post('/', [
    authenticateToken,
    body('title').notEmpty().withMessage('Заголовок обязателен'),
    body('description').notEmpty().withMessage('Описание обязательно'),
    body('date').isISO8601().withMessage('Дата обязателена и должна быть в формате ISO8601')
], announcementController.create);

router.get('/', announcementController.getAll);
router.get('/:id', announcementController.getOne);
router.put('/:id', [
    authenticateToken,
    body('title').notEmpty().withMessage('Заголовок обязателен'),
    body('description').notEmpty().withMessage('Описание обязательно'),
    body('date').isISO8601().withMessage('Дата обязателена и должна быть в формате ISO8601')
], announcementController.update);
router.delete('/:id', authenticateToken, announcementController.delete);

module.exports = router;
