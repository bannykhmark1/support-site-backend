const { Product, ProductInfo } = require('../models/models');
const ApiError = require('../error/ApiError');
const { Op } = require('sequelize');

class ProductsController {
    async create(req, res, next) {
        try {
            let { name, price, rating, typeId, info } = req.body;
            const { img } = req.files;

            if (!img) {
                return next(ApiError.badRequest('Image file is required'));
            }

            let fileName = uuid.v4() + path.extname(img.name);
            let uploadPath = path.resolve(__dirname, '..', 'static', fileName);
            img.mv(uploadPath, err => {
                if (err) {
                    return next(ApiError.internal('File upload failed'));
                }
            });

            const product = await Product.create({ name, price, rating, typeId, img: fileName });

            if (info) {
                info = JSON.parse(info);
                for (const i of info) {
                    await ProductInfo.create({
                        title: i.title,
                        description: i.description,
                        productId: product.id
                    });
                }
            }

            return res.json(product);
        } catch (e) {
            next(ApiError.badRequest(e.message));
        }
    }

    async getAll(req, res) {
        const { typeId, limit = 9, page = 1, minPrice, maxPrice } = req.query;
        const offset = (page - 1) * limit;

        let where = {};

        if (typeId) {
            where.typeId = typeId;
        }

        if (minPrice) {
            where.price = { [Op.gte]: parseInt(minPrice) };
        }

        if (maxPrice) {
            if (where.price) {
                where.price[Op.lte] = parseInt(maxPrice);
            } else {
                where.price = { [Op.lte]: parseInt(maxPrice) };
            }
        }

        try {
            const products = await Product.findAndCountAll({
                where,
                limit,
                offset
            });
            return res.json(products);
        } catch (error) {
            return res.status(500).json({ message: 'Ошибка получения продуктов', error });
        }
    }

    async getOne(req, res) {
        const { id } = req.params;
        try {
            const product = await Product.findOne({
                where: { id },
                include: [{ model: ProductInfo, as: 'info' }]
            });

            if (!product) {
                return res.status(404).json({ message: 'Продукт не найден' });
            }

            return res.json(product);
        } catch (error) {
            return res.status(500).json({ message: 'Ошибка получения продукта', error });
        }
    }
}

module.exports = new ProductsController();