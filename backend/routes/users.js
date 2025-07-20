const express = require('express');
const {User} = require("../models/user");
const router = express.Router();


router.get(`/`,async (req, res) => {
    const user = await User.find();
    if (!user) {
        return res.status(500).json({
            success: false,
        })
    }
    res.send(User);
})

module.exports = router;