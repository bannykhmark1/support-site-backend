const generateVerificationCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString(); // Генерация 6-значного кода
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

        let user = await User.findOne({ where: { email } });

        if (!user) {
            user = await User.create({ email, role: 'USER', name: '' });
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
            text: `Ваш код для входа: ${verificationCode}. Код действителен 10 минут.`
        };

        await transporter.sendMail(mailOptions);

        return res.status(200).json({ message: 'Код отправлен на email' });
    }

    async verifyCode(req, res, next) {
        const { email, code } = req.body;

        const user = await User.findOne({ where: { email } });

        if (!user || user.verificationCode !== code || new Date() > user.codeExpires) {
            return next(ApiError.badRequest('Неверный или истекший код'));
        }

        const token = generateJwt(user.id, user.email, user.role, user.name);

        return res.json({ token });
    }
}

module.exports = new UserController();
