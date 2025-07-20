const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const morgan = require('morgan');
const mongoose = require('mongoose');

// ** middlewares
app.use(bodyParser.json());
app.use(morgan('tiny'));

require('dotenv/config');

const api = process.env.API_URL;

app.get(`${api}/products`, (req, res) => {
    const product = {
        id: 1,
        name: 'Hair dresser',
        image: 'some_url',
    }
    res.send(product);
})
app.post(`${api}/products`, (req, res) => {
    const newProduct = req.body;
    res.send(newProduct);
})
//**
mongoose.connect(process.env.CONNECTION_STRING , {
    dbName: process.env.DB_NAME,
})
    .then(() => {
        console.log('✅ Connected to MongoDB 🚀');
    })
    .catch((err) => {
        console.error('❌ MongoDB connection error:', err);
    })

app.listen(3000 , () => {
    console.log('🌐 Server is running at http://localhost:3000');
});