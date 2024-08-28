const Router = require('express');
const router = new Router();
const { UserYandex } = require('../models/models');

// Сохранение пользователя (POST запрос)
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

// Получение данных о пользователе (GET запрос)
router.get('/auth/yandex/:email', async (req, res) => {
  try {
    const { email } = req.params;

    if (!email) {
      return res.status(400).json({ message: 'Email обязателен' });
    }

    const user = await UserYandex.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    return res.json(user);
  } catch (error) {
    console.error('Ошибка при получении данных о пользователе:', error);
    return res.status(500).json({ message: 'Ошибка сервера' });
  }
});

module.exports = router;
