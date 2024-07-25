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

const PORT = process.env.PORT || 5000;

const app = express();

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

// Обработка обратного вызова авторизации с Яндекса
app.get('/', async (req, res) => {
  const code = req.query.code;
  const cid = req.query.cid;
  
  if (code && cid) {
    try {
      const tokenResponse = await axios.post('https://oauth.yandex.ru/token', null, {
        params: {
          grant_type: 'authorization_code',
          code: code,
          client_id: process.env.YANDEX_CLIENT_ID,
          client_secret: process.env.YANДЕКС_CLIENT_SECRET,
          redirect_uri: 'https://support.hobbs-it.ru/' // Убедитесь, что этот URL совпадает с тем, который вы зарегистрировали в настройках Яндекс OAuth
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
        console.log('User session data:', req.session.user);
        res.redirect(`https://support.hobbs-it.ru?data=${encodeURIComponent(JSON.stringify(userInfoResponse.data))}`);
      } else {
        res.redirect('https://support.hobbs-it.ru/');
      }
    } catch (error) {
      console.error('Ошибка авторизации:', error);
      res.status(500).send('Ошибка авторизации');
    }
  } else {
    res.sendFile(path.resolve(__dirname, 'static', 'index.html'));
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
