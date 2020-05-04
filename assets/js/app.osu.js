(function($) {

// Globals
Number.prototype.format = function() {
	return new Intl.NumberFormat().format(this);
}

window.dd = console.log.bind(console);

var MODS = {
    "NF"    : 1,
    "EZ"    : 2,
    "TS"    : 4,
    "HD"    : 8,
    "HR"    : 16,
    "SD"    : 32,
    "DT"    : 64,
    "RL"    : 128,
    "HT"    : 256,
    "NC"    : 512,
    "FL"    : 1024,
    "AT"    : 2048,
    "SO"    : 4096,
    "RL2"   : 8192,
    "PF"    : 16384,
    "K4"    : 32768,
    "K5"    : 65536,
    "K6"    : 131072,
    "K7"    : 262144,
    "K8"    : 524288,
    "KM"    : 1015808,
    "FI"    : 1048576,
    "RN"    : 2097152,
    "LM"    : 4194304,
    "K9"    : 16777216,
    "K10"   : 33554432,
    "K1"    : 67108864,
    "K3"    : 134217728,
    "K2"    : 268435456,
    "SV2"   : 536870912
};

var MODES_MAPPING = {
	'std' 	: 'osu',
	'taiko' : 'taiko',
	'ctb' 	: 'fruits',
	'mania' : 'mania'
};

var HOST = 'https://aproid.ddns.net:5002';

var LOGIN, HASH_ID, HASH_PW;

var $pages = $('.content');

// jQuery Setups
$.ajaxSetup({ cache: false });

$.fn.extend({
	serializeFlat: function() {
		var data = $(this).serializeArray();
		var result = {};

		for(var i in data) {
			result[data[i].name] = data[i].value;
		}

		return result;
	}
});

// Processing Events
$('#login form').on('submit', function(e) {
	e.preventDefault();

	var data = $(this).serializeFlat();
	data.password = md5(data.password);

	$.post(HOST + '/login', data, function(result) {
		if(result === '-2') {
			alert('아이디 또는 비밀번호가 일치하지 않습니다.');
			return;
		} else if(result === '-1') {
			alert('승인되지 않은 계정입니다.');
			return;
		}

		LOGIN = true;
		HASH_ID = result.id;
		HASH_PW = data.password;

		this.reset();

		getLeaderboard();
	}.bind(this))
});

$('#leaderboard_nav button').on('click', function() {
	getLeaderboard($(this).attr('value'));
});

$('#profile_nav button').on('click', function() {
	getPP($(this).data('username'), $(this).attr('value'));
});

$(document).on('click', '#leaderboard tr span', function() {
	var $tr = $(this).parents('tr').first();

	getProfile($tr.data('username'), $tr.data('mode'));
});

$(document).on('click', 'a[href]', function(e) {
	var id = $(this).attr('href');

	if(id.indexOf('#') == 0) {
		e.preventDefault();

		move(id.replace('#', ''));
	}
});

$('#add_ranked').on('submit', function(e) {
	e.preventDefault();

	var data = $(this).serializeFlat();

	$.post(HOST + '/add_ranked', authData(data), function(result) {
		if(result === '1') {
			$('#add_ranked input[name="beatmap_id"]').val('');

			alert('등록되었습니다.');
			return;
		}

		alert('등록에 실패하였습니다.\n(이미 등록되어 있을 수도 있습니다)');
	});
});

// Enterance Point
move('login');

// Etc Functions
function getLeaderboard(mode) {
	if(mode == undefined)
		mode = 'taiko';

	$.post(HOST + '/leaderboard', authData({ mode: mode }), function(result) {
		result = JSON.parse(result);

		if(result === 'false') {
			alert('리더보드를 가져오는데 실패하였습니다.');
			return;
		}

		var $leaderboard = $('#leaderboard table tbody');
		$leaderboard.html('');

		for(var i in result) {
			var player = result[i];

			var $tr = $('<tr />');
			$tr.data('mode', mode);
			$tr.data('username', player.username);
			$tr.append('<td>#' + (parseInt(i) + 1) + '</td>');
			$tr.append('<td><span>' + player.username + '</span></td>');
			$tr.append('<td>' + player['pp_' + mode].format() + 'pp</td>');
			$tr.append('<td>' + player['ranked_score_' + mode].format() + '</td>');
			$tr.append('<td>' + player['avg_accuracy_' + mode].toFixed(2) + '%</td>');
			$tr.append('<td>' + player['playcount_' + mode].format() + '</td>');

			$leaderboard.append($tr);
		}

		move('leaderboard');
	});
}

function getProfile(username, mode) {
	if(mode == undefined)
		mode = 'taiko';

	$.when(
		$.post(HOST + '/profile', authData({ username: username })),
		getPP(username, mode)
	).done(function(profile, pp) {
		profile = profile[0];

		if(profile === 'false'
		|| pp === 'false') {
			alert('프로필을 가져오는데 실패하였습니다.');
			return;
		}

		$('#profile h1').text(profile.username);
		$('#profile_nav button').data('username', username);

		move('profile');
	})
}

function getPP(username, mode) {
	var deferred = $.Deferred();

	$.post(HOST + '/pp', authData({ username: username, mode: mode }), function(result) {
		result = JSON.parse(result);

		var $list = $('#profile ul');
		$list.html('');

		for(var i in result) {
			var pp = result[i];
			var ppMod = [];

			for(var j in MODS) {
				if((pp.mods & MODS[j]) > 0) {
					if(j == 'NC') {
						ppMod.splice(ppMod.indexOf('DT'), 1);
					}

					ppMod.push(j);
				}
			}

			var $li = $('<li />');

			$li.append('<a target="_blank" href="https://osu.ppy.sh/beatmapsets/' + pp.beatmapset_id + '#' + MODES_MAPPING[mode] + '/' + pp.beatmap_id + '">' + pp.song_name + '</a>');

			if(ppMod.length > 0)
				$li.append(' <strong>+ ' + ppMod.join(', ') + '</strong>');

			$li.append(' (' + pp.accuracy.toFixed(2) + '%)');
			$li.append('<span>' + pp.pp.toFixed(0) + 'pp</span>');

			$list.append($li);
		}

		if(result.length < 1) {
			$list.append('<li class="empty">플레이 기록이 없습니다.</li>');
		}

		deferred.resolve();
	})

	return deferred;
}

function authData(data) {
	return $.extend({
		'id': HASH_ID,
		'password': HASH_PW
	}, data);
}

function move(id) {
	$pages.hide();
	$('#' + id).show();
}

})(jQuery);