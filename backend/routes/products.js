const express = require('express');
const {Product} = require("../models/product");
const {Category} = require("../models/category");
const router = express.Router();
const mongoose = require('mongoose');

router.get(`/`,async (req, res) => {
    let filter = {};
    if (req.query.categories){
        filter = { category: { $in: req.query.categories.split(",") } };

    }
    const products = await Product.find(filter).populate('category');
    if (!products) {
        return res.status(500).json({
            success: false,
        })
    }
    res.send(products);
})

router.get(`/:id`,async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).send({
            success: false,
            message: 'Invalid Product Id',
        })
    }
    const product = await Product.findById(req.params.id).populate('category');
    if (!product) {
        return res.status(500).json({
            success: false,

        })
    }
    res.send(product);
})

router.patch("/:id",async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).send({
            success: false,
            message: 'Invalid Product Id',
        })
    }
    const category = await Category.findById(req.body.category);
    if (!category) {
        return res.status(404).send({
            success: false,
            message: 'Category not found'
        })
    }
    const product = await Product.findByIdAndUpdate(
        req.params.id ,
        {
            name: req.body.name,
            description: req.body.description,
            richDescription: req.body.richDescription,
            image: req.body.image,
            brand: req.body.brand,
            price: req.body.price,
            category: req.body.category,
            countInStock: req.body.countInStock,
            rating: req.body.rating,
            numReviews: req.body.numReviews,
            isFeatured: req.body.isFeatured,
        },
        {
            new: true
        }
    );
    if (!product) {
        return res.status(404).json({
            success: false,
            message: 'Product not found'
        })
    }
    res.status(200).json({
        success: true,
        product: product
    })
})

router.post(`/`, async (req, res) => {
    const category = await Category.findById(req.body.category);
    if (!category) {
        return res.status(404).send({
            success: false,
            message: 'Category not found'
        })
    }
    let product = new Product({
        name: req.body.name,
        description: req.body.description,
        richDescription: req.body.richDescription,
        image: req.body.image,
        brand: req.body.brand,
        price: req.body.price,
        category: req.body.category,
        countInStock: req.body.countInStock,
        rating: req.body.rating,
        numReviews: req.body.numReviews,
        isFeatured: req.body.isFeatured,
    });
    product = await product.save();
    if (!product){
        return res.status(500).send({
            success: false,
            message: 'Product not created',
        })
    }
    return res.status(200).send({
        success: true,
        message: 'Product added successfully',
    })
})

router.delete('/:id',async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).send({
            success: false,
            message: 'Invalid Product Id',
        })
    }
    Product.findByIdAndDelete(req.params.id)
        .then((product) => {
            if (product) {
                return res.status(200).send({
                    success: true,
                    'message': 'Product deleted successfully',
                })
            }
            else {
                return res.status(404).send({
                    'success': false,
                    'message': 'Product not found',
                })
            }
        })
        .catch((err) => {
            return res.status(500).send({
                success: false,
                'message': 'Error while deleting category',
            })
        })
})

router.get('/get/count' ,  async (req, res) => {
    const productCount = await Product.countDocuments();
    if (!productCount) {
        return res.status(500).json({
            success: false
        })
    }
    res.send({
        count: productCount
    });
})

router.get('/get/featured/:count' ,  async (req, res) => {
    const count = req.params.count ?? 0;
    const products = await Product.find({isFeatured: true}).limit(+count);
    if (!products) {
        return res.status(500).json({
            success: false
        })
    }
    res.send({
        products: products
    });
})

module.exports = router;