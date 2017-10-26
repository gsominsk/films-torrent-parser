var fs = require('fs-extra');

var download = require('url-download');
var srt2vtt = require('srt2vtt');

var OS = require('opensubtitles-api');

var OpenSubtitles = new OS({
	useragent:'OSTestUserAgentTemp',
	username: 'hypertube42',
	password: '111111',
	ssl: true
});


OpenSubtitles.login()
	.then(res => {
		// console.log(res.token);
		// console.log(res.userinfo);
	})
	.catch(err => {
		console.log(err);
	});

var searchAndDownloadSubtitles = function(imdb_id, out) {
	// var out = new Array();   // THAT IS MANDATORY PARAMETER FOR A FUNCTION
	// var imdb_id = '1253863'; // THAT IS MANDATORY PARAMETER FOR A FUNCTION

	OpenSubtitles.search({
		sublanguageid: 'eng, rus',       // Can be an array.join, 'all', or be omitted.
	                                //   is included.
		limit: '1',                 // Can be 'best', 'all' or an
	                                // arbitrary nb. Defaults to 'best'
		imdbid: imdb_id          // Value from function parameter
	}).then(subtitles => {
		// an array of objects, no duplicates (ordered by
		// matching + uploader, with total downloads as fallback)

		// console.log("##### SUBTITLES GO HERE #####");
		// console.log(subtitles);
		// console.log("######### DOWNLOAD SUBTITLES #########");
		downloadSubtitles(subtitles)
			.then(function(arr) {
			// 	console.log("English Subtitles: " + sub[0]);
			// 	console.log("Russian Subtitles: " + sub[1]);
			//  console.log("subtitles downloaded successfully");
			// 	out.push('./public/captions/' + subtitles.en[0].id + '.vtt');
			// 	out.push('./public/captions/' + subtitles.ru[0].id + '.vtt');
				out.push(arr[0] + '.vtt');
				out.push(arr[1] + '.vtt');
				// console.log(out);
			});
	});
};

var downloadSubtitles = (subtitles) => {
	return new Promise(resolve => {
		var subArray = new Array();
		var path = './public/captions/';
		if (!fs.existsSync(path)) {
			fs.mkdirSync(path);
		}
		download([
			subtitles.en[0].url
		], path)
			.on('close', (err, url, file) => {
				if (err) throw new Error(err);
				// console.log(file);
				subArray.push(file);
				// console.log(subArray);
				// fs.remove(file); // remove .srt file
				download([
					subtitles.ru[0].url
				], path)
					.on('close', (err, url, file) => {
						if (err) throw new Error(err)
						// console.log(file);
						subArray.push(file);
						// console.log(subArray);
						// fs.remove(file); // remove .srt file
						resolve(subArray); // final output
					}).on('done', () => {
					var srtData = fs.readFileSync(subArray[1]);
					srt2vtt(srtData, (err, vttData) => {
						if (err) throw new Error(err);
						fs.writeFileSync(subArray[1] + '.vtt', vttData);
					});
				});
			}).on('done', () => {
			var srtData = fs.readFileSync(subArray[0]);
			srt2vtt(srtData, (err, vttData) => {
				if (err) throw new Error(err)
				fs.writeFileSync(subArray[0] + '.vtt', vttData);
			});
		});
	});
};

module.exports = function (imdb_id, out) {
	searchAndDownloadSubtitles(imdb_id, out)
};
