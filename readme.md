#Map Manager#
A javascript tool for displaying multiple layers of mapping data.  

##Usage##
Optional arguments can be passed to the map manager to customise your map, the only "required" argument is the container for the map (a div).  While the mapData object is optional, the map is pretty pointless with out it. Another recommended argument is the container for a map control panel.
	
	pp.mapManager(mapContainerDiv, optionalArguments, callback)

	//Variables
	var mapContainer, mapBarContainer, mapArgs;

	//Map properties
	mapContainer = document.getElementById("mapContainer");
	mapBarContainer = document.getElementById("layerBarContainer");
	mapArgs = {
		mapData : mapData,
		barContainer : mapBarContainer,
	};

	//Create map
	pp.mapManager(mapContainer, mapArgs, function(myMap) {
		
		//Code to run after map has loaded...
		
	});

###Currenty supported optional arguments are:
mapBarContainer - A container for the map controls. Providing the container automatically creates the control panel when the map is loaded.
colorMap - An object to map a color for each map layer
mapData - An object containing two arrays (layers and markers) that populates the map

##Map control panel
add a map control panel by providing a barContainer when creating the map.

The map control panel displays a list of every layer on the map with controls to hide / show layers. Each layer also has a collapsable list of its markers which can triggler the marker info windows.


##Marker information objects##
The map manager populates the map and map control panel using a mapData object which consists of an array of map information objects, and an array of layer names.

	mapData:{
		markers:[
			mapDataObject = {
				latlng: "a google maps latlng object"
				id: "a unique id",
				title: "marker title string",
				description: "marker description string",
				layer: "The markers layer name",
			}
		],
		layers:[
			"The markers layer name"
		]
	}
		
A utility function (pp.utils.feedToMapData) in the demo code converts an xml feed of data into a mapData object. feedToMapData accepts an optional adaptor object to map your feed to the map data format

	pp.utils.feedToMapData(
		//Feed url
		"http://feedUrl.xml", 
		//Callback
		function(mapData){
		
		},
		//Feed adaptor
		{
			latitude: "lat", //adaptor accepts a latitude / longitude and creates the google map latlng object
			longitude: "lng",
			id: "id",
			title: "title",
			layer: "program",
			description: "description"
		
		}
	);
	
##Pin / Layer Colors##
Another optional argument for the mapManager is the colorMap. colorMap matches the names of map layers with a hex color code and applys that code to the layers pins and decorations.

###If no colorMap is provided, or if a layer is not included in the colorMap a random color will be generated when the map loads.

	mapArgs = {
		mapData : mapData,
		barContainer : mapBarContainer,
		colorMap: {
			"Buried Treasure": "e1e1e1",
			"Peg leg caches": "1e1e1e",
			"Dingo hangouts": "ffffff"
		}
	};
