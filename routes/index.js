const Router = require('express')

const router = new Router()
const productsRouter = require('./productsRouter')
const userRouter = require('./userRouter')
const typeRouter = require('./typeRouter')
const ordersRouter = require('./ordersRouter')

router.use('/user', userRouter)
router.use('/type', typeRouter)
router.use('/product', productsRouter)
router.use('/orders', ordersRouter)

module.exports = router
