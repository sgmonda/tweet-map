var socket = io.connect('/');
var map, geocoder;
var TWEET_PARTIAL = new EJS({url: './ejs/tweet.ejs'});
var TILE_SIZE = 256;

function init() {
	var mapOptions = {
		zoom: 6,
		center: new google.maps.LatLng(40.13, -4.26)
	};
	geocoder = new google.maps.Geocoder();
	map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
	socket.on('tweet', onTweet);
}
google.maps.event.addDomListener(window, 'load', init);

function bound(value, opt_min, opt_max) {
	if (opt_min) value = Math.max(value, opt_min);
	if (opt_max) value = Math.min(value, opt_max);
	return value;
}

function degreesToRadians(deg) {
	return deg * (Math.PI / 180);
}

function radiansToDegrees(rad) {
	return rad / (Math.PI / 180);
}

function createBubble(tweet, point) {
	var numTiles = 1 << map.getZoom();
	var projection = new BubbleProjection();
	var text = tweet.content;
	var images = tweet.images || [];
	var worldCoordinate = projection.fromLatLngToPoint(point);
	var pixelCoordinate = new google.maps.Point(worldCoordinate.x * numTiles, worldCoordinate.y * numTiles);
	var tileCoordinate = new google.maps.Point(Math.floor(pixelCoordinate.x / TILE_SIZE), Math.floor(pixelCoordinate.y / TILE_SIZE));
	return TWEET_PARTIAL.render(tweet);
}

function drawTweet(tweet) {
	var point = new google.maps.LatLng(tweet.coordinates[0], tweet.coordinates[1]);
	var coordInfoWindow = new google.maps.InfoWindow({
		position: point,
		map: map,
		content: createBubble(tweet, point),
	});
	setTimeout(function () {
		coordInfoWindow.close();
		coordInfoWindow.setMap(null);
	}, 1000 * 15);
}

function codeAddress(address, callback) {
	geocoder.geocode( { 'address': address}, function(results, status) {
		if (status == google.maps.GeocoderStatus.OK) {
			callback(null, results[0].geometry.location);
		} else {
			callback(status);
		}
	});
}

function onTweet (tweet) {
	if (tweet.coordinates) {
		drawTweet(tweet);
		return;
	}
	codeAddress(tweet.place, function (err, coordinates) {
		if (err) {
			return;
		}
		tweet.coordinates = [coordinates.lat(), coordinates.lng()];
		drawTweet(tweet);
	});
}
