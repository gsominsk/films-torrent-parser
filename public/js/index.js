'use strict'

class FloatingSearch {
	constructor () {
		this.searchInput 	= document.querySelectorAll('.search-input')[0];
		this.logo			= document.querySelectorAll('.logo')[0];
		this.floatingSearch = document.querySelectorAll('.body-row')[0];

		window.onscroll = () => {
			if (this.scrollPosition() >= 150) {
				this.floatingSearch.classList.add("floating-search");
				this.searchInput.setAttribute('style', 'width:'+getComputedStyle(this.logo).width+';');
			}
			else {
				this.searchInput.removeAttribute('style');
				this.floatingSearch.classList.remove("floating-search");
			}
		}

		window.onresize  = () => {
			if (this.scrollPosition() >= 150) {
				this.searchInput.setAttribute('style', 'width:'+getComputedStyle(this.logo).width+';');
			}
		}
	}

	scrollPosition () {
		let doc = document.documentElement;
		let top = (window.pageYOffset || doc.scrollTop)  - (doc.clientTop || 0);
		return (top);
	}
}

window.onload = function () {
	let floatSearch = new FloatingSearch;

	(() => {
		new Vue ({
			el	: '.search-input-wraper',
			data: {

			},
			methods: {
				checkFilms: function () {
					let film = this.$el.childNodes[0].value;
					console.log(this.$el.childNodes[0].value);
					let ajax 	= new Ajax;
					let ajaxReq = {
						type: "POST",
						body: {
							action	: 'findFilms',
							film	: film
						}
					};
					ajax.sendRequest('/find', ajaxReq, (data) => {
						if (data.err) return console.error(data.err);
						console.log(data);
					});
				}
			}
		});
	})();
};