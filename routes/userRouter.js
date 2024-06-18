const Router = require('express');
const { body } = require('express-validator');
const router = new Router();
const authenticateToken = require('../middleware/authenticateToken');
const userController = require('../controllers/userController');  // Убедитесь, что путь корректный

// Маршрут для регистрации пользователя
router.post('/registration', [
    body('email').isEmail().withMessage('Введите корректный email'),
    body('password').isLength({ min: 6 }).withMessage('Пароль должен содержать минимум 6 символов'),
    body('name').notEmpty().withMessage('Имя обязательно')
], userController.registration);

// Маршрут для входа пользователя
router.post('/login', [
    body('email').isEmail().withMessage('Введите корректный email'),
    body('password').notEmpty().withMessage('Пароль обязателен')
], userController.login);

// Маршрут для проверки аутентификации
router.get('/auth', authenticateToken, userController.check); // Здесь мы защищаем маршрут с нашим middleware

// Маршрут для удаления пользователя
router.delete('/deleteuser', userController.deleteUser);

// Маршрут для получения всех пользователей
router.get('/users', userController.getAllUsers);

// Маршрут для отображения страницы сброса пароля
router.get('/reset/:token', userController.renderResetPasswordPage);

// Маршрут для запроса сброса пароля с проверкой email
router.post('/requestPasswordReset', [
    body('email').isEmail().withMessage('Введите корректный email')
], userController.requestPasswordReset);

// Маршрут для сброса пароля с проверкой токена и нового пароля
router.post('/resetPassword', [
    body('token').notEmpty().withMessage('Токен обязателен'),
    body('newPassword').isLength({ min: 6 }).withMessage('Пароль должен содержать минимум 6 символов')
], userController.resetPassword);

module.exports = router;
