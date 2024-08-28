const sequelize = require('../db');
const { DataTypes } = require('sequelize');

// Определение моделей и их атрибутов

const User = sequelize.define('user', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    email: { type: DataTypes.STRING, unique: true, allowNull: false },
    password: { type: DataTypes.STRING, allowNull: false },
    role: { type: DataTypes.STRING, defaultValue: "USER" },
    name: { type: DataTypes.STRING, allowNull: false } // Новое поле "name"
});

const Announcement = sequelize.define('announcement', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    title: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: false },
    date: { type: DataTypes.DATE, allowNull: false }
});

// Новая модель для пользователей, входящих через Яндекс ID
const UserYandex = sequelize.define('usersYandex', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    email: { type: DataTypes.STRING, unique: true, allowNull: false },
    role: { type: DataTypes.STRING, defaultValue: "USER" },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
});

// Экспорт моделей для использования в других частях приложения
module.exports = {
    User,
    Announcement,
    UserYandex, // Экспорт новой модели
};
