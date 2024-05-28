const ApiError = require('../error/ApiError');
const nodemailer = require('nodemailer');

class OrdersController {
    async send(req, res, next) {
        try {
          const { name, email, message } = req.body;

          const transporter = nodemailer.createTransport({
              service: 'gmail', // Можно использовать другой сервис
              auth: {
                  user: 'techniquepasha@gmail.com', // Это нужно засунуть в .env
                  pass: 'enqk ovsg zwbz vuuh' // Это нужно засунуть в .env
              }
          });
      
          // Настройка письма
          const mailOptions = {
              from: 'techniquepasha@gmail.com',
              to: 'valokoshka@gmail.com', // Email получателя
              subject: 'Test send form',
              text: `Имя: ${name}\nEmail: ${email}\nСообщение: ${message}`
          };
      
          // Отправка письма
          transporter.sendMail(mailOptions, (error, info) => {
              if (error) {
                  return res.status(500).send(error.toString());
              }
              res.status(200).send('Письмо успешно отправлено');
          });
        } catch (e) {
            next(ApiError.badRequest(e.message));
        }
    }
}

module.exports = new OrdersController();