var express = require('express');
var router = express.Router();
var parser = require('./../libs/parser');
var movieDownloader = require('./../libs/movieDownloader');
var subtitlesDownloader = require('./../libs/subtitlesDownloader');
var async = require('async');

/* GET home page. */

    // /watch/<int:imdb_id>/<string:title>/<string:magnet_720>/<string:magnet_1080>
router.get('/watch/:id/:title/:magnet720/:magnet1080', function(req, res, next) {
    var upload = {
		id			: req.param('id'),
		title		: req.param('title'),
		magnetLow	: req.param('magnet720'),
		magnetHigh	: req.param('magnet1080')
    };

    //movie

    var magnets = new Array();  // input array, consists of magnet links
    var names   = new Array();  // array of file names
    var paths   = new Array();  // array consists of links to videos

    // magnets.push(upload.magnetLow); // 720p
    // magnets.push(upload.magnetHigh); // 1080p

    magnets.push(upload.magnetLow); // 720p
    magnets.push(upload.magnetHigh); // 1080p

    names.push(upload.title + '720p.mp4');
    names.push(upload.title + '1080p.mp4');

    for (var i = 0; i < 2; i++) {
        movieDownloader(magnets[i], names[i]);
        paths.push('public/videos/' + names[i]);
    }

    function myFunc() {
        console.log(paths); // output array: [0] is 720p video, [1] is 1080p video
    }

    setTimeout(myFunc, 500);

    // sub

    var arr = new Array();

    subtitlesDownloader(upload.id, arr, (f) => {
        console.log('aaaaa', f);
    });
    // first argument is imdb_id, second - is empty array, which after running the
    // function will return an array of [0] - en, [1] - ru subtitles path

    // function myFunc1() {
    //     console.log(arr);
    // }
    //
    // setTimeout(myFunc1, 1000);

    setTimeout(() => {
        res.send({
            movie_url: paths,
            subtitles_url: arr
        });
    }, 2000);

    // res.send(upload);
});




router.get('/search/:searchword/:start/:end', function(req, res, next) {
    var search = {
        word        : req.param('searchword') == 'null' ? '' : req.param('searchword'),
        start		: req.param('start'),
        end 		: req.param('end')
    };
    parser(search.start, search.word, (data) => {
        res.send({err:null, res: data});
    });
});


router.get('/', function(req, res, next) {
	res.render('index', { title: 'Express' });
});

router.post('/find', function(req, res, next) {
	var start = req.body.start ? req.body.start : 0;
	parser(start, req.body.film, (data) => {
		res.send({err:null, res: data});
	});
});


module.exports = router;
