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

// Маршрут для начала авторизации через Яндекс
app.get('/', async (req, res) => {
  const code = req.query.code;
  console.log(code)
  try {
    const tokenResponse = await axios.post('https://oauth.yandex.ru/token', null, {
      params: {
        grant_type: 'authorization_code',
        code: code,
        client_id: process.env.YANDEX_CLIENT_ID,
        client_secret: process.env.YANDEX_CLIENT_SECRET,
        redirect_uri: 'https://support.hobbs-it.ru/'
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
      res.redirect(`https://support.hobbs-it.ru?data=${encodeURIComponent(JSON.stringify(userInfoResponse.data))}`);
    } else {
      res.redirect('https://support.hobbs-it.ru/');
    }
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
