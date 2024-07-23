require('dotenv').config();
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
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
const authYandexMiddleware = require('./middleware/authYandexMiddleware'); // Импортируем middleware
const nodemailer = require('nodemailer');

const PORT = process.env.PORT || 5000;

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Настройка сессий
app.use(session({
  secret: process.env.SESSION_SECRET || 'your_secret_key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: process.env.NODE_ENV === 'production' }
}));

// Обработчики WebSocket
wss.on('connection', (ws) => {
    console.log('Новое соединение WebSocket');

    ws.on('message', (message) => {
        console.log('получено: %s', message);
        ws.send(`Ваше сообщение получено: ${message}`);
    });

    ws.on('close', () => {
        console.log('Соединение WebSocket закрыто');
    });

    ws.send('Добро пожаловать на сервер WebSocket');
});

app.use(cors());
app.use(express.json());
app.use(express.static(path.resolve(__dirname, 'static')));
app.use(fileUpload({ createParentPath: true }));

// Маршрут для начала авторизации через Яндекс
app.get('/auth/yandex/callback', async (req, res) => {
  const code = req.query.code;
  try {
    const tokenResponse = await axios.post('https://oauth.yandex.ru/token', null, {
      params: {
        grant_type: 'authorization_code',
        code: code,
        client_id: process.env.YANDEX_CLIENT_ID,
        client_secret: process.env.YANDEX_CLIENT_SECRET,
        redirect_uri: 'https://support.hobbs-it.ru/auth/yandex/callback'
      }
    });

    const accessToken = tokenResponse.data.access_token;
    const userInfoResponse = await axios.get('https://login.yandex.ru/info', {
      headers: {
        Authorization: `OAuth ${accessToken}`
      }
    });

    const userEmail = userInfoResponse.data.default_email;
    const userDomain = userEmail.split('@')[1];

    if (userDomain === 'kurganmk' || userDomain === 'hobbs-it') {
      req.session.user = userInfoResponse.data;
      res.redirect(`https://support.hobbs-it.ru/profile?data=${encodeURIComponent(JSON.stringify(userInfoResponse.data))}`);
    } else {
      res.redirect('https://support.hobbs-it.ru/');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Ошибка авторизации');
  }
});

// Применение middleware для защищенных маршрутов
app.use('/api/user', authYandexMiddleware, userRouter);
app.use('/api/announcements', authYandexMiddleware, announcementRouter);

// Маршруты API
app.use('/api', router);

// Обработка ошибок
app.use(errorHandler);

const start = async () => {
    try {
        await sequelize.authenticate();
        await sequelize.sync();
        server.listen(PORT, () => console.log(`Сервер запущен на порту ${PORT}`));
    } catch (e) {
        console.error(e);
    }
};

start();
