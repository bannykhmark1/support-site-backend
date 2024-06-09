const dotenv = require('dotenv');
dotenv.config();
const ApiError = require('../error/ApiError');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {User } = require('../models/models');

const generateJwt = (id, email, role, name) => {
    return jwt.sign(
        {id, email, role, name},
        process.env.SECRET_KEY,
        {expiresIn: '24h'}
    )
}

class UserController {
    async registration(req, res, next) {
        const {email, password, role, name} = req.body;
        if (!email || !password || !name) {
            return next(ApiError.badRequest('Некорректный email, password или имя'));
        }
        const candidate = await User.findOne({where: {email}});
        if (candidate) {
            return next(ApiError.badRequest('Пользователь с таким email уже существует'));
        }
        const hashPassword = await bcrypt.hash(password, 5);
        const user = await User.create({email, role, password: hashPassword, name});
        const token = generateJwt(user.id, user.email, user.role, user.name);
        return res.json({token});
    }

    async deleteUser(req, res, next) {
        const userId = req.user.id; // Получаем идентификатор текущего пользователя из запроса

        try {
            // Находим пользователя по его идентификатору
            const user = await User.findByPk(userId);

            if (!user) {
                return next(ApiError.notFound('Пользователь не найден'));
            }

            // Удаляем пользователя из базы данных
            await user.destroy();

            // Отправляем ответ об успешном удалении пользователя
            return res.sendStatus(204); // 204 - No Content
        } catch (error) {
            // Если произошла ошибка, передаем ее обработчику ошибок Express
            return next(error);
        }
    }

    async login(req, res, next) {
        const {email, password} = req.body;
        const user = await User.findOne({where: {email}});
        if (!user) {
            return next(ApiError.internal('Пользователь не найден'));
        }
        let comparePassword = bcrypt.compareSync(password, user.password);
        if (!comparePassword) {
            return next(ApiError.internal('Указан неверный пароль'));
        }
        const token = generateJwt(user.id, user.email, user.role, user.name);
        return res.json({token});
    }

    
    async getAllUsers(req, res, next) {
        try {
            // Получаем всех пользователей из базы данных
            const users = await User.findAll();
            console.log(users)
            // Отправляем массив пользователей в качестве ответа
            return res.json(users);
        } catch (error) {
            // Если произошла ошибка, передаем ее обработчику ошибок Express
            return next(error);
        }
    }

    async check(req, res, next) {
        const token = generateJwt(req.user.id, req.user.email, req.user.role, req.user.name);
        return res.json({token});
    }
}

module.exports = new UserController();