const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const morgan = require('morgan');
const mongoose = require('mongoose');
const productRouter =  require('./routes/products');
const categoryRouter =  require('./routes/categories');
const orderRouter =  require('./routes/orders');
const userRouter =  require('./routes/users');
const cors = require('cors');
const authJwt = require("./helpers/jwt");
const errorHandler = require("./helpers/error-handler");

require('dotenv/config');
app.use(cors());
const api = process.env.API_URL;

// ** middlewares
app.use(bodyParser.json());
app.use(morgan('tiny'));
app.use(authJwt())
app.use(errorHandler)

// ** routers
app.use(`${api}/products` , productRouter);
app.use(`${api}/categories` , categoryRouter);
app.use(`${api}/orders` , orderRouter);
app.use(`${api}/users` , userRouter);

//** Database connection
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

