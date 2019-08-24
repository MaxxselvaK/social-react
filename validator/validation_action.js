const { check, validationResult } = require('express-validator');
exports.createPostValidator = (req, res, next) => {
	//title
	check('title', 'write a title').notEmpty();
	check('title', 'title must be more than 10 letters').isLength({
		min: 10,
		max: 200
	});
	//body
	check('body', 'write a body').notEmpty();
	check('body', 'body must be more than 10 letters').isLength({
		min: 10,
		max: 200
	});

	const errors = validationResult(req);
	console.log('er');
	if (errors) {
		console.log('errora');
		const ferror = errors.map((error) => error.msg)[0];
		res.status(400).json({
			error: ferror
		});
	}
	next();
};
