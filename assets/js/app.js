(function($) {

// Global Components
window.dd = console.log.bind(console);
window.toTop = function() {
	$('.body').scrollTop(0);
}

// On Document & jQuery Ready
$(function() {
	// Element Variables
	var $body = $('body'),
		$wrap = $('.wrap'),
		$menu = $('.menu'),
		$side = $('.side'),
		$article = $('.article-ctn');
		
	// Env Variables
	var lazyConfig = {
		effect: 'fadeIn',
		effectTime: 500,
		threshold: 0
	}

	// Jekyll Search
	var jekyllSearch = SimpleJekyllSearch({
		searchInput: document.getElementById('jekyll_search_input'),
		resultsContainer: document.getElementById('jekyll_search_container'),
		json: '/search.json',
		noResultsText: '<li>Nothing :(</li>'
	});
	
	// Jekyll Infinite Scrolls
	var $itemContainer = $('.item-container'),
		$paginateLink = $('.paginate');
	
	if($itemContainer.length && $paginateLink.length) {
		var infScroll = new InfiniteScroll('.item-container', {
			path: '.paginate',
			hideNav: '.paginate',
			append: '.item',
			scrollThreshold: 100,
			elementScroll: 'body',
			responseType: 'document',
			status: '.paginate-status',
			history: false,
			debug: true
		});
		
		$itemContainer.on('append.infiniteScroll', function(e, r, p, items) {
			for(var i = 0; i < items.length; ++i) {
				$(items[i]).find('.item-thumbnail-loader').lazy(lazyConfig);
			}
		});
	}
	
	// Menu Events
	$menu.on('transitionend webkitTransitionEnd oTransitionEnd', function(e) {
		if(($menu.is(e.target) || $side.is(e.target))
		&& !$body.hasClass('menu-open')) {
			$body.removeClass('menu-opening');
		}
	});

	$menu.on('click', '.hdr-toggle', function() {
		$body.toggleClass('menu-open');

		if($body.hasClass('menu-open')) {
			$body.addClass('menu-opening');
		}
	});
	
	$menu.on('click', '.side-close', function() {
		$body.removeClass('menu-open');
	});
	
	$menu.on('click', '.search-reset', function() {
		$menu.find('.search-result').html('');
	})
	
	// Anchor Overrides
	$('a:not([title])').each(function() {
		this.setAttribute('title', this.innerText);
	});
	
	// Article Anchor Overrides
	$article.find('a:not(.link):not(.link-raw)').each(function() {
		$(this).addClass('link');
	});
	
	$article.find('a:not([target])').each(function() {
		this.setAttribute('target', '_blank');
		this.setAttribute('rel', 'noopener noreferrer');
	});

	// Footnote Anchor Overrides
	$article.find('a.footnote, .footnotes a').each(function() {
		$(this).removeClass('link');

		this.removeAttribute('target');
		this.removeAttribute('rel');
	});
	
	// Item Thumbnail Overrides
	$('.item').each(function() {
		$(this).find('.item-thumbnail-loader').lazy(lazyConfig);
	});
});

})(jQuery);