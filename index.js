require('dotenv').config();
const express = require('express');
const axios = require('axios'); // Для HTTP-запросов
const sequelize = require('./db');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const path = require('path');
const session = require('express-session'); // Для работы с сессиями
const errorHandler = require('./middleware/ErrorHandlingMiddleware');
const router = require('./routes/index');
const userRouter = require('./routes/userRouter');
const announcementRouter = require('./routes/announcementRouter');

const PORT = process.env.PORT || 5000;

const app = express();

// Настройка сессий
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key', // Убедитесь, что SESSION_SECRET установлен в переменных окружения
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Для разработки используйте secure: false, для продакшн среды установите true
}));

app.use(cors());
app.use(express.json());
app.use(express.static(path.resolve(__dirname, 'static')));
app.use(fileUpload({ createParentPath: true }));
// Маршруты API
app.use('/api', router);
app.use('/api/user', userRouter);
app.use('/api/announcements', announcementRouter);

// Обработка ошибок
app.use(errorHandler);

const start = async () => {
    try {
        await sequelize.authenticate();
        await sequelize.sync();
        app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
    } catch (e) {
        console.error(e);
    }
};

start();
