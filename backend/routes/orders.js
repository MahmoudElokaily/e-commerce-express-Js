const express = require('express');
const {Order} = require("../models/order");
const OrderItem = require("../models/order-item");
const {product, Product} = require("../models/product");
const mongoose = require("mongoose");
const {Category} = require("../models/category");

const router = express.Router();


router.get(`/`,async (req, res) => {
    const orders = await Order.find().populate("user" , "name")
        .populate("user" , "name")
        .populate({path: 'orderItems' , populate: {
                path: 'product',
                select: "name price category",
                populate : 'category',
        }})
        .sort({'dateOrdered': -1});
    if (!orders) {
        return res.status(500).json({
            success: false,
        })
    }
    res.send(orders);
});

router.get(`/:id`,async (req, res) => {
    const order = await Order.findById(req.params.id)
        .populate("user" , "name")
        .populate({path: 'orderItems' , populate: {
                path: 'product',
                select: "name price category",
                populate : 'category',
        }})
    if (!order) {
        return res.status(500).json({
            success: false,
        })
    }
    res.send(order  );
});


router.patch("/:id",async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).send({
            success: false,
            message: 'Invalid Order Id',
        })
    }
    const order = await Order.findByIdAndUpdate(
        req.params.id ,
        {
            status: req.body.status,
        },
        {
            new: true
        }
    );
    if (!order) {
        return res.status(404).json({
            success: false,
            message: 'Order not found'
        })
    }
    res.status(200).json({
        success: true,
        category: order
    })
})

router.post('/',async (req, res) => {
    const orderItemsIds = Promise.all(req.body.orderItems.map(async (item) => {
        let newOrderItem = new OrderItem({
            quantity: item.quantity,
            product: item.product
        });
        newOrderItem = await newOrderItem.save();
        return newOrderItem._id;
    }));
    const orderItemsIdsResolved = await orderItemsIds;
    const totalPrices = await Promise.all(orderItemsIdsResolved.map(async (item) => {
        const orderItem = await OrderItem.findById(item).populate('product' , "price");
        return  orderItem.product.price * orderItem.quantity;
    }))
    const totalPrice = totalPrices.reduce((prev, curr) => prev + curr);
    let order = new Order({
        orderItems: orderItemsIdsResolved,
        shippingAddress1: req.body.shippingAddress1,
        shippingAddress2: req.body.shippingAddress2,
        city: req.body.city,
        zip: req.body.zip,
        country: req.body.country,
        phone: req.body.phone,
        status: req.body.status,
        totalPrice: totalPrice,
        user: req.body.user,
    })
    order = await order.save();
    if (!order) {
        return res.status(404).send({
            success: false,
            error: 'Order cannot be created successfully',
        })
    }
    return res.status(201).send({
        success: true,
        'order': order
    })
});


router.delete('/:id',async (req, res) => {
    try {
        let order = await Order.findById(req.params.id);
        await Promise.all(order.orderItems.map(async (item) => {
            await OrderItem.findByIdAndDelete(item);
        }));
        await Order.findByIdAndDelete(req.params.id);
        return res.status(200).send({
            success: true,
            message: 'Order and associated order items deleted successfully',
        });
    }
    catch (err) {
        return res.status(500).send({
            success: false,
            message: 'Error while deleting order',
            error: err.message,
        });
    }
})


router.get(`/get/total-sales`,async (req, res) => {
    const totalSales = await Order.aggregate([
        {$group: {_id: null , totalSales: {$sum: '$totalPrice'}}},
    ]);
    if (!totalSales) {
        return res.status(500).json({
            success: false,
            message: "Total Sales can't be generated successfully",
        })
    }
    res.send({
        success: true,
        totalSales: totalSales.pop().totalSales
    });
});

router.get('/get/count' ,  async (req, res) => {
    const orderCount = await Order.countDocuments();
    if (!orderCount) {
        return res.status(500).json({
            success: false
        })
    }
    res.send({
        count: orderCount
    });
})

router.get(`/get/user/orders/:userId`,async (req, res) => {
    const orders = await Order.find({user: req.params.userId})
        .populate("user" , "name")
        .populate({path: 'orderItems' , populate: {
                path: 'product',
                select: "name price category",
                populate : 'category',
            }})
        .sort({'dateOrdered': -1});
    if (!orders) {
        return res.status(500).json({
            success: false,
        })
    }
    res.send(orders);
});


module.exports = router;