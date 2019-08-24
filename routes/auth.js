const express = require('express');
const { signup, signin, signout } = require('../controllers/auth');
const { userById } = require('../controllers/user');
const router = express.Router();
//const validator = require('../validator/validation_action.js');
router.post('/signup', signup);
router.post('/signin', signin);
router.get('/signout', signout);

module.exports = router;
