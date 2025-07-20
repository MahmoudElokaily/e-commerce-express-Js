const express = require('express');
const {Orders} = require("../models/order");
const router = express.Router();


router.get(`/`,async (req, res) => {
    const orders = await Orders.find();
    if (!orders) {
        return res.status(500).json({
            success: false,
        })
    }
    res.send(Orders);
})

module.exports = router;