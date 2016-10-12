(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
if (!google.maps) throw "Ensure that the Google Maps API has been loaded before using this module";

var CustomMarker = function (coords, label) {
	this._div = null;
	this._coords = new google.maps.LatLng(coords.lat,coords.lng);
	this._text = label;
}

CustomMarker.prototype = new google.maps.OverlayView();

CustomMarker.prototype.onAdd = function () {
	var div = document.createElement('div');
	div.style.textAlign = 'center';
	div.style.backgroundColor = "rgb(255,255,255,0.5)";
	div.style.padding = "5px";
	div.style.borderLeftColor = "gray";
	div.style.position = 'absolute';
	div.style.fontSize = '12px';
	div.style.fontWeight = 'bold';
	div.style.zIndex = '1000';
	div.innerHTML = this._text;
	div.className = "zipCodeLabel";
	this._div = div;
	
	var panes = this.getPanes();
	panes.overlayLayer.appendChild(div);
}

CustomMarker.prototype.draw = function(){
	//use the overlay project to translate LatLng value to actual (x,y) coordinates
	var overlayProjection = this.getProjection();
	var point = overlayProjection.fromLatLngToDivPixel(this._coords);	
	
	//use these x,y coordinates to move the div to the appropriate place
	var h = this._div.style.height;
	var w = this._div.style.width;
	
	this._div.style.left =(point.x - (20)) + 'px';
	this._div.style.top = (point.y - (20)) + 'px';
}

CustomMarker.prototype.onRemove = function(){
	this._div.parentNode.removeChild(this._div);
	this._div = null;
}

module.exports = CustomMarker;
},{}],2:[function(require,module,exports){
/**********************************************************
 * This module does the following:
 * - adds a script tag to the DOM that loads the maps API
 * - invokes the callback after script load
 * - passes the global 'map' object to that callback
**********************************************************/
var urlGoogleMapsApi = "https://maps.googleapis.com/maps/api/js?key=AIzaSyA3Oa5uLCltGJkIyF5EVmUSQrz7-ujGdQA&callback=initMap";

// for some reason, google Maps API wants you to have this ugly
// function titled 'initMap()' sitting in your global namespace
// otherwise it keeps throwing an error.

// So I'm just inserting one here before I actually load the API
// Feel like an idiot doing this, but here goes...
var dumbInitFuncForMapsAPI = "function initMap(){}";
var lameScriptTag = document.createElement("script");
lameScriptTag.innerHTML = dumbInitFuncForMapsAPI;
document.body.appendChild(lameScriptTag);


module.exports = {
	
	///--------------------------------------------------------------
	/// this method loads the Google Maps API using script
	/// injection. Once that API loads, it invokes the callback
	///--------------------------------------------------------------
	load: function (callback) {
		var scriptTag = document.createElement("script");
		scriptTag.src = urlGoogleMapsApi;
		scriptTag.type = 'text/javascript';
		scriptTag.onload = callback;
		document.body.appendChild(scriptTag);
	},
	
	///--------------------------------------------------------------
	/// this method will clear the 'polygons' from the map
	/// polygons - the list of polygons you want to clear from the map
	/// to clear a set of polygons, simply make them point to null, instead
	/// of an actual map object
	///--------------------------------------------------------------
	clearPolygonsOnMap: function (polygons) {
		if (google.maps) {
			polygons.forEach(function (eachPoly) {
				eachPoly.setMap(null);
			});
		}
		else throw "Google Maps API not loaded or map object is invalid"
	},

	///--------------------------------------------------------------
	/// this method will draw a list of 'polygons' on the 'map'
	///--------------------------------------------------------------	
	drawPolygonsOnMap: function (polygons, map) {

		if (google.maps && map instanceof google.maps.Map) {		
			
			//We also want to understand where the center of this polygon is
			//we'll do this using a LatLngBounds object provided by google maps
			var bounds = new google.maps.LatLngBounds();
		
			//iterate through each polygon in the list and draw it on the map
			polygons.forEach(function (polyToDraw) {
			
				//these are the center coordinates of each polygon
				var lat = polyToDraw.centerCoord.lat;
				var lng = polyToDraw.centerCoord.lng;
			
				//extend the bounds of our region to include these coords
				bounds.extend(new google.maps.LatLng(lat, lng));
			
				//draw the polygon
				polyToDraw.setMap(map);

			});
		
			//the polygons are on the map, and now we need to recenter the map
			//let's get the center of the bounds region
			map.panTo(bounds.getCenter());
			map.fitBounds(bounds);
		}
		else throw "Google Maps API not loaded or map object is invalid"
	},
	
	///--------------------------------------------------------------
	/// this method will clear all the 'markers' from the map
	/// markers - a list of google.maps.Marker objects that need to
	/// be cleared from the maps they're currently drawn on
	///--------------------------------------------------------------
	clearMarkersOnMap: function (markers) {
		if (google.maps) {
			markers.forEach(function (eachMarker) {
				eachMarker.setMap(null);
			});
		}
	},

	drawMarkersOnMap: function (markers, map) {
		markers.forEach(function (eachMarker) {
			eachMarker.setMap(map);
		});
	}
}
},{}],3:[function(require,module,exports){

/*********************************************************************
 * String.replaceAll
 * For a string, replace all occurrences of "search" with "replacement"
 ********************************************************************/
String.prototype.replaceAll = function (search, replacement) {
    return this.split(search).join(replacement);
};

/*********************************************************************
 * String.isDigits
 * Return true if all the characters in the string are digits
 *********************************************************************/
String.prototype.isDigits = function () {
	if (this.match(/^[0-9]+$/) != null) return true;
	return false;
}

/*********************************************************************
 * HTMLElement.show
 * set the style.display to inline
 *********************************************************************/
HTMLElement.prototype.show = function () {
	this.style.display = 'inline';
}

/*********************************************************************
 * HTMLElement.hide 
 * Set the style.display to none
 *********************************************************************/
HTMLElement.prototype.hide = function () {
	this.style.display = 'none';
}

/*********************************************************************
 * App specific helpers
*********************************************************************/
module.exports = {
	
	
	getRandomBetweenInts: function(min,max){
		return Math.floor(Math.random()*max) + min;
	},
	
	///-------------------------------------------------------------------------
	/// validate a given list of zipcodes
	/// each element in the list must be a string composed of
	/// numbers only. Return True if all elements are valid
	///-------------------------------------------------------------------------
	validateZips: function (lstZipcodes) {
		
		//let's assume the list is valid
		var isListValid = true;
		
		//go through each element, and ensure its valid
		lstZipcodes.forEach(function (zipString) {
			//if an invalid element is found, change the status
			//of the flag
			if (!zipString.isDigits()) {
				isListValid = false;
				return;
			}
		});

		return isListValid;
	},
	
	///-------------------------------------------------------------------------
	/// helper function to perform async Http GET calls
	/// calls the URL, then invokes the callback once the
	/// response is ready to be handled
	/// fakedelay - in case you want it to delay the response (for UI magic!!!)
	///-------------------------------------------------------------------------
	httpGetAsync: function (url, callback, fakedelay) {
		
		if(!fakedelay) fakedelay = 0;
		
		//create a GET request, assign callback 
		var request = new XMLHttpRequest();
		request.open("GET", url, true);
		
        request.onreadystatechange = function () {
			if (request.readyState == 4) {
				
				//type checking for fakedelay, make sure its a number 
				if (typeof (fakedelay) == typeof (1)) {
					setTimeout(function () {
						callback(request);
					}, fakedelay);
				}
				else callback(request);
			}
		}
               
		//ready to send it!
		request.send(null);
	},
	
	///-------------------------------------------------------------------------
	/// Get zip code data from the server for all the zips in 'lstZips'
	/// in parts. Since there are limitations on how long the URL can be for
	/// HTTP requests, its likely that we'll have to handle this in parts
	/// if the user wants to request data for 2000 zipcodes, some zips may 
	/// get missed because of url truncation
	///
	/// To address this, we'll split the list of zips into smaller, manageble 
	/// chunks. Each chunk (which is a subset of the large list) will turn
	/// into a url. These URL will be requested one by one. And when all the requests
	/// have been served, we'll invoke the 'callback'
	///-------------------------------------------------------------------------
	getZipsFromServerInParts: function(lstZips, route, callback){
		
		console.log("---> total number of zips",lstZips.length);
		
		//lstZips might be extremely large, so we'll split it into smaller chunk
		//sized lists. For each chunk sized list, we'll form a url and get the data 
		//from the server using the route specified		
		var chunkSize = 80;
		var numChunks = Math.floor(lstZips.length / chunkSize);
		if(lstZips.length % chunkSize > 0) numChunks++;
		
		var chunkSizedZips = [];
				
		//now we need to create as many lists as indicated in 'numChunks'
		for(var i = 0; i < numChunks; i++){
			var startChunkAt = i * chunkSize;
			var endChunkAt = startChunkAt + chunkSize;
			chunkSizedZips.push(lstZips.slice(startChunkAt,endChunkAt));
		}
		
		
		//now we have split our larger list in small manageable chunk sizes
		//all these smaller lists contain zip codes, we'll now create URLs 
		//for each smaller list using the route provided as argument
		var urls = [];
		
		chunkSizedZips.forEach(function(chunk){
			urls.push(''+route + chunk.join("&"));
		});
				
		//now we have all the urls we need to call in our 'urls' list
		//let's call them one by one. Each call will return a response
		//which will also have to be collated into one big response
		
		var responses = [];
		var GET = this.httpGetAsync;
		var counter = 0;
		
		//call each url, store its response in the list. When the list
		//has as many responses as urls, we know we're done. Invoke the callback
		urls.forEach(function(url){
			GET(url,function(req){
				//get this URL
				var resp = null;
				if(req.status == 200){
					resp = JSON.parse(req.responseText);
					counter++;					
				}
				
				//save the response in 'responses'
				responses.push(resp);
				
				//looks like we have no more URLs to fetch, invoke callback												
				if(responses.length == urls.length){ 
					//now every response object (in 'responses') is basically a collection
					//of key value pairs. We want to combine all this into a single object
					
					var bigObject_allZipData = {};					
					responses.forEach(function(eachResp){
						for(var zipcode in eachResp){							
							var dataForZip = eachResp[zipcode];
							bigObject_allZipData[zipcode] = dataForZip;
						}
					});
					
					//now throw it back to the callback
					callback(bigObject_allZipData);
				}
			});
		});
			 
	},

	

	///-------------------------------------------------------------------------
	/// Convert a string of format "lat1,lng1/lat2,lng2/lat3,lng3..."
	/// to a google polygon object that can be drawn on the map. Each coordString
	/// must represent a single polygon
	///-------------------------------------------------------------------------
	converZipToPolygon: function (zipStr, zipData, opacity) {
		
		if(!google.maps) throw "Google Maps API not found!";
		
		//the coordStr data is delimited by "/" character. when we split
		//we get ["lat1,lng1","lat2,lng2",...]
		var coords = [];
		var coordStr = zipData.coords[0];
		var arrPairs = coordStr.split("/");
		var bounds = new google.maps.LatLngBounds();
		
		//Now take that list and turn everything into a json object
		//push that json object into the array 'coords'
		arrPairs.forEach(function (latLngString) {
			
			//string to {lat:.., lng:...}
			var lat = parseFloat(latLngString.split(",")[0]);
			var lng = parseFloat(latLngString.split(",")[1]);
			coords.push({'lat': lat, 'lng': lng});			
			
			//since we're using the bounds object to track the region
			//this polygon spreads over, let's add this point to our
			//bounds object as well
			bounds.extend(new google.maps.LatLng(lat,lng));
		});
		
		//get the center of this region defined by the polygon
		var regionCenter = {lat: bounds.getCenter().lat(), lng: bounds.getCenter().lng()};
		
		//turn that array 'coords' into a google polygon
		var polygon = new google.maps.Polygon({
            paths: coords
            , strokeColor: '#ff0000'
            , strokeOpacity: 0.8
            , strokeWeight: 2
            , fillColor: '#ff0000'
            , fillOpacity: opacity
			, centerCoord: regionCenter
			, tag: zipStr
			, bounds: bounds
        });
		
		return polygon;
	},
	
	///-------------------------------------------------------------------------
	/// Create a google.maps.Marker from the coordinates and the label
	/// provided in the arguments
	///-------------------------------------------------------------------------
	getMarker: function(coord,label){
		
		var marker = new google.maps.Marker({
			position: coord,
			title: label
		});
		
		return marker;
	},
	
	getCustomMarker: function(coord,label){
		var CustomMarker = require("./customMarker");
		var cusMark = new CustomMarker(coord,label);
		return cusMark;		
	}
}


},{"./customMarker":1}],4:[function(require,module,exports){
//import our modules
var gMap = require("./gmap");
var helpers = require("./helpers");


//global objects to track our map 
//and our polygons
var map;
var currentPolygons = [];
var currentMarkers = [];

//flags to toggle visibility of things
var showMarkers = false;
var isPolyOpacityRandom = false;

//TBD - get rid of this when deploying
var fakeDelayMillis = 1000;
var minOpacity = 30, maxOpacity = 70;

// load the maps module - it will add the google maps script to the body
// and bring us to the callback here
gMap.load(function () {
	
	//Let's say the init location of the map was San Diego
	var initLocation = {
		lat: 32.7157
		, lng: -117.1611
	}
	
	//let's init our map object and draw something
	//in the DOM element with id 'map'
	map = new google.maps.Map(document.getElementById('map'), {
        zoom: 12
        , center: initLocation
        , mapTypeId: 'terrain'
    });
	
	//Our UI elements
	var button = document.getElementById("btnDo");
    var textBox = document.getElementById("txtData");
	var loader = document.getElementById("progLoader");
	var chkShowMarkers = document.getElementById("chkShowMarkers");
	var chkRandomOpacity = document.getElementById("chkRandomOpacity");
	
    
	///-------------------------------------------------------------------------
	/// Button clicked
	/// This triggers everything
	///-------------------------------------------------------------------------
	button.onclick = function () {
		
		//initialize our flags to match the state of our checkboxes
		isPolyOpacityRandom = chkRandomOpacity.checked;
		showMarkers = chkShowMarkers.checked;
		
		//clear anything that might have been drawn before
		gMap.clearPolygonsOnMap(currentPolygons);
		gMap.clearMarkersOnMap(currentMarkers);
			
		//let's validate what the user's entered
        var entered = textBox.value.trim();			//get rid of all spaces
		var lstZipCodes = entered.split(',');		//split by commas
		
						
		if (helpers.validateZips(lstZipCodes)) {
			
			//show the progress loader
			loader.show();
			
			//all the entered zips are valid. Let's do our thing now...
			//GET all the zip code data from the server
			helpers.getZipsFromServerInParts(lstZipCodes, "/zipcodes?", handleData);
			
			//helpers.httpGetAsync(url, handleResponse, fakeDelayMillis);
		}
		else {
			alert("Dude! You need to enter valid zips. Don't be messing around now.");
		}
	}

	var handleData = function (data) {
		var thesePolygons = [];
		var theseMarkers = [];
		var failed = [];

		for (var zipStr in data) {

			if (data[zipStr] != null) {	
				//get a random opacity between 0.1 and 0.5 if the flag is true, else just use 0.5
				//dividing by ten since the function returns integers between a certain range
				var opacity = ((isPolyOpacityRandom) ? helpers.getRandomBetweenInts(minOpacity, maxOpacity) : maxOpacity) / 100;
				
				//get the zip, get the polygon for that zip, get the marker for that polygon
				var zipData = data[zipStr];
				var polygon = helpers.converZipToPolygon(zipStr, zipData, opacity);
				var marker = helpers.getCustomMarker(polygon.centerCoord, zipStr);
								
				//push into respective arrays
				thesePolygons.push(polygon);
				theseMarkers.push(marker);
			}
			else {
				console.log('this zipcode', zipStr, "is", data[zipStr]);
				failed.push(zipStr);
			}
		}
		
		loader.hide();
		drawPolygonsOnMap(thesePolygons);
		if (showMarkers) drawMarkersOnMap(theseMarkers);

	}
	
	///-------------------------------------------------------------------------
	/// handle response of GET call (Server sends zipcode data)
	/// Server's responded, process the response
	///-------------------------------------------------------------------------
	var handleResponse = function (req) {
		loader.hide();
		if (req.status == 200) {
			
			//if the request was executed successfully, get the response
			//parse the response, turn it into a json object
			var response = JSON.parse(req.responseText);
			
			//get a polygon for every zip in the response. store it in
			//a local array called 'thesePolygons'
			var thesePolygons = [];
			var theseMarkers = [];

			for (var zipStr in response) {
				
				//get a random opacity between 0.1 and 0.5 if the flag is true, else just use 0.5
				//dividing by ten since the function returns integers between a certain range
				var opacity = ((isPolyOpacityRandom) ? helpers.getRandomBetweenInts(minOpacity, maxOpacity) : maxOpacity) / 100;
				
				//get the zip, get the polygon for that zip, get the marker for that polygon
				var zipData = response[zipStr];
				var polygon = helpers.converZipToPolygon(zipStr, zipData, opacity);
				var marker = helpers.getCustomMarker(polygon.centerCoord, zipStr);
								
				//push into respective arrays
				thesePolygons.push(polygon);
				theseMarkers.push(marker);
			}
			
			
			//now that we have 'thesePolygons', lets draw them on the map
			drawPolygonsOnMap(thesePolygons);
			if (showMarkers) drawMarkersOnMap(theseMarkers);
		}
		else alert("We tried to ask the server, but something went wrong!");
	}

	///-------------------------------------------------------------------------
	/// draw the polygons on the map
	/// clear the current polygons (if any), then draw the new ones 
	///-------------------------------------------------------------------------
	var drawPolygonsOnMap = function (thesePolygons) {
		currentPolygons = thesePolygons;
		gMap.drawPolygonsOnMap(currentPolygons, map);
	}

	var drawMarkersOnMap = function (theseMarkers) {
		currentMarkers = theseMarkers;
		gMap.drawMarkersOnMap(currentMarkers, map);
	}
});



},{"./gmap":2,"./helpers":3}]},{},[4]);
