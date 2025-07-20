const express = require('express');
const {Categories} = require("../models/category");
const router = express.Router();


router.get(`/`,async (req, res) => {
    const categories = await Categories.find();
    if (!categories) {
        return res.status(500).json({
            success: false,
        })
    }
    res.send(categories);
})

module.exports = router;