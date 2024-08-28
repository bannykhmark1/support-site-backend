const Router = require('express')

const router = new Router()

const userRouter = require('./userRouter')
const announcementRoutes = require('./announcementRouter');


router.use('/user', userRouter)
router.use('/announcements', announcementRoutes);

module.exports = router
