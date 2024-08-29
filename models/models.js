const sequelize = require('../db');
const { DataTypes } = require('sequelize');

// Определение моделей и их атрибутов

const User = sequelize.define('user', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    email: { type: DataTypes.STRING, unique: true, allowNull: false },
    verificationCode: { type: DataTypes.STRING }, // Поле для хранения кода верификации
    codeExpires: { type: DataTypes.DATE }, // Поле для хранения времени истечения кода
    role: { type: DataTypes.STRING, defaultValue: "USER" },
    name: { type: DataTypes.STRING, allowNull: false }
});


const Announcement = sequelize.define('announcement', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    title: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: false },
    date: { type: DataTypes.DATE, allowNull: false }
});



// Экспорт моделей для использования в других частях приложения
module.exports = {
    User,
    Announcement,

};
