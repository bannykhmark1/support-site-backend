const sequelize = require('../db');
const { DataTypes } = require('sequelize');

const User = sequelize.define('user', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    email: { type: DataTypes.STRING, unique: true, allowNull: false },
    password: { type: DataTypes.STRING, allowNull: false },
    role: { type: DataTypes.STRING, defaultValue: "USER" },
    name: { type: DataTypes.STRING, allowNull: false }
});

const UserEmail = sequelize.define('user_email', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    email: { type: DataTypes.STRING, unique: true, allowNull: false },
    verificationCode: { type: DataTypes.STRING }, // Поле для хранения кода верификации
    codeExpires: { type: DataTypes.DATE }, // Поле для хранения времени истечения кода
    role: { type: DataTypes.STRING, defaultValue: "USER" },
    name: { type: DataTypes.STRING, allowNull: false },
    password: { type: DataTypes.STRING, allowNull: true }, // Добавляем поле для хранения пароля
    hasPermanentPassword: { type: DataTypes.BOOLEAN, defaultValue: false } // Добавляем флаг, что пароль постоянный
});

const Announcement = sequelize.define('announcement', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    title: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: false },
    date: { type: DataTypes.DATE, allowNull: false }
});

module.exports = {
    User,
    UserEmail,
    Announcement,
};
