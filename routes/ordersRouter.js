const Router = require('express');
const router = new Router();
const ordersController = require('../controllers/ordersController'); // Импортируем контроллер продуктов

// Отправка формы заказа на почту
router.post('/send', ordersController.send);

module.exports = router;