express = require 'express'
app = do express
path = require 'path'
http = require('http').Server app
io = require('socket.io') http
Twitter = require 'twitter'
credentials = require './credentials.json'

PORT = 3666

app.use '/', express.static path.join __dirname, 'client'
http.listen PORT, () -> console.log "Listening on port #{PORT}"

onTweet = (data) ->
	tweet = parseTweet data
	io.emit 'tweet', tweet if tweet

onError = (error) ->
	console.log 'ERROR', error

options = locations: '-10.72,35.53,3.63,44.12'
connection = new Twitter credentials
connection.stream 'statuses/filter', options, (stream) ->
	stream.on 'data', onTweet
	stream.on 'error', onError

parseTweet = (data) ->
	if data?.place?.full_name and data?.place?.country
		place = "#{data.place.full_name}, #{data.place.country}"
	if data.type is 'Point'
		coordinates = data.coordinates?.coordinates
	if data.user
		user = data.user
	unless user and (place or coordinates) and user.lang in ['en', 'es']
		return

	tweet =
		created_at: data.created_at
		url: "https://twitter.com/#{user.screen_name}/status/#{data.id_str}"
		user:
			name: user.name
			username: user.screen_name
			avatar: user.profile_image_url
			language: user.lang
			followers: user.followers_count or 0
			followees: user.following or 0
		content: data.text
		images: parseImages data
		place: place
		coordinates: coordinates

parseImages = (data) ->
	images = []
	if data?.entities?.media?.length > 0
		for item in data?.entities?.media when item.type is 'photo'
			images.push item.media_url
	images
