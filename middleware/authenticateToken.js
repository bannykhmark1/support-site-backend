const jwt = require('jsonwebtoken');
const { User } = require('../models/models');

module.exports = async (req, res, next) => {
    if (req.method === 'OPTIONS') return next();

    try {
        const token = req.headers['authorization']?.split(' ')[1];
        if (!token) {
            console.log("Не найден токен.");
            return res.status(401).json({ message: 'Не авторизован' });
        }

        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        console.log("Декодированный токен:", decoded);

        const user = await User.findOne({ where: { id: decoded.id } });
        if (!user) {
            console.log("Пользователь не найден.");
            return res.status(401).json({ message: 'Не авторизован' });
        }

        req.user = user;
        console.log("req.user установлен:", req.user);
        next();
    } catch (err) {
        console.log("Ошибка при проверке токена:", err);
        res.status(401).json({ message: 'Не авторизован' });
    }
};