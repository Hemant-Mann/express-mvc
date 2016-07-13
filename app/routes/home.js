var express = require('express');
var router = express.Router();
var Home = require('../controllers/home');

/* GET home page. */
router.get('/', function (req, res, next) {
	// when method can not be inferred from url manually set the method
    Home._init(req, res, next, { method: 'index' });
});

var urlRegex = Home._public();
router.get(urlRegex, function (req, res, next) {
	Home._init(req, res, next);
});

module.exports = router;
