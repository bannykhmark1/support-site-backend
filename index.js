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
const http = require('http'); 
const WebSocket = require('ws'); 
const jwt = require("jsonwebtoken");

const PORT = process.env.PORT || 5000;
const app = express();

// Разрешённые IP
const allowedIPs = ["85.116.120.50", "94.24.238.242"];

// Middleware для проверки IP или токена
const checkIPMiddleware = (req, res, next) => {
    const clientIP = req.headers["x-forwarded-for"] || req.connection.remoteAddress || req.ip;

    if (allowedIPs.includes(clientIP)) {
        req.user = { role: "guest" }; // Гостевая роль
        return next();
    }

    // Проверяем токен
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
        return res.status(401).json({ message: "Требуется авторизация" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(403).json({ message: "Неверный токен" });
    }
};

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

// Применяем middleware перед маршрутами
app.use('/api', checkIPMiddleware, router);
app.use('/api/user', checkIPMiddleware, userRouter);
app.use('/api/announcements', checkIPMiddleware, announcementRouter);

app.get('/api/check-ip', (req, res) => {
    const allowedIPs = ["85.116.120.50", "94.24.238.242", "194.60.134.75"];
    const clientIP = req.headers["x-forwarded-for"] || req.connection.remoteAddress;

    console.log("Client IP:", clientIP); // Для отладки

    if (allowedIPs.includes(clientIP)) {
        return res.json({ isAllowed: true });
    } else {
        return res.json({ isAllowed: false });
    }
});



// Обработка ошибок
app.use(errorHandler);

// Создание HTTP сервера и WebSocket
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
    console.log('Новое WebSocket подключение');

    ws.on('message', (message) => {
        console.log('Получено сообщение:', message);
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
