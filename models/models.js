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


const Product = sequelize.define('product', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, unique: true, allowNull: false },
    price: { type: DataTypes.INTEGER, allowNull: false },
    rating: { type: DataTypes.INTEGER, defaultValue: 0 },
    img: { type: DataTypes.STRING, allowNull: false }
});

const Type = sequelize.define('type', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, unique: true, allowNull: false }
});


const ProductInfo = sequelize.define('product_info', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    title: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.STRING, allowNull: false }
});

const Review = sequelize.define('review', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    text: { type: DataTypes.STRING, allowNull: false },
    userName: { type: DataTypes.STRING, allowNull: false },
    userId: { type: DataTypes.INTEGER, allowNull: false }
});

// Определение связей между моделями

// Связь между пользователем и корзиной

// Связь между типом и продуктами
Type.hasMany(Product);
Product.belongsTo(Type);

// Связь между продуктом и дополнительной информацией о продукте
Product.hasMany(ProductInfo, { as: 'info' });
ProductInfo.belongsTo(Product);

// Связь между пользователем и отзывами
User.hasMany(Review);
Review.belongsTo(User);

// Экспорт моделей для использования в других частях приложения
module.exports = {
    User,
    Product,
    Type,
    ProductInfo,
    Review
};