const Router = require('express');
const { body } = require('express-validator');
const router = new Router();
const authenticateToken = require('../middleware/authenticateToken');
const userController = require('../controllers/userController');
const checkRole = require('../middleware/checkRoleMiddleware');  // Убедитесь, что путь корректный

router.post(
    '/sendCode',
    body('email').isEmail(),  // Добавляем валидацию email
    userController.sendVerificationCode
);

router.post(
    '/verifyCode',
    userController.verifyCode
);

module.exports = router;

router.post(
    '/changePassword',
    authenticateToken,  // Проверка JWT токена для аутентифицированного пользователя
    body('newPassword').isLength({ min: 6 }),  // Валидация нового пароля
    userController.changePassword
);

