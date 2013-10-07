'use strict';

//If namespace has already been created use it, otherwise create it.
if (typeof pp === 'undefined') {
    var pp = {};
}

/**
 * mapManager
 * -I wrote this using a constructor pattern and tried to avoid:
 * ---A need to use the "new" keyword
 * ---The use of "that = this" (forced to use it when using google maps methods)
 */
pp.mapManager = function(mapContainer, args, callback) {

    /**
     * Set up object
     */

    //Check for required arguments
    if (!mapContainer) {
        return (false);
    }

    //If no arguments were supplied, create an empty object
    if (!args) {
        args = {};
    }

    //Remove the need to use the new keyword
    if (!(this instanceof pp.mapManager)) {
        return new pp.mapManager(mapContainer, args, callback);
    }

    /**
     * Prepare default arguments and create map manager properties object
     */

    //Add map container to arguments
    args.mapContainer = mapContainer;
	
	this.infoWindow = new google.maps.InfoWindow({
        content : '<p>Default</p>'
	});

    //Calculate default map dimensions from container
    this.defaultArgs.containerSize = {
        width : args.mapContainer.style.width,
        height : args.mapContainer.style.height,
        largeWidth : parseInt(args.mapContainer.style.width, null) * 2,
        largeHeight : parseInt(args.mapContainer.style.height, null) * 2
    };

    this.defaultArgs.largeMapSize = {
        height : this.defaultArgs.containerSize.largeHeight + 'px',
        width : this.defaultArgs.containerSize.largeWidth + 'px'
    };

    this.defaultArgs.smallMapSize = {
        height : this.defaultArgs.containerSize.height,
        width : this.defaultArgs.containerSize.width
    };

    this.defaultArgs.containerWidth = this.defaultArgs.containerSize.width;
    this.defaultArgs.containerHeight = this.defaultArgs.containerSize.height;

    //Merge provided arguments with defaults
    this.mapProperties = this.parseArguments(args);

    /**
     * Create the map and markers
     */

    //Launch map
    this.mapProperties.map = this.startMap(this.mapProperties);

	//Create properties to hold layers and markers
	this.layers = {};
	this.markers = {};
	
    //Load markers and layers
    this.loadMarkers.call(this, this.mapProperties.mapData, function(mapContents) {

        //Combine with existing markers and layers
        this.markers = mapContents.markers;  
 
    });
		
	//If a controller bar container has been provided
    if (this.mapProperties.barContainer){
            
		//Launch the map controller bar
		this.loadLayerBar.call(this,this.mapProperties.barContainer, function(){
            	
    	});
                
    }
    
    //If a callback has been provided
    if (typeof callback !== 'undefined'){
		//Return callback
		callback.call(this, this);
	}
		
};

pp.mapManager.prototype.startMap = function(properties) {

    //Variables
    var mapConfig, map;

    //Map configuration object
    mapConfig = {
        center : new google.maps.LatLng(properties.mapLat, properties.mapLng),
        zoom : 11,
        mapTypeId : google.maps.MapTypeId.ROADMAP
    };

    //Create map
    map = new google.maps.Map(properties.mapContainer, mapConfig);

    //Return new map
    return map;

};

pp.mapManager.prototype.createMarker = function(markerProperties) {
	
    //Variables
	var pinColor, content, pinImage, pinShadow, marker, key, id;

    //Default pin color
    pinColor = '999999';
	
	id = markerProperties.layer.replace(/ /g,'');
	
	//If this layer hasn't already been assigned a color
	if(typeof this.layers[id].color === 'undefined'){
		
		//If the user has included a color map
		if(this.mapProperties.colorMap){

			//locate a color for the layer
			if (this.mapProperties.colorMap[id]){

				//Apply the assigned color
				this.layers[id].color = this.mapProperties.colorMap[id];
			
			}else{
				
				//if none exists assign a random color for this layer
				this.layers[id].color = pp.utils.randomColor();
													
			}
		
		}else{
			
			//assign a random color for this layer
			this.layers[id].color = pp.utils.randomColor();
			
		}
		
	}else{

		
	}
	
	pinColor = this.layers[id].color;

    //Create pin
    pinImage = new google.maps.MarkerImage("http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|" + pinColor, new google.maps.Size(21, 34), new google.maps.Point(0, 0), new google.maps.Point(10, 34));

    pinShadow = new google.maps.MarkerImage("http://chart.apis.google.com/chart?chst=d_map_pin_shadow", new google.maps.Size(40, 37), new google.maps.Point(0, 0), new google.maps.Point(12, 35));

    //Create marker
    marker = new google.maps.Marker({
        position : markerProperties.latlng,
        map : this.mapProperties.map,
        icon : pinImage,
        shadow : pinShadow,
        markerDetail : {
            infobox : this.infoWindow,
            id : markerProperties.id,
            title : markerProperties.title,
            description : markerProperties.description,
            marker : marker,
            layer: id
        }
    });

    this.openInfoWindow.call(this, marker);

    return (marker);

};

pp.mapManager.prototype.openInfoWindow = function(marker) {

    var infoWindow = this.infoWindow, mapProperties = this.mapProperties, content;

    content = '<strong>' + marker.markerDetail.title + '</strong>' + '<p>' + marker.markerDetail.description + '</p>';

    google.maps.event.addListener(marker, 'click', function() {

        infoWindow.content = content;

        infoWindow.open(mapProperties.map, marker);

    });

};

pp.mapManager.prototype.loadLayers = function(layers){
	
	var key, i, o, layerId;
	
	//Loop through the array of layer names 
	for (i=0, o=layers.length;i<o;i+=1){
		
		layerId = layers[i].replace(/ /g,'');
		
		//Create the new layer object
		this.layers[layerId] = {
			name: layers[i]
		};
		
		//Create a layer object
		//this.layers[layerId].;		
			
	}
	
};

//Take marker data and return an object of marker objects
pp.mapManager.prototype.loadMarkers = function(mapData, callback) {

    //variables
    var markerData, marker, markers = {}, layers = [], i, o;

    //this.layers = mapData.layers;
    this.loadLayers.call(this, mapData.layers);
    
    markerData = mapData.markers;

    //Loop through marker data and create markers
    for ( i = 0, o = markerData.length; i < o; i += 1) {
        
        //Create the marker
        marker = this.createMarker.call(this, markerData[i]);

        //Add marker to markers object with unique id as a key
        markers['a' + markerData[i].id.replace(/ /g,'') + 'marker'] = marker;

    }

    //Return markers and layers
    callback.call(this, {
        layers : layers,
        markers : markers
    });

};

//Combine supplied arguments with defaults
pp.mapManager.prototype.parseArguments = function(userArgs) {

    //Variables
    var mapProperties, key;

    //Create a copy of the default arguments object to overwrite with supplied arguments
    mapProperties = this.defaultArgs;

    //Loop through the default properties
    for (key in userArgs) {

        //Check the property belongs to the default properties and not its prototype
        if (userArgs.hasOwnProperty(key)) {

            //If the property has been provided by the user
            if ( typeof userArgs[key] !== undefined) {

                mapProperties[key] = userArgs[key];

            }

        }

    }

    //Return the combined map properties
    return mapProperties;

};

//Default arguments
pp.mapManager.prototype.defaultArgs = {

    //Default values for optional arguments
    mapLat : -34.08346933637405,
    mapLng : 151.02527617884334,
    zoom: 11,
    mapData : undefined,
    rssMarkers : undefined,
    arrMarkers : undefined,
    mapSize : undefined,
    expandButton : undefined,
    contractButton : undefined,
    mapContainer : undefined

};

pp.mapManager.prototype.loadLayerBar = function(barContainer, callback) {
	
    //Variables
    var htmlElements, containerList, layerName, attachEvents, i, o, z, y;

    //add events to elements
    attachEvents = function(arrElements) {

        var key, x, hoverOn, hoverOff, that = this;

        //Show and hide layer list
        $(arrElements.toggleLayerLink).click(function(e) {

            $(arrElements.markerList).slideToggle();

            return false;

        });

        for (key in arrElements.markerLinks) {
            
            //if (arrElements.hasOwnProperty(key)){

            //Show marker info on link hover
            $(arrElements.markerLinks[key]).hover( hoverOn = function(e) {

                //Use the id of the hovered link to build the id of its corresponding map marker
                x = "a" + e.currentTarget.id.replace(/-/g, '') + "marker";
			
				
				//x = e.currentTarget.id;
				
                //Open the markers info window
                google.maps.event.trigger(that.markers[x], 'click');

            }, hoverOff = function(e) {

                //var x = "a" + e.currentTarget.id.replace(/-/g,'') + "marker";
                that.markers[x].markerDetail.infobox.close();

            });

        }

        //Click event listener for layer links
        $(arrElements.togglePinsLink).click(function(e) {
    
            //variables
            var i, x;
            
            //Loop through all the markers
            for (i in that.markers) {

                //Identify markers that match the layer button clicked
                if (that.markers[i].markerDetail.layer.replace(/ /g, '') == e.currentTarget.id) {

                    //Check if visible or not and toggle.
                    if (that.markers[i].visible) {
                        
                        arrElements.togglePinsLink.innerHTML = "<small>Show Markers</small>";
                        
                        that.markers[i].setVisible(false);

                    } else {
                        
                        arrElements.togglePinsLink.innerHTML = "<small>Hide Markers</small>";
                        
                        that.markers[i].setVisible(true);

                    }

                }

            }

            return false;

        });

    };

    //Create the root element
    containerList = document.createElement('ul');
	containerList.className='mapBarContainer';
	
    //Add root element to the container element
    $(barContainer).append($(containerList));

    //Loop through every marker
    for ( y in this.layers) {
		
        htmlElements = {};

        //remove the spaces from the layer name to use as an id
        layerName = this.layers[y].name.replace(/ /g, '');

        //Create list item to hold this layer
        htmlElements.liLayer = document.createElement('li');
        $(containerList).append($(htmlElements.liLayer));

        //Create a list to hold the controls and markers for this layer
        htmlElements.layerList = document.createElement("ul");

        //Add this layers list to the list of layer lists (say that 10 times fast)
        $(htmlElements.liLayer).append($(htmlElements.layerList));

        //Create list items to hold layer controls and markers
        htmlElements.liLayers = document.createElement('li');
        htmlElements.liControls = document.createElement('li');

        //Add list items to container list
        $(htmlElements.layerList).append($(htmlElements.liControls));
        $(htmlElements.layerList).append($(htmlElements.liLayers));

        //Add id and class names to the list
        htmlElements.layerList.className = 'layerContainer';
        htmlElements.layerList.id = 'container_' + layerName;

        //Link that hides and shows this layer of markers in the sidebar
        htmlElements.toggleLayerLink = document.createElement('a');
        htmlElements.toggleLayerLink.className = "layer_toggle_button";
        htmlElements.toggleLayerLink.id = layerName;
        htmlElements.toggleLayerLink.href = "#";
        htmlElements.toggleLayerLinkText = document.createTextNode(this.layers[y].name);
        var pinImage = new google.maps.MarkerImage("http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|" + this.layers[y].color, new google.maps.Size(21, 34), new google.maps.Point(0, 0), new google.maps.Point(10, 34));
        htmlElements.toggleLayerLink.appendChild(htmlElements.toggleLayerLinkText);

        //Link that hides and shows this layers markers on the map
        htmlElements.togglePinsLink = document.createElement('a');
        htmlElements.togglePinsLink.className = "layer_plot_button";
        htmlElements.togglePinsLink.id = layerName;
        htmlElements.togglePinsLink.href="#";
        
        $(htmlElements.togglePinsLink).append('<small>Hide Markers</small>');
        $(htmlElements.togglePinsLink).css('float', 'right');
        $(htmlElements.togglePinsLink).css('vertical-align', 'text-top');

        //Add layer controls to the layer list
        $(htmlElements.liControls).append('<img src="' + pinImage.url + '" />&nbsp;');
        
        $(htmlElements.liControls).append($(htmlElements.toggleLayerLink));
        $(htmlElements.liControls).append($(htmlElements.togglePinsLink));

        //Create a list to display all the markers for this layer
        htmlElements.markerList = document.createElement('ul');
        htmlElements.markerList.className = "layerHeading";
        htmlElements.markerList.id = 'list_' + layerName;

        htmlElements.markerLinks = {};
		
        //Loop through every marker
        for (i in this.markers) {
			
            if (this.markers.hasOwnProperty(i)) {
			
                if (this.markers[i].markerDetail.layer === this.layers[y].name.replace(/ /g,'')) {

                    //Create li to hold link
                    htmlElements.liMarkerLink = '';
                    htmlElements.liMarkerLink = document.createElement('li');
                    htmlElements.liMarkerLink.className = this.layers[y].name.replace(/ /g, '');

                    //Create link element
                    htmlElements.markerLinks[this.markers[i].markerDetail.id] = document.createElement('a');
                    htmlElements.markerLinks[this.markers[i].markerDetail.id].href = '#';
                    htmlElements.markerLinks[this.markers[i].markerDetail.id].appendChild(document.createTextNode(this.markers[i].markerDetail.title));
                    htmlElements.markerLinks[this.markers[i].markerDetail.id].id = this.markers[i].markerDetail.id;
                    htmlElements.markerLinks[this.markers[i].markerDetail.id].className = 'map_plot_button';

                    $(htmlElements.liMarkerLink).append(htmlElements.markerLinks[this.markers[i].markerDetail.id]);

                    //Create a link. This will open the infoBox on hover
                    $(htmlElements.markerList).append(htmlElements.liMarkerLink);

                }

            }

        }

        $(htmlElements.markerList).css('display', 'none');
        $(htmlElements.liLayers).append($(htmlElements.markerList));

        attachEvents.call(this, htmlElements);

    }

    callback.call(this, 'none');

};

/**
 * General reusable functions
 */


pp.mapManager.prototype.layerColors = {

    "Roadsandcarparks" : {
        color : '5c5e60'
    },
    "Drainageandwater" : {
        color : '368ce4'
    },
    "Footpathsandcycleways" : {
        color : 'e1e2df'
    },
    "Parksandplaygrounds" : {
        color : '4b9f4b'
    },
    "Councilbuildings" : {
        color : '0083a9'
    },
    "Publictoilets" : {
        color : 'fdc82f'
    },
    "Test" : {
        color : 'white'
    },
    "other" : {
        color : 'white'
    }
};

pp.mapManager.prototype.getLayer = function(program) {

    //Category grouping definition. This is implimentation specific and shouldn't be here.
    var categoryFix = {
        Roads_and_carparks : ["Traffic Engineering", "Traffic Management", "Developer Traffic Contributiions", "Carparks in Reserves", "Shire Entry Signs", "Bridge Maintenance", "Carpark Construction", "Menai Road Landscaping", "Roads Construction", "Regional Roads", "Roads to Recovery"],
        Drainage_and_water : ["Drainage Construction", "Stormwater Mtce", "Stormwater Re", "Water Quality", "Waterways Projects"],
        Footpaths_and_cycleways : ["Cycleways Construction", "Shopping Centre Upgrades", "Disabled Access Works", "Pavement Rehabilitation", "Footpath Program"],
        Parks_and_playgrounds : ["Playground Equipment", "Parks Capital", "Netball Courts", "Tennis Courts", "Sporting Facilities"],
        Council_buildings : ["Art Galleries", "Buildings on Ovals", "Buildings on Passive Reserves", "Community Halls", "Golf Driving Range", "Leisure Facilities", "Depots", "Malls Management", "Scout Halls"],
        Public_toilets : ["Public Toilets", "Public Toilets"],
        Test : ["Test"],
        other : ["Works in Conjunction", "Preventative Maintenance", "Community Leases", "Emergency Services", "Lucas Heights Projects", "WASIP JOBS", "Green Hills Development"]

    }, i, o, key;

    //Loop through every category grouping array
    for (key in categoryFix) {
        if (categoryFix.hasOwnProperty(key)) {
            //Loop through the contents of the array
            for ( i = 0, o = categoryFix[key].length; i < o; i += 1) {

                //Identify the category the provided program belongs to
                if (categoryFix[key][i] === program) {

                    //Return the name of the grouping (with spaces intact)
                    return (key.replace(/\_/g, ' '));

                }

            }
        }
    }

    //If no matching category is found, return other
    return ('other');

};
