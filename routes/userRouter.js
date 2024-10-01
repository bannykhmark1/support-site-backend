const Router = require('express');
const { body } = require('express-validator');
const router = new Router();
const authenticateToken = require('../middleware/authenticateToken');
const userController = require('../controllers/userController');

// Отправка кода верификации
router.post(
    '/sendCode',
    body('email').isEmail(),
    userController.sendVerificationCode
);

// Верификация кода
router.post(
    '/verifyCode',
    userController.verifyCode
);

// Проверка статуса пароля
router.post(
    '/checkPasswordStatus',
    userController.checkPasswordStatus
);

// Логин с паролем
router.post(
    '/loginWithPassword',
    userController.loginWithPassword
);

// Установка нового пароля
router.post(
    '/setNewPassword',
    body('newPassword').isLength({ min: 6 }),
    userController.setNewPassword
);

module.exports = router;
