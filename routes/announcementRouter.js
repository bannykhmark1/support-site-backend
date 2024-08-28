const Router = require('express');
const { body } = require('express-validator');
const router = new Router();
const announcementController = require('../controllers/announcementController');

// Все пользователи могут создавать объявления
router.post('/', [
    body('title').notEmpty().withMessage('Заголовок обязателен'),
    body('description').notEmpty().withMessage('Описание обязательно'),
    body('date').isISO8601().withMessage('Дата обязательна и должна быть в формате ISO8601')
], announcementController.create);

// Получение всех объявлений и одного объявления
router.get('/', announcementController.getAll);
router.get('/:id', announcementController.getOne);

// Все пользователи могут обновлять и удалять объявления
router.put('/:id', [
    body('title').notEmpty().withMessage('Заголовок обязателен'),
    body('description').notEmpty().withMessage('Описание обязательно'),
    body('date').isISO8601().withMessage('Дата обязательна и должна быть в формате ISO8601')
], announcementController.update);

router.delete('/:id', announcementController.delete);

module.exports = router;
