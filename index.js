
require('dotenv').config();
const express = require('express');
const sequelize = require('./db'); // Убедитесь, что это правильный путь к файлу db.js
const models = require('./models/models'); // Убедитесь, что это правильный путь к файлу models.js
const cors = require('cors');
const fileUpload = require('express-fileupload');
const path = require('path');
const errorHandler = require('./middleware/ErrorHandlingMiddleware'); // Убедитесь, что это правильный путь к файлу middleware/ErrorHandlingMiddleware.js
const router = require('./routes/index'); // Убедитесь, что это правильный путь к файлу index.js
const reviewRouter = require('./routes/reviewRouter'); // Убедитесь, что это правильный путь к файлу reviewRouter.js
const productsRouter = require('./routes/productsRouter'); // Убедитесь, что это правильный путь к файлу productsRouter.js
const userRouter = require('./routes/userRouter'); // Убедитесь, что это правильный путь к файлу userRouter.js
const nodemailer = require('nodemailer');

// Использование переменных окружения для настройки Nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER || 'hooppooh36@gmail.com',
        pass: process.env.EMAIL_PASS || 'your_application_password'
    }
});

const PORT = process.env.PORT || 5000;

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.resolve(__dirname, 'static')));
app.use(fileUpload({
  createParentPath: true
}));

// Маршрут для отправки email
app.post('/send', async (req, res) => {
    const { name, phone, address, product } = req.body;

    const mailOptions = {
        from: process.env.EMAIL_USER || 'hooppooh36@gmail.com',
        to: 'sppgtmailer@yandex.ru',
        subject: 'Новый заказ',
        text: `Имя: ${name}\nТелефон: ${phone}\nАдрес: ${address}\nПродукт: ${product}`
    };
  
    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent: ' + info.response);
        res.status(200).json({ message: 'Email sent successfully' });
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ message: 'Error sending email', error });
    }
});

// Mount routers
app.use('/api', router);
app.use('/api/reviews', reviewRouter);
app.use('/api/products', productsRouter);

// Error handling middleware должен быть вызван в самом конце
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
