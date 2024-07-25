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

// Функция для получения токена доступа Яндекс
async function getYandexToken(code) {
  try {
    const response = await axios.post('https://oauth.yandex.ru/token', new URLSearchParams({
      grant_type: 'authorization_code',
      code: code,
      client_id: process.env.YANDEX_CLIENT_ID,
      client_secret: process.env.YANDEX_CLIENT_SECRET,
      redirect_uri: 'https://support.hobbs-it.ru/' // Убедитесь, что это правильный URL редиректа
    }), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    console.log('Access Token:', response.data.access_token);
    return response.data.access_token;
  } catch (error) {
    console.error('Ошибка авторизации:', error);
    throw error;
  }
}

// Маршрут для начала авторизации через Яндекс
app.post('/api/auth/yandex', async (req, res) => {
  const { code } = req.body;

  try {
    const accessToken = await getYandexToken(code);
    const userInfoResponse = await axios.get('https://login.yandex.ru/info', {
      headers: {
        Authorization: `OAuth ${accessToken}`
      }
    });

    // Сохранение данных пользователя или токена в сессии
    req.session.user = userInfoResponse.data;
    res.json(userInfoResponse.data);
  } catch (error) {
    console.error('Ошибка авторизации:', error);
    res.status(500).send('Ошибка авторизации');
  }
});

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
