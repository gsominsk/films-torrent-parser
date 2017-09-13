var express = require('express');
var router = express.Router();
var parser = require('./../libs/parser');

/* GET home page. */
router.get('/', function(req, res, next) {
	res.render('index', { title: 'Express' });
});

router.post('/find', function(req, res, next) {
	let start = req.body.start ? req.body.start : 0;

	parser(start, req.body.film, (data) => {
		res.end(JSON.stringify({err:null, res: data}));
	});
});

module.exports = router;
