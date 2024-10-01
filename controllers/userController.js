const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const { UserEmail } = require('../models/models');
const ApiError = require('../error/ApiError');

const transporter = nodemailer.createTransport({
    host: 'connect.smtp.bz', 
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

const generateVerificationCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

const generateJwt = (id, email, role, name) => {
    return jwt.sign({ id, email, role, name }, process.env.SECRET_KEY, { expiresIn: '1h' });
};

class UserController {
    async sendVerificationCode(req, res, next) {
        const { email } = req.body;

        if (!email || !email.includes('@')) {
            return next(ApiError.badRequest('Некорректный формат email'));
        }

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
        const codeExpires = new Date(Date.now() + 10 * 60 * 1000);
        user.verificationCode = verificationCode;
        user.codeExpires = codeExpires;
        await user.save();

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Ваш код для входа',
            html: `<div>Ваш код для входа: <b>${verificationCode}</b>. Код действителен 10 минут.</div>`,
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

    async checkPasswordStatus(req, res, next) {
        const { email } = req.body;

        const user = await UserEmail.findOne({ where: { email } });
        if (!user) {
            return next(ApiError.badRequest('Пользователь не найден'));
        }

        return res.json({ hasPermanentPassword: !!user.password });
    }

    async loginWithPassword(req, res, next) {
        const { email, password } = req.body;

        const user = await UserEmail.findOne({ where: { email } });
        if (!user) {
            return next(ApiError.badRequest('Пользователь не найден'));
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return next(ApiError.badRequest('Неверный пароль'));
        }

        const token = generateJwt(user.id, user.email, user.role, user.name);
        return res.json({ token });
    }

    async setNewPassword(req, res, next) {
        const { email, newPassword } = req.body;

        const user = await UserEmail.findOne({ where: { email } });
        if (!user) {
            return next(ApiError.badRequest('Пользователь не найден'));
        }

        const hashedPassword = await bcrypt.hash(newPassword, 5);
        user.password = hashedPassword;
        user.hasPermanentPassword = true;
        await user.save();

        return res.status(200).json({ message: 'Пароль успешно установлен' });
    }
}

module.exports = new UserController();
