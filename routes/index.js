var express = require('express');
var router = express.Router();
var parser = require('./../libs/parser');
var downloader = require('./../libs/downloader');
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

    var arr = new Array();

    subtitlesDownloader(upload.id, arr); // first argument is imdb_id, second - is empty array, which after running the
    // function will return an array of [0] - en, [1] - ru subtitles path

    setTimeout(myFunc, 1000);

    var magnets = new Array();  // input array, consists of magnet links
    var names   = new Array();  // array of file names
    var paths   = new Array();  // array consists of links to videos

    magnets.push(upload.magnetLow); // 720p
    magnets.push(upload.magnetHigh); // 1080р

    names.push(upload.title + '720p.mp4');
    names.push(upload.title + '1080p.mp4');

    for (var i = 0; i < 2; i++) {
        movieDownloader(magnets[i], names[i]);
        paths.push('public/videos/' + names[i]);
    }

    setTimeout(myFunc1, 500);

	setTimeout(() => {
        console.log(arr);
        console.log(paths); // output array: [0] is 720p video, [1] is 1080p video
		console.log('Eto blyad yobanii kostyli ot Arturchika i tak delat ne nado. Eta poebota ne rabotaet.')
		res.send({
            movie_url: paths,
            subtitles_url: arr
        });
	})
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
