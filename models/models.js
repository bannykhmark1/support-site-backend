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

const Basket = sequelize.define('basket', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true }
});

const BasketProduct = sequelize.define('basket_product', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true }
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

const Rating = sequelize.define('rating', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    rate: { type: DataTypes.INTEGER, allowNull: false }
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
User.hasOne(Basket);
Basket.belongsTo(User);

// Связь между пользователем и рейтингом
User.hasMany(Rating);
Rating.belongsTo(User);

// Связь между корзиной и продуктами
Basket.hasMany(BasketProduct);
BasketProduct.belongsTo(Basket);

// Связь между типом и продуктами
Type.hasMany(Product);
Product.belongsTo(Type);

// Связь между продуктом и рейтингом
Product.hasMany(Rating);
Rating.belongsTo(Product);

// Связь между продуктом и продуктами в корзине
Product.hasMany(BasketProduct);
BasketProduct.belongsTo(Product);

// Связь между продуктом и дополнительной информацией о продукте
Product.hasMany(ProductInfo, { as: 'info' });
ProductInfo.belongsTo(Product);

// Связь между пользователем и отзывами
User.hasMany(Review);
Review.belongsTo(User);

// Экспорт моделей для использования в других частях приложения
module.exports = {
    User,
    Basket,
    BasketProduct,
    Product,
    Type,
    Rating,
    ProductInfo,
    Review
};