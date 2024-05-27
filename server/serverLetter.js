const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const cors = require('cors');

const router = express.Router();

router.use(bodyParser.json());
router.use(cors());

const transporter = nodemailer.createTransport({
    service: 'yandex',
    auth: {
        user: 'bannykhmark@yandex.ru',
        pass: 'bananza777S'
    }
});

router.post('/send', (req, res) => {
    const { name, phone, address, product } = req.body;

    const mailOptions = {
        from: 'hooppooh36@gmail.com',
        to: 'bannykhmark@yandex.ru',
        subject: 'Новый заказ',
        text: `Имя: ${name}\nТелефон: ${phone}\nАдрес: ${address}\nТовар: ${product.name}`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error while sending email:', error);
            return res.status(500).send(error.toString());
        }
        res.status(200).send('Email sent: ' + info.response);
    });
});

module.exports = router;