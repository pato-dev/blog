require('dotenv').config();
const connection = require('./db');
const express = require('express');
const app = express();
const cors = require('cors');
const port = process.env.PORT
const userRoute = require('./routes/users')
const postRoute = require('./routes/articles')
const answerRoute = require('./routes/answers')
const bodyParser = require('body-parser');
const multer = require('multer');

// DB connection
connection()
// middlewares
app.use(
    cors({
        origin: "http://localhost:3000",
        methods: "GET,POST,PUT,DELETE",
        credentials: true,
    })
);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false, limit: '500mb' }));

global.publicPath = __dirname + '/public'
app.use(function (req, res, next) {
    global.req = req;
    next()
});
// routes
app.use("/api", userRoute);
app.use("/api", postRoute);
app.use("/api", answerRoute);

app.listen(port, () => {
    console.log('Server is up on ' + port)
})