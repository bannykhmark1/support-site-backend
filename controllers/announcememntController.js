// controllers/announcementController.js
const { Announcement } = require('../models/models');
const ApiError = require('../error/ApiError');

class AnnouncementController {
    async create(req, res, next) {
        try {
            const { title, description, date } = req.body;
            const announcement = await Announcement.create({ title, description, date });
            return res.json(announcement);
        } catch (error) {
            return next(ApiError.badRequest('Ошибка при создании объявления'));
        }
    }

    async getAll(req, res, next) {
        try {
            const announcements = await Announcement.findAll();
            return res.json(announcements);
        } catch (error) {
            return next(ApiError.internal('Ошибка при получении объявлений'));
        }
    }

    async getOne(req, res, next) {
        try {
            const { id } = req.params;
            const announcement = await Announcement.findByPk(id);
            if (!announcement) {
                return next(ApiError.notFound('Объявление не найдено'));
            }
            return res.json(announcement);
        } catch (error) {
            return next(ApiError.internal('Ошибка при получении объявления'));
        }
    }

    async update(req, res, next) {
        try {
            const { id } = req.params;
            const { title, description, date } = req.body;
            const announcement = await Announcement.findByPk(id);
            if (!announcement) {
                return next(ApiError.notFound('Объявление не найдено'));
            }
            announcement.title = title;
            announcement.description = description;
            announcement.date = date;
            await announcement.save();
            return res.json(announcement);
        } catch (error) {
            return next(ApiError.internal('Ошибка при обновлении объявления'));
        }
    }

    async delete(req, res, next) {
        try {
            const { id } = req.params;
            const announcement = await Announcement.findByPk(id);
            if (!announcement) {
                return next(ApiError.notFound('Объявление не найдено'));
            }
            await announcement.destroy();
            return res.sendStatus(204);
        } catch (error) {
            return next(ApiError.internal('Ошибка при удалении объявления'));
        }
    }
}

module.exports = new AnnouncementController();
