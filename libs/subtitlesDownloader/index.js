var fs = require('fs');
var path = require('path');


var downloadSubtitles = (subtitles, data) => {
	console.log(data);
	console.log(subtitles);

	return new Promise(resolve => {
		var path = './tmp/captions/';
		var eng = '';
		var rus = '';
		download([
			subtitles.en.url
		], path)
			.on('close', (err, url, file) => {
				eng = file;
			}).on('done', () => {
			var srtData = fs.readFileSync('./' + eng);
			srt2vtt(srtData, (err, vttData) => {
				fs.writeFileSync(path + data.name + 'en.vtt', vttData);
			});
		});
		download([
			subtitles.ru.url
		], path)
			.on('close', (err, url, file) => {
				rus = file;
			}).on('done', () => {
			var srtData = fs.readFileSync('./' + rus);
			srt2vtt(srtData, (err, vttData) => {
				fs.writeFileSync(path + data.name + 'ru.vtt', vttData);
			});
		});
		data.en = 'public/captions/' + data.name + 'en.vtt';
		data.ru = 'public/captions/' + data.name + 'ru.vtt';
		resolve(data);
		console.log('downloadSubtitles function completed successfully!')
	});
};


module.exports = function (subtitles, data) {
	downloadSubtitles(subtitles, data)
};
