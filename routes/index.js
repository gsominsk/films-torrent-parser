var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
	console.log('haa haaa');
  res.render('index', { title: 'Express' });
});

router.post('/find', function(req, res, next) {
	console.log('check2 check2');
	res.send(JSON.stringify({err:null, info: 'success'}));
});

module.exports = router;
