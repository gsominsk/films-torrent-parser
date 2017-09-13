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
					console.log('urls', result);

					let qFilmItem = async.queue(function (url, callback) {
						needle.get(url, (err, res) => {
							let $ = cheerio.load(res.body);
							let data = {
								img		: $('.img-responsive')[0].attribs.src,
								magnets	: [],
								synopsis: $('#synopsis')[0].children[3].children[0].data,
								imdbUrl	: '',
								imdb	: ''
							};

							data.magnets.push($('.magnet-download')[0].attribs.href);
							data.magnets.push($('.magnet-download')[1].attribs.href);
							data.name = $('#mobile-movie-info')[0].children[1].children[0].data;

							for (let i = 0; i < $('.rating-row').length && $('.rating-row')[i].children[1]; i++) {
								if ($('.rating-row')[i].children[1].attribs.title == "IMDb Rating") {
									data.imdbUrl = $('.rating-row')[i].children[1].attribs.href;
									break ;
								}
							}

							needle.get(data.imdbUrl, (err, res) => {
								let $ = cheerio.load(res.body);
								data.imdb = $('.ratingValue')[0].children[1].children[0].children[0].data;
								films.push(data);
								callback();
							});
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

module.exports = function (start, film, callback) {
	parseYify(start, film, function (films) {
		callback(films);
	});
	// needle.get(url, (err, res) => {
	// 	// let $ = cheerio.load(res.body);
	// 	//
	// 	// let q = async.queue(function(task, callback) {
	// 	// 	console.log('elo', task.children[0].next.attribs.href);
	// 	// 	callback();
	// 	// }, 1);
	// 	//
	// 	// q.drain = function() {
	// 	// 	console.log('all items have been processed');
	// 	// };
	// 	//
	// 	// for (let i = 0; i < $('.browse-movie-wrap').length; i++) {
	// 	// 	q.push($('.browse-movie-wrap')[i], function(err) {
	// 	// 		console.log('finished processing item');
	// 	// 	});
	// 	// }
	//
	// 	// console.log('============================');
	// 	// console.log($('.browse-movie-wrap')[0]);
	// 	// console.log('============================'); ready
	// 	// console.log($('.browse-movie-wrap')[0].children[0].next.attribs.href);
	// 	// console.log('============================');
	// 	// console.log($('.browse-movie-wrap')[0].children[2]);
	// 	// console.log('============================');
	// 	// console.log($('.browse-movie-wrap')[0].attribs);
	// 	// console.log('============================');
	// 	// $('.browse-movie-wrap').each(function () {
	// 	// 	console.log(this);
	// 	// });
	//
	// 	callback({res: $, url:url})
	// });
};