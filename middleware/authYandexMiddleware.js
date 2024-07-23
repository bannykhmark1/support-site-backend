const authYandexMiddleware = (req, res, next) => {
    if (!req.session || !req.session.user) {
        return res.redirect('/auth/yandex');
    }
    next();
};

module.exports = authYandexMiddleware;
