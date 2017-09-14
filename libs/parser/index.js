let needle 	= require('needle');
let cheerio = require('cheerio');
let async 	= require('async');

/*
*	Модуль для парсинга двух сайтов, yify.is. torrent-filmi.net
*	Все что нужно это имя фильма по которому будем парсить, сначала
*	парсинг происходит по yify.is и если нету никаких найденных
*	резултатов парсит по второму сайту.
*
* 	В первом варианте все достаточно просто, сначала создаем url на поиск
*   http://yify.is/movie/yifi_filter?keyword={{!!!!!}}&quality=all&genre=all&rating=0&order_by=latest
*   заменяя {{!!!!}} на наше название фильма, дальше парсим html через cheerio и достаем ссылки
*   на каждый из фильмов, как только достали ссылку вызываем парсер что бы достать полную информацию
*   о фильме (картинка, название, рейтинги, описание и магнет ссылки) после чего записываем данные и
*   возвращаем их. Если Парсить нечего пробуем парсить второй сайт, описание ниже..
*
*
*/

function parseYify (start, film, callback) {
	let url 	= 'http://yify.is/movie/yifi_filter'+(start==0?'':'/'+start*20)+'?keyword='+encodeURI(film)+'&quality=all&genre=all&rating=0&order_by=latest';
	let films 	= [];
	let urls 	= [];

	needle.get(url, (err, res) => {
		let $ = cheerio.load(res.body);
		$('.browse-movie-wrap').length == 0 ? callback(urls) : 0;

		let q = async.queue(function (task, callback) {
			urls[urls.length] = task.children[0].next.attribs.href;
			callback();
		}, 20);

		pushToQueue(q, $('.browse-movie-wrap'));

		let promise = new Promise((resolve, reject) => {
			q.drain = function (err) {
				if (err) {
					reject(err);
					return ;
				}
				resolve(urls);
			};
		});

		promise
			.then(
				(result) => {
					let qFilmItem = async.queue(function (url, callback) {
						needle.get(url, (err, res) => {
							let $ = cheerio.load(res.body);
							let data = {
								img		: $('.img-responsive')[0].attribs.src,
								name 	: $('#mobile-movie-info')[0].children[1].children[0].data,
								year	: $('#mobile-movie-info')[0].children[3].children[0].data,
								genres	: $('#mobile-movie-info')[0].children[5].children[0].data,
								time	: $('.tech-spec-info')[0].children[3].children[5].children[2].data,
								magnets	: [],
								synopsis: $('#synopsis')[0].children[3].children[0].data,
								imdbUrl	: '',
								cast	: [],
								imdb	: ''
							};

							data.magnets.push($('.magnet-download')[0].attribs.href);
							data.magnets.push($('.magnet-download')[1].attribs.href);

							for (let i = 0; i < $('.list-cast').length; i++) {
								data.cast.push({
									img	: $('.list-cast')[i].children[1].children[1].children[1].attribs.src,
									name: $('.list-cast')[i].children[3].children[1].children[0].data
								});
							}

							for (let i = 0; i < $('.rating-row').length && $('.rating-row')[i].children[1]; i++) {
								if ($('.rating-row')[i].children[1].attribs.title == "IMDb Rating") {
									data.imdbUrl 	= $('.rating-row')[i].children[1].attribs.href;
									data.imdb 		= $('.rating-row')[i].children[3].children[0].data;
									break ;
								}
							}

							films.push(data);
							callback();
						});
					}, 40);

					qFilmItem.drain = function (err) {
						callback(films);
					};

					pushToQueue(qFilmItem, result);
				},
				(error) => {
					console.log("Rejected: " + error);
				}
			);
	});
}

function pushToQueue (queue, arr) {
    for (let i = 0; i < arr.length; i++) {
        queue.push(arr[i]);
    }
}

class Parsers {
	constructor () {
	}

    parseYifyApi (start, film, callback) {
    	callback([]);
	}

    parseVifyApi (start, film, callback) {
    	callback([]);
	}

    parseYifyWithoutApi (start, film, callback) {
        let url 	= 'http://yify.is/movie/yifi_filter'+(start==0?'':'/'+start*20)+'?keyword='+encodeURI(film)+'&quality=all&genre=all&rating=0&order_by=latest';
        let films 	= [];
        let urls 	= [];

        needle.get(url, (err, res) => {
            let $ = cheerio.load(res.body);
            $('.browse-movie-wrap').length == 0 ? callback(urls) : 0;

            let q = async.queue(function (task, callback) {
                urls[urls.length] = task.children[0].next.attribs.href;
                callback();
            }, 20);

            this.pushToQueue(q, $('.browse-movie-wrap'));

            let promise = new Promise((resolve, reject) => {
                q.drain = function (err) {
                    if (err) {
                        reject(err);
                        return ;
                    }
                    resolve(urls);
                };
            });

            promise
                .then(
                    (result) => {
                        let qFilmItem = async.queue(function (url, callback) {
                            needle.get(url, (err, res) => {
                                let $ = cheerio.load(res.body);
                                let data = {
                                    img		: $('.img-responsive')[0].attribs.src,
                                    name 	: $('#mobile-movie-info')[0].children[1].children[0].data,
                                    year	: $('#mobile-movie-info')[0].children[3].children[0].data,
                                    genres	: $('#mobile-movie-info')[0].children[5].children[0].data,
                                    time	: $('.tech-spec-info')[0].children[3].children[5].children[2].data,
                                    magnets	: [],
                                    synopsis: $('#synopsis')[0].children[3].children[0].data,
                                    imdbUrl	: '',
                                    cast	: [],
                                    imdb	: ''
                                };

                                data.magnets.push($('.magnet-download')[0].attribs.href);
                                data.magnets.push($('.magnet-download')[1].attribs.href);

                                for (let i = 0; i < $('.list-cast').length; i++) {
                                    data.cast.push({
                                        img	: $('.list-cast')[i].children[1].children[1].children[1].attribs.src,
                                        name: $('.list-cast')[i].children[3].children[1].children[0].data
                                    });
                                }

                                for (let i = 0; i < $('.rating-row').length && $('.rating-row')[i].children[1]; i++) {
                                    if ($('.rating-row')[i].children[1].attribs.title == "IMDb Rating") {
                                        data.imdbUrl 	= $('.rating-row')[i].children[1].attribs.href;
                                        data.imdb 		= $('.rating-row')[i].children[3].children[0].data;
                                        break ;
                                    }
                                }

                                films.push(data);
                                callback();
                            });
                        }, 20);

                        qFilmItem.drain = function (err) {
                            callback(films);
                        };

                        this.pushToQueue(qFilmItem, result);
                    },
                    (error) => {
                        console.log("Rejected: " + error);
                    }
                );
        });
	}

	getOwnFunctions () {
        return (Object.getOwnPropertyNames(Parsers.prototype).filter(function (p) {
            return (typeof Parsers.prototype[p] === 'function' && p != 'constructor');
        }));
	}

    pushToQueue (queue, arr) {
    	for (let i = 0; i < arr.length; i++) {
        	queue.push(arr[i]);
    }
}
}

function parse (start, film, func, callback) {
	let parser 		= new Parsers();
	let parserFuncs	= parser.getOwnFunctions();

    if (parserFuncs.length <= func + 1) return callback([]);

	parser[parserFuncs[func]](start, film, (films) => {
		if (films && films.length > 0) {
			return callback(films);
		} else {return parse(start, film, ++func, callback)}
	});
}


module.exports = function (start, film, callback) {

	parse(start, film, 0, (films) => {
		callback(films)
	});

	// let promise = new Promise ((resolve, reject) => {
    //
	// });

	// console.log(parser.getFunctions());

	// let parseByApi = new Promise ((resolve, reject) => {
	// 	parseYifyApi(start, film, (films) => {
	// 		films && films.length > 0 ?
	// 	});
	// });


	// parseYify(start, film, function (films) {
	// 	callback(films);
	// });

	// callback(['dd']);
};