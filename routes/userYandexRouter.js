const Router = require('express');
const router = new Router();
const { UserYandex } = require('../models/models');

router.post('/auth/yandex', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email обязателен' });
    }

    let user = await UserYandex.findOne({ where: { email } });

    if (!user) {
      user = await UserYandex.create({ email });
    }

    return res.json(user);
  } catch (error) {
    console.error('Ошибка при сохранении пользователя:', error);
    return res.status(500).json({ message: 'Ошибка сервера' });
  }
});

module.exports = router;
