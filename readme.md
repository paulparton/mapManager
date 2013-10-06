#Map Manager#
A javascript tool for displaying multiple layers of mapping data.  

##Usage##
Several argumentes can be passed to the map manager to customise your map, the only "required" argument is the container for the map (a div).  While the array of
marker information objects is optional, the map is pretty pointless with out it. Another recommended argument is the container for a map control panel.


	//Variables
	var mapContainer, mapBarContainer, mapArgs;

	//Map properties
	mapContainer = document.getElementById('mapContainer');
	mapBarContainer = document.getElementById('layerBarContainer');
	mapArgs = {
		mapData : mapData,
		barContainer : mapBarContainer,
	};

	//Create map
	pp.mapManager(mapContainer, mapArgs, function(myMap) {
		
		//Code to run after map has loaded...
		
	});

##Marker information objects##
The map manager populates the map and map control panel using an array of map information objects.

	mapDataObject = {
		latlng: 'a google maps latlng object'
		id: 'a unique id',
		title: 'marker title string',
		description: 'marker description string',
		layer: 'The markers layer name',
	};
	
A utility function (pp.utils.feedToMapData) in the demo code converts an xml feed of data into an array of map objects. feedToMapData accepts an optional schema object to map your feed to the map data format

	pp.utils.feedToMapData('http://feedUrl.xml', 
	{
		latitude: "lat", //feedToMapData schema accepts a latitude / longitude and creates the google map latlng object
		longitude: "lng",
		id: "id",
		title: "title",
		layer: "program",
		description: "description"
	}, 
	function(mapData){
		
		//callback
		
	});
	
##Pin / Layer Colors##
Another optional argument for the mapManager is the colorMap. colorMap matches the names of map layers with a hex color code, and applys that code to the layers pins and decorations.

###If no colorMap is provided, or if a layer is not included in the colorMap a random color will be generated when the map loads.

	mapArgs = {
		mapData : mapData,
		barContainer : mapBarContainer,
		colorMap: {
			'Buried Treasure': 'e1e1e1',
			'Peg leg caches': '1e1e1e',
			'Dingo hangouts': 'ffffff'
		}
	};
