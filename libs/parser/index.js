let needle 	= require('needle');
let cheerio = require('cheerio');
let async 	= require('async');

class parserTools {
	constructor () {
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

class Parsers extends parserTools {
	constructor () {
		super();
	}

	parseYifyWithoutApi (start, film, callback) {
		let url 	= 'http://yify.is/movie/yifi_filter'+(start==0?'':'/'+start)+'?keyword='+encodeURI(film)+'&quality=all&genre=all&rating=0&order_by=latest';
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
					console.log(urls);
					resolve(urls);
				};
			});

		promise
			.then(
				(result) => {
			let qFilmItem = async.queue(function (url, callback) {
				needle.get(url, (err, res) => {
					if (url === 'http://yify.is/movie/view') return callback() ;
					let $ = cheerio.load(res.body);

					let data = {
                        id			: '',
                        title 		: $('#mobile-movie-info').children('h1').text(),
                        year		: $('#mobile-movie-info').children('h2').first().text(),
                        rating		: '',
                        photo_url	: $('.img-responsive')[0].attribs.src,
                        genre		: $('#mobile-movie-info').children('h2').last().text(),
                        director	: $('.directors').children('.list-cast').first().children('.list-cast-info').first().children('a').first().text(),
                        runtime		: $('.tech-spec-info').children('.row').last().children('.tech-spec-element').eq(2).text(),
                        magnets		: [],
                        description	: $('#synopsis').children('p').eq(1).text(),
                        actors		: []
					};

					data.magnets.push($('.magnet-download').eq(0)[0].attribs.href);
					data.magnets.push($('.magnet-download').eq(1)[0].attribs.href);

					// for (let i = 0; i < $('.list-cast').length; i++) {
					// 	data.actors.push(
					// 		' '+$('.list-cast').eq(i).find('.name-cast').text()
					// 	);
					// }
					// data.actors = data.actors.join(',');

					for (let i = 0; i < $('.rating-row').length && $('.rating-row')[i].children[1]; i++) {
						if ($('.rating-row')[i].children[1].attribs.title == "IMDb Rating") {
                            try {
                                var fId 	= $('.rating-row').eq(i).children('.icon')['0'].attribs.href.match(/(\/tt)[0-9a-z]+/ig)[0];
                            	data.rating = $('.rating-row')[i].children[3].children[0].data;
                                data.id 	= fId.substring(3, fId.length);
                            	break ;
                            } catch (e) {
								data.imdb = null;
							}
							break ;
						}
					}
					data.rating != null ? films.push(data) : 0;
					callback();
				});
			}, 20);

		qFilmItem.drain = function (err) {
			console.log(films);
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

	parseYVifyAPI (start, film, callback) {
		let api		= 0;

		recursiveApiSearch(api, film, start);

		function recursiveApiSearch (api, film, start) {
			let films 	= [];
			let apies 	= ['yts.ag', 'yify.is'];
			let url 	= `https://${apies[api]}/api/v2/list_movies.json?query_term=${film};page=${start + 1}`;

			needle.get(url, (err, res) => {
				if (res.body.status == 'ok' && res.body.data.movie_count > 0)
					for (var i = 0; i < res.body.data.movies.length; i++) {
						let data = {
							img		: res.body.data.movies[i].medium_cover_image,
							name 	: res.body.data.movies[i].title,
							year	: res.body.data.movies[i].year,
							genres	: res.body.data.movies[i].genres.join(' '),
							time	: '120',
							magnets	: res.body.data.movies[i].torrents,
							synopsis: res.body.data.movies[i].summary,
							imdbUrl	: '',
							cast	: [],
							imdb	: res.body.data.movies[i].rating
						};
						films.push(data);
					}
				return (films.length == 0 && ++api < 2 ? recursiveApiSearch(api, film) : callback(films));
			});
		}
	}
}

function parse (start, film, func, callback) {
	let parser 		= new Parsers();
	let parserFuncs	= parser.getOwnFunctions();

	if (parserFuncs.length <= func) return callback([]);

	parser[parserFuncs[func]](start, film, (films) => {
		if (films && films.length > 0) {
		return callback(films);
	} else {return parse(start, film, ++func, callback)}
});
}


module.exports = function (start, film = '', callback) {
	parse(start, film, 0, (films) => {
		callback(JSON.stringify(films))
	});
};