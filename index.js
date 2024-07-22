require('dotenv').config();
const express = require('express');
const http = require('http'); // Для WebSocket
const WebSocket = require('ws'); // Для WebSocket
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

const transporter = nodemailer.createTransport({
    service: 'yandex',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

// Маршрут для отправки email (пример)
app.post('/send', async (req, res) => {
    const { name, phone, address, product } = req.body;

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: 'sppgtmailer@yandex.ru',
        subject: 'Новый заказ',
        text: `Имя: ${name}\nТелефон: ${phone}\nАдрес: ${address}\nПродукт: ${product.name}`
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
