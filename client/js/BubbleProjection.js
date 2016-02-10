function BubbleProjection() {

	var self = this;
	self.pixelOrigin_ = new google.maps.Point(TILE_SIZE / 2, TILE_SIZE / 2);
	self.pixelsPerLonDegree_ = TILE_SIZE / 360;
	self.pixelsPerLonRadian_ = TILE_SIZE / (2 * Math.PI);

	self.fromLatLngToPoint = function(latLng, opt_point) {
		var point = opt_point || new google.maps.Point(0, 0);
		var origin = self.pixelOrigin_;
		point.x = origin.x + latLng.lng() * self.pixelsPerLonDegree_;
		var siny = bound(Math.sin(degreesToRadians(latLng.lat())), -0.9999, 0.9999);
		point.y = origin.y + 0.5 * Math.log((1 + siny) / (1 - siny)) * -1 * self.pixelsPerLonRadian_;
		return point;
	};

	self.fromPointToLatLng = function(point) {
		var origin = self.pixelOrigin_;
		var lng = (point.x - origin.x) / self.pixelsPerLonDegree_;
		var latRadians = (point.y - origin.y) / -self.pixelsPerLonRadian_;
		var lat = radiansToDegrees(2 * Math.atan(Math.exp(latRadians)) - Math.PI / 2);
		return new google.maps.LatLng(lat, lng);
	};
}
