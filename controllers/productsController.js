const { Product, ProductInfo } = require('../models/models');
const ApiError = require('../error/ApiError');
const { Op } = require('sequelize');
const path = require('path');
const uuid = require('uuid');

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
            await img.mv(uploadPath, err => {
                if (err) {
                    return next(ApiError.internal('File upload failed'));
                }
            });

            const product = await Product.create({
                name, 
                price, 
                rating, 
                typeId, 
                img: fileName 
            });

            if (info) {
                info = JSON.parse(info);
                const infoPromises = info.map(i => 
                    ProductInfo.create({
                        title: i.title,
                        description: i.description,
                        productId: product.id
                    })
                );
                await Promise.all(infoPromises);
            }

            return res.json(product);
        } catch (e) {
            next(ApiError.badRequest(e.message));
        }
    }

    async getAll(req, res, next) {
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
            const products = await Product.findAndCountAll({ where, limit, offset });
            return res.json(products);
        } catch (error) {
            next(error);
        }
    }

    

    async getOne(req, res, next) {
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
            next(error);
        }
    }

    async delete(req, res, next) {
        const { id } = req.params;
        try {
            const product = await Product.findByPk(id);
            if (!product) {
                return res.status(404).json({ message: 'Продукт не найден' });
            }
            await product.destroy();
            return res.sendStatus(204); // 204 - No Content
        } catch (error) {
            next(error);
        }
    }

}

module.exports = new ProductsController();