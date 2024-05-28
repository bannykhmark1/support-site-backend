const Router = require('express'); // Импортируем Express для создания роутера
const router = new Router(); // Создаём новый роутер
const productsController = require('../controllers/productsController'); // Импортируем контроллер продуктов

// Маршрут для создания продукта
router.post('/', productsController.create);

// Маршрут для получения всех продуктов
router.get('/', productsController.getAll);

// Маршрут для получения одного продукта по ID
router.get('/:id', productsController.getOne);

router.delete('/:id', productsController.delete);


// Экспортируем роутер для использования в основном файле приложения
module.exports = router;