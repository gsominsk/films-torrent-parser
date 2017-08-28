class FloatingSearch {
	constructor () {
		this.searchInput 	= document.querySelectorAll('.search-input')[0];
		this.logo			= document.querySelectorAll('.logo')[0];
		this.floatingSearch = document.querySelectorAll('.body-row')[0];

		var __this = this;

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
		var doc = document.documentElement;
		var top = (window.pageYOffset || doc.scrollTop)  - (doc.clientTop || 0);
		return (top);
	}
}

window.onload = function () {
	var floatSearch = new FloatingSearch;

	(() => {
		new Vue ({
			el	: '.search-input-wraper',
			data: {

			},
			methods: {
				checkFilms: function () {
					var film = this.$el.childNodes[0].value;
					console.log(this.$el.childNodes[0].value);
					var ajax 	= new Ajax;
					var ajaxReq = {
						type: "POST",
						body: {
							action	: 'findFilms',
							film	: film
						}
					};
					ajax.sendRequest('/find', ajaxReq, (data) => {
						if (data.err) return console.error(data.err);
						console.log(data.info);
					});
				}
			}
		});
		console.log('hello');
	})();
};