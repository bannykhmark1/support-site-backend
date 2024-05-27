const uuid = require('uuid');
const path = require('path');
const { Product, ProductInfo } = require('../models/models');
const ApiError = require('../error/ApiError');

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
                info.forEach(i =>
                    ProductInfo.create({
                        title: i.title,
                        description: i.description,
                        productId: product.id
                    })
                );
            }

            return res.json(product);
        } catch (e) {
            next(ApiError.badRequest(e.message));
        }
    }

    async getAll(req, res) {
        let { typeId, limit, page } = req.query;
        page = page || 1;
        limit = limit || 9;
        let offset = page * limit - limit;
        let products;

        if (typeId) {
            products = await Product.findAndCountAll({ where: { typeId }, limit, offset });
        } else {
            products = await Product.findAndCountAll({ limit, offset });
        }

        return res.json(products);
    }

    async getOne(req, res) {
        const { id } = req.params;
        const product = await Product.findOne({
            where: { id },
            include: [{ model: ProductInfo, as: 'info' }]
        });

        return res.json(product);
    }
}

module.exports = new ProductsController();