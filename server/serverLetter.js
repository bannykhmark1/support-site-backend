const nodemailer = require('nodemailer');

const sendEmail = async (orderDetails) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'hooppooh36@gmail.com', // ваш gmail адрес
            pass: 'bananza777S' // ваш пароль
        }
    });

    const mailOptions = {
        from: 'hooppooh36@gmail.com',
        to: 'bannykhmark@yandex.ru',
        subject: 'Новый заказ',
        text: `Имя: ${orderDetails.name}\nТелефон: ${orderDetails.phone}\nАдрес: ${orderDetails.address}\nПродукт: ${orderDetails.product.name}`
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Email sent successfully.');
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
};

module.exports = {
    sendEmail
};