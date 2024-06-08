const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
    process.env.DB_NAME,        // Название базы данных
    process.env.DB_USER,        // Пользователь базы данных
    process.env.DB_PASSWORD,    // Пароль пользователя
    {
        dialect: 'postgres',
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false, // Возможно нужен для подключения с SSL, в зависимости от настроек сервера
            }
        },
        logging: false, // Включите, если хотите видеть SQL-запросы в логах
    }
);

module.exports = sequelize;