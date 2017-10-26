var fs = require('fs');
var path = require('path');

var torrentStream = require('torrent-stream');

var downloadMovie = (magnet, name) => {
    return new Promise(resolve => {
        var engine = torrentStream(magnet, {
            path: 'tmp/videos/',
        });

        var videos = 'public/videos';

        var count = 0;
        var filesNum = 0;

        engine.on('ready', function () {
            engine.files.forEach(function (file) {
                var format = file.name.split('.').pop();
                filesNum = filesNum + 1;
                // console.log('filename:', file.name);
                if (format === 'mp4' || format === 'webm' || format === 'ogg' || format === 'mkv') {
	                var stream = file.createReadStream();
                    if (!fs.existsSync(videos)){
                        fs.mkdirSync(videos);
                    }
	                console.log('matching movie format');
                    console.log('path is the following: ' + videos + '/' + name);
                    stream.pipe(fs.createWriteStream(videos + '/' + name));
	                // out = videos + '/' + file.name;
	                // resolve(out);
                }
                else {
                    console.log('non-supported video format or other type of file');
                }
            })
        })

        engine.on('idle', function () {
            console.log('Torrent stream is being idle now');
            count = count + 1;
            if (count === filesNum) {
                console.log('Movie has been downloaded successfully!');
                return 1;
            }
        })
    })
};


module.exports = function (magnet, name) {
	downloadMovie(magnet, name)
};