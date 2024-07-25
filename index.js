require('dotenv').config();
const express = require('express');
const axios = require('axios');
const sequelize = require('./db');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const path = require('path');
const session = require('express-session');
const passport = require('passport');
const YandexStrategy = require('passport-yandex-oauth2').Strategy;
const errorHandler = require('./middleware/ErrorHandlingMiddleware');
const router = require('./routes/index');
const userRouter = require('./routes/userRouter');
const announcementRouter = require('./routes/announcementRouter');
const User = require('./models/user'); // Подключение модели пользователя

const PORT = process.env.PORT || 5000;

const app = express();

// Настройка сессий
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Для разработки используйте secure: false, для продакшн среды установите true
}));

// Настройка Passport для авторизации через Яндекс
passport.use(new YandexStrategy({
  clientID: process.env.YANDEX_CLIENT_ID,
  clientSecret: process.env.YANDEX_CLIENT_SECRET,
  callbackURL: 'https://support.hobbs-it.ru/auth/yandex/callback'
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({ where: { yandexId: profile.id } });
    if (!user) {
      user = await User.create({
        yandexId: profile.id,
        displayName: profile.displayName,
        email: profile.emails[0].value
      });
    }
    return done(null, user);
  } catch (error) {
    return done(error);
  }
}));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findByPk(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

app.use(passport.initialize());
app.use(passport.session());

app.use(cors());
app.use(express.json());
app.use(express.static(path.resolve(__dirname, 'static')));
app.use(fileUpload({ createParentPath: true }));

// Маршрут для начала авторизации через Яндекс
app.get('/auth/yandex/login', passport.authenticate('yandex'));

// Маршрут для обработки обратного вызова от Яндекса
app.get('/auth/yandex/callback', 
  passport.authenticate('yandex', { failureRedirect: '/' }),
  (req, res) => {
    res.redirect('/'); // Перенаправление после успешной аутентификации
  }
);

// Маршрут для выхода из системы
app.get('/auth/yandex/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});

// Маршрут для получения данных текущего пользователя через Яндекс
app.get('/auth/yandex/user', (req, res) => {
  res.send(req.user);
});

// Функция для получения токена доступа Яндекс (для примера, если требуется)
async function getYandexToken(code) {
  try {
    const response = await axios.post('https://oauth.yandex.ru/token', new URLSearchParams({
      grant_type: 'authorization_code',
      code: code,
      client_id: process.env.YANDEX_CLIENT_ID,
      client_secret: process.env.YANDEX_CLIENT_SECRET,
      redirect_uri: 'https://support.hobbs-it.ru/auth/yandex/callback' // Убедитесь, что это правильный URL редиректа
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
