const express = require('express');
const {User} = require("../models/user");
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const {Product} = require("../models/product");
const mongoose = require("mongoose");

router.get(`/`,async (req, res) => {
    const users = await User.find().select('-password');
    if (!users) {
        return res.status(500).json({
            success: false,
        })
    }
    res.send(users);
})

router.get("/:id",async (req, res) => {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
        return res.status(404).json({
            success: false,
            message: 'User not found'
        })
    }
    return res.status(200).json({
        success: true,
        user: user
    });
})


router.post("/login", async (req, res) => {
    const user = await User.findOne({email: req.body.email});
    if (!user) {
        return res.status(400).json({
            success: false,
            message: 'User not found'
        })
    }
    if (user && bcrypt.compareSync(req.body.password , user.password)) {
        const token = jwt.sign(
            {
                userId: user.id,
                isAdmin: user.isAdmin
            },
            process.env.secret,
            {expiresIn: '1d'}
        )
        return res.status(200).json({
            success: true,
            message: 'User Authenticated successfully',
            email: user.email,
            token: token
        })
    }
    return  res.status(400).json({
        success: false,
        message: 'Invalid credentials'
    })

})

router.post('/register',async (req, res) => {
    let user = new User({
        name: req.body.name,
        email: req.body.email,
        password: bcrypt.hashSync(req.body.password , 10),
        phone: req.body.phone,
        isAdmin: req.body.isAdmin,
        street: req.body.street,
        apartment: req.body.apartment,
        zip: req.body.zip,
        city: req.body.city,
        country: req.body.country,
    });
    user = await user.save();
    if (!user) {
        return res.status(404).send({
            success: false,
            error: 'User cannot be created successfully',
        })
    }
    return res.status(201).send({
        success: true,
        'user': user
    })
});

router.get('/get/count' ,  async (req, res) => {
    const usersCount = await User.countDocuments();
    if (!usersCount) {
        return res.status(500).json({
            success: false
        })
    }
    res.send({
        count: usersCount
    });
})

router.delete('/:id',async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).send({
            success: false,
            message: 'Invalid user Id',
        })
    }
    User.findByIdAndDelete(req.params.id)
        .then((user) => {
            if (user) {
                return res.status(200).send({
                    success: true,
                    'message': 'User deleted successfully',
                })
            }
            else {
                return res.status(404).send({
                    'success': false,
                    'message': 'User not found',
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