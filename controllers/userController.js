const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const { UserEmail } = require('../models/models'); // Убедитесь, что путь к модели UserEmail корректен
const ApiError = require('../error/ApiError'); // Убедитесь, что путь к ApiError корректен

// Создаем конфигурацию для Nodemailer
const transporter = nodemailer.createTransport({
    host: 'connect.smtp.bz', // Замените на ваш SMTP сервер
    port: 587, // Порт для вашего SMTP сервера
    secure: false, // Если используете TLS, измените на true
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

const generateVerificationCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString(); // Генерация 6-значного кода
}

const generateJwt = (id, email, role, name) => {
    const payload = { id, email, role, name };
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
}

class UserController {
    async sendVerificationCode(req, res, next) {
        const { email } = req.body;

        // Проверяем, что email принадлежит одному из разрешенных доменов
        const allowedDomains = ['reftp', 'hobbs-it', 'kurganmk'];
        const domain = email.split('@')[1].split('.')[0];
        if (!allowedDomains.includes(domain)) {
            return next(ApiError.badRequest('Email не принадлежит разрешенному домену'));
        }

        let user = await UserEmail.findOne({ where: { email } });

        if (!user) {
            user = await UserEmail.create({ email, role: 'USER', name: '' });
        }

        const verificationCode = generateVerificationCode();
        const codeExpires = new Date(Date.now() + 10 * 60 * 1000); // Код действителен 10 минут

        user.verificationCode = verificationCode;
        user.codeExpires = codeExpires;
        await user.save();

        // Отправка кода на email
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Ваш код для входа',
            text: `Ваш код для входа: ${verificationCode}. Код действителен 10 минут.` // Исправленный текст сообщения
        };

        try {
            await transporter.sendMail(mailOptions);
            return res.status(200).json({ message: 'Код отправлен на email' });
        } catch (error) {
            console.error('Ошибка при отправке email:', error);
            return next(ApiError.internal('Ошибка при отправке email'));
        }
    }

    async verifyCode(req, res, next) {
        const { email, code } = req.body;

        const user = await UserEmail.findOne({ where: { email } });

        if (!user || user.verificationCode !== code || new Date() > user.codeExpires) {
            return next(ApiError.badRequest('Неверный или истекший код'));
        }

        const token = generateJwt(user.id, user.email, user.role, user.name);

        return res.json({ token });
    }
}

module.exports = new UserController();
