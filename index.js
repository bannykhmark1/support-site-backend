require('dotenv').config();
const express = require('express');
const http = require('http'); // Для WebSocket
const WebSocket = require('ws'); // Для WebSocket
const axios = require('axios'); // Для HTTP-запросов
const sequelize = require('./db');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const path = require('path');
const errorHandler = require('./middleware/ErrorHandlingMiddleware');
const router = require('./routes/index');
const userRouter = require('./routes/userRouter');
const nodemailer = require('nodemailer');
const announcememntRouter = require('./routes/announcementRouter');

const PORT = process.env.PORT || 5000;

const app = express();
const server = http.createServer(app); // Создаем сервер HTTP
const wss = new WebSocket.Server({ server }); // Создаем WebSocket сервер

// WebSocket обработчики
wss.on('connection', (ws) => {
    console.log('New WebSocket connection');

    ws.on('message', (message) => {
        console.log('received: %s', message);
        // Пример ответа на сообщение
        ws.send(`Received your message: ${message}`);
    });

    ws.on('close', () => {
        console.log('WebSocket connection closed');
    });

    ws.send('Welcome to the WebSocket server');
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
      // Сохранение данных пользователя в сессии
      req.session.user = userInfoResponse.data;
      // Перенаправление на клиентскую часть с данными пользователя
      res.redirect(`https://support.hobbs-it.ru?data=${encodeURIComponent(JSON.stringify(userInfoResponse.data))}`);
    } else {
      // Перенаправление на другой URL
      res.redirect('https://support.hobbs-it.ru/');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Ошибка авторизации');
  }
});

// Маршрут для обработки обратного вызова от Яндекс
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
            // Сохранение данных пользователя в сессии
            req.session.user = userInfoResponse.data;
            // Перенаправление на клиентскую часть с данными пользователя
            res.redirect(`https://support.hobbs-it.ru/profile?data=${encodeURIComponent(JSON.stringify(userInfoResponse.data))}`);
        } else {
            // Перенаправление на другой URL
            res.redirect('https://support.hobbs-it.ru/');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Ошибка авторизации');
    }
});

// Маршруты API
app.use('/api', router);
app.use('/api/user', userRouter);
app.use('/api/announcements', announcememntRouter);

// Обработка ошибок
app.use(errorHandler);

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
