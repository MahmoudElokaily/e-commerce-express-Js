const express = require('express');
const {Category} = require("../models/category");
const mongoose = require("mongoose");
const router = express.Router();


router.get(`/`,async (req, res) => {
    const categories = await Category.find();
    if (!categories) {
        return res.status(500).json({
            success: false,
        })
    }
    res.status(200).send(categories);
})

router.get("/:id",async (req, res) => {
    const category = await Category.findById(req.params.id);
    if (!category) {
        return res.status(404).json({
            success: false,
            message: 'Category not found'
        })
    }
    return res.status(200).json({
        success: true,
        category: category
    });
})

router.patch("/:id",async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).send({
            success: false,
            message: 'Invalid Category Id',
        })
    }
    const category = await Category.findByIdAndUpdate(
        req.params.id ,
        req.body,
{
            new: true
        }
        );
    if (!category) {
        return res.status(404).json({
            success: false,
            message: 'Category not found'
        })
    }
    res.status(200).json({
        success: true,
        category: category
    })
})

router.post('/',async (req, res) => {
    let category = new Category({
        name: req.body.name,
        icon: req.body.icon,
        color: req.body.color,
    });
   category = await category.save();
   if (!category) {
       return res.status(404).send({
           success: false,
            error: 'Category cannot be created successfully',
       })
   }
   return res.status(201).send({
       success: true,
       'category': category
   })
});

router.delete('/:id',async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).send({
            success: false,
            message: 'Invalid Category Id',
        })
    }
    Category.findByIdAndDelete(req.params.id)
        .then((category) => {
            if (category) {
                return res.status(200).send({
                    success: true,
                    'message': 'Category deleted successfully',
                })
            }
            else {
                return res.status(404).send({
                    'success': false,
                    'message': 'Category not found',
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

module.exports = router;