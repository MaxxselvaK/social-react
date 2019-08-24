const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const port = 8080;
const expressValidator = require('express-validator');
const mongoose = require('mongoose');
const postRoutes = require('./routes/post');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
const morgan = require('morgan');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');

//using cross origin request
app.use(cors());
//use middleware
app.use(morgan('dev'));
//parsing request params
app.use(bodyParser.json());
app.use(cookieParser());
//validation
//app.use(expressValidator);
dotenv.config();
//db

mongoose
	.connect('mongodb://localhost:27017/social', {
		useNewUrlParser: true
	})
	.then(() => console.log('db connected'))
	.catch((err) => console.log('could not connect to mongo ', err));

mongoose.connection.on('error', (err) => {
	console.log(`error in connection ${err.message}`);
});

app.use('/', postRoutes);
app.use('/', authRoutes);
app.use('/', userRoutes);
app.use(function(err, req, res, next) {
	if (err.name === 'UnauthorizedError') {
		res.status(401).send('Authorization error');
	}
});

app.listen(process.env.PORT || 8080, () => {
	console.log('server started in port 8080');
});
