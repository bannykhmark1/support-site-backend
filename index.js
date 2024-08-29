require('dotenv').config();
const express = require('express');
const axios = require('axios');
const sequelize = require('./db');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const path = require('path');
const session = require('express-session');
const errorHandler = require('./middleware/ErrorHandlingMiddleware');
const router = require('./routes/index');
const userRouter = require('./routes/userRouter');
const announcementRouter = require('./routes/announcementRouter');
const http = require('http'); // Для создания HTTP сервера
const WebSocket = require('ws'); // Подключаем WebSocket

const PORT = process.env.PORT || 5000;

const app = express();

// Настройка сессий
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
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

// Создание HTTP сервера и интеграция с WebSocket
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Настройка WebSocket
wss.on('connection', (ws) => {
    console.log('Новое WebSocket подключение');

    ws.on('message', (message) => {
        console.log('Получено сообщение:', message);
        // Отправляем ответ
        ws.send('Привет от сервера!');
    });

    ws.on('close', () => {
        console.log('Соединение закрыто');
    });
});

const start = async () => {
    try {
        await sequelize.authenticate();
        await sequelize.sync();
        server.listen(PORT, () => console.log(`Server started on port ${PORT}`));
    } catch (e) {
        console.error(e);
    }
};

start();
