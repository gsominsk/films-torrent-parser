var express = require('express');
var router = express.Router();
var parser = require('./../libs/parser');
var downloader = require('./../libs/downloader');
var subtitlesDownloader = require('./../libs/subtitlesDownloader')

/* GET home page. */
router.get('/', function(req, res, next) {
	res.render('index', { title: 'Express' });
});

router.get('/test', function(req, res, next) {
	res.render('test', { title: 'Download movie demo' });
});

router.post('/find', function(req, res, next) {
	var start = req.body.start ? req.body.start : 0;

	// parser(start, req.body.film, (data) => {
	// 	// res.send(JSON.stringify({err:null, res: data}));
	// 	// res.status('200').send({
	// 	// 	title: 'Search results',
	// 	// 	films: data
	// 	// });
	// 	res.render('results', {
	// 		title: 'Search results',
	// 		films: data
	// 	});
	// });
	parser(start, req.body.film, (data) => {
		res.send({err:null, res: data});
	});
});

// router.get('/results', function(req, res, next) {
// 	res.render('results', {
// 		title: 'Search results',
// 		films: ['1', '2', '3']
// 	});
// });

router.post('/download', function(req, res, next) {
	var magnet = req.body.magnet;

	console.log(magnet);
	downloader(magnet);
});

router.get('/downloadSubtitles', function(req, res, next) {
	var OS = require('opensubtitles-api');

	var OpenSubtitles = new OS({
		useragent:'OSTestUserAgentTemp',
		username: 'hypertube42',
		password: '111111',
		ssl: true
	});

	OpenSubtitles.login()
		.then(res => {
			console.log(res.token);
			console.log(res.userinfo);
		})
		.catch(err => {
			console.log(err);
		});

	var data; // immitates db variable, which consists of movie info

	OpenSubtitles.search({
		sublanguageid: 'all',       // Can be an array.join, 'all', or be omitted.
		path: 'public/videos/Anomalous.2016.720p.BluRay.x264-[YTS.AG].mp4',        // Complete path to the video file, it allows
	                                //   to automatically calculate 'hash'.
		// filename: 'Anomalous.2016.720p.BluRay.x264-[YTS.AG].mp4',        // The video file name. Better if extension
	                                //   is included.
		extensions: ['srt', 'vtt'], // Accepted extensions, defaults to 'srt'.
		limit: '3',                 // Can be 'best', 'all' or an
	                                // arbitrary nb. Defaults to 'best'
		// query: 'Anomalous',   // Text-based query, this is not recommended.
		gzip: true                  // returns url to gzipped subtitles, defaults to false
	}).then(subtitles => console.log(subtitles)
		// an array of objects, no duplicates (ordered by
		// matching + uploader, with total downloads as fallback)

		// subtitles = Object {
		// 	en: {
		// 		downloads: "432",
		// 			encoding: "ASCII",
		// 			id: "192883746",
		// 			lang: "en",
		// 			langName: "English",
		// 			score: 9,
		// 			url: "http://dl.opensubtitles.org/download/subtitle_file_id",
		// 			filename: "some_movie.tag.srt"
		// 	}
		// 	fr: {
		// 		download: "221",
		// 			encoding: "UTF-8",
		// 			id: "1992536558",
		// 			lang: "fr",
		// 			langName: "French",
		// 			score: 6,
		// 			url: "http://dl.opensubtitles.org/download/subtitle_file_id",
		// 			filename: "some_movie.tag.srt"
		// 	}
		// }
	);

	// console.log(subtitles);
	// console.log(data);
	// downloadSubtitles(subtitles, data);
});


router.get('/watch', function(req, res, next) {
	res.render('watch', { title: 'Watch movie online' });
});

module.exports = router;
