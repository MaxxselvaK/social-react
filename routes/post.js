const express = require('express');
const { checkSchema } = require('express-validator');
const {
	createPost,
	getPosts,
	postsByUser,
	postById,
	updatePost,
	isPoster,
	deletePost
} = require('../controllers/post');
const router = express.Router(); //accessing express router
const validator = require('../validator/validation_action');
const { userById } = require('../controllers/user');
const { requireSignin } = require('../controllers/auth');

//console.log('router');

router.get('/', getPosts);
router.post('/post/new/:userId', requireSignin, checkSchema(validator.createPostValidator), createPost);
router.get('/posts/by/:userId', requireSignin, postsByUser);

router.delete('/post/:postId', requireSignin, isPoster, deletePost);
router.put('/post/:postId', updatePost);
//any request that contains userById that will first execute userById()
router.param('userId', userById);
router.param('postId', postById);
module.exports = router; //so that we can use express router
