const express = require('express');
const router = express.Router();

const {
	userById,
	allUsers,
	getUser,
	updateUser,
	deleteUser,
	userPhoto,
	addFollower,
	addFollowing,
	removeFollower,
	removeFollowing,
	findPeople
} = require('../controllers/user');
const { requireSignin } = require('../controllers/auth');

router.put('/user/follow', requireSignin, addFollowing, addFollower);
router.put('/user/unfollow', requireSignin, removeFollowing, removeFollower);

router.put('/user/:userId', requireSignin, updateUser);
//any request that contains userById that will first execute userById()
router.param('userId', userById);
router.get('/users', allUsers);
router.get('/user/:userId', requireSignin, getUser);
router.get('/user/photo/:userId', userPhoto);

router.delete('/user/:userId', requireSignin, deleteUser);

//who to follow
router.get('/user/findpeople/:userId', requireSignin, findPeople);
module.exports = router;
