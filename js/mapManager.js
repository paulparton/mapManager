'use strict';

//If namespace has already been created use it, otherwise create it.
if(!pp){
	var pp = {};
}

pp.mapManager = function(mapContainer, args, callback){
    
    /**
     * Set up object
     */

    //Check for required arguments
    if (!mapContainer){
        return(false);
    }
    
    //If no arguments were supplied, create an empty object
    if(!args){
        args = {};
    }
    
    //Remove the need to use the new keyword
    if(!(this instanceof pp.mapManager)){                  
        return new pp.mapManager(mapContainer, args, callback);
    }
    
    /**
     * Prepare default arguments and create map manager properties object
     */
    
    //Add map container to arguments
    args.mapContainer = mapContainer;
    
    //Calculate default map dimensions from container
    this.defaultArgs.containerSize = {
        width: args.mapContainer.style.width,
        height: args.mapContainer.style.height,
        largeWidth: parseInt(args.mapContainer.style.width, null) * 2,
        largeHeight: parseInt(args.mapContainer.style.height, null) * 2
    };
    
    this.defaultArgs.largeMapSize = {
        height: this.defaultArgs.containerSize.largeHeight + 'px',
        width: this.defaultArgs.containerSize.largeWidth + 'px'
     };
     
    this.defaultArgs.smallMapSize = {
        height: this.defaultArgs.containerSize.height,
        width: this.defaultArgs.containerSize.width
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
    
    //Load markers and layers
    this.loadMarkers(this.mapProperties.mapData, function(mapContents){
        
        //Combine with existing markers and layers
        this.layers = mapContents.layers;
        this.markers = mapContents.markers;
        
        //Return callback
        callback.call(this, this, mapContents);
        
    }); 
            
};

pp.mapManager.prototype.infoWindow = new google.maps.InfoWindow({
  content:'<p>Default</p>' 
      
    });
  
    pp.mapManager.prototype.startMap = function(properties){
        
        //Variables
    var mapConfig,
        map;
    
    //Map configuration object          
    mapConfig = {
        center: new google.maps.LatLng(properties.mapLat, properties.mapLng),
        zoom: 11,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    
    //Create map
    map = new google.maps.Map(properties.mapContainer, mapConfig);
    
    //Return new map
    return map;
    
};

pp.mapManager.prototype.createMarker = function(markerProperties){
    
    //Variables
    var pinColor,
        content,
        pinImage,
        pinShadow,
        marker,
        key;
    
    //Default pin color
   	pinColor = '999999';
   	
   	//Get layer colors from color layer color map
    if(this.layerColors[markerProperties.layerId.replace(/ /g,'')]){
        pinColor = this.layerColors[markerProperties.layerId.replace(/ /g,'')].color;
    }
    
    //Create pin
    pinImage = new google.maps.MarkerImage("http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|" + pinColor,
        new google.maps.Size(21, 34),
        new google.maps.Point(0, 0),
        new google.maps.Point(10, 34));

    pinShadow = new google.maps.MarkerImage("http://chart.apis.google.com/chart?chst=d_map_pin_shadow",
        new google.maps.Size(40, 37),
        new google.maps.Point(0, 0),
        new google.maps.Point(12, 35));
	
	//Create marker
    marker = new google.maps.Marker({
        position: markerProperties.latlng,
        map: this.mapProperties.map,
        icon: pinImage,
        shadow: pinShadow,
        markerDetail:{
        	layerId:markerProperties.layerId, 
        	pageName: markerProperties.pageName, 
        	marker: marker, 
        	pageId: markerProperties.pageId
        }
    });

    this.openInfoWindow.call(this, marker);
    
    console.log(marker);
    
    return(marker);
    
    
};

pp.mapManager.prototype.openInfoWindow = function(marker){
    
    var infoWindow = this.infoWindow,
        mapProperties = this.mapProperties,
        content;
    
    content = '<strong>' + marker.markerDetail.pageName +'</strong>' + '<p>Other info here...</p>';
        
    google.maps.event.addListener(marker, 'click', function(){
        
        infoWindow.content = content;
        
        infoWindow.open(mapProperties.map, marker);

    });
                

};

//Take marker data and return an object of marker objects
pp.mapManager.prototype.loadMarkers = function(mapData, callback){
    
    //variables
    var markerData,
		marker,
        markers = {},
		layers = [],
        i, o;
	
	layers = mapData.layers;
	markerData = mapData.markers;
	
    //Loop through marker data and create markers
    for (i=0, o=markerData.length; i<o; i+=1){

		//Create the marker 
        marker = this.createMarker.call(this, markerData[i]);
        
        console.log(markerData[i]);
        
        //Add marker to markers object with unique id as a key
        markers[markerData[i].id] = marker;
		                                   
    }       
	
	console.log(markers);
	
	//Return markers and layers    
    callback.call(this, {
    	layers: layers,
    	markers: markers
    });

};

//Combine supplied arguments with defaults
pp.mapManager.prototype.parseArguments = function(userArgs){
    
    //Variables
    var mapProperties, 
        key;
    
    //Create a copy of the default arguments object to overwrite with supplied arguments
    mapProperties = this.defaultArgs;
    
    //Loop through the default properties
    for (key in userArgs){
        
        //Check the property belongs to the default properties and not its prototype
        if (userArgs.hasOwnProperty(key)){
        
            //If the property has been provided by the user
            if (typeof userArgs[key] !== undefined) {
                
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
    mapLat: -34.08346933637405,
    mapLng: 151.02527617884334,
    mapData: undefined,
    rssMarkers: undefined,
    arrMarkers: undefined,
    mapSize: undefined,
    expandButton: undefined,
    contractButton: undefined,
    mapContainer: undefined

};

pp.mapManager.prototype.loadLayerBar = function(barContainer, callback){
    
    var myMap = this,
        containerList = document.createElement('ul'),
        i,o,z,y, 
        layerName, 
        liLayer, 
        liMarker, 
        liLayers, 
        liMarkers, 
        liControls,
        markerList, 
        layerList, 
        toggleLayerLink, 
        toggleLayerLinkText,
        togglePinsLink;

    $(barContainer).append($(containerList));
     
    for(y=0, z=myMap.layers.length;y<z;y+=1){
    
        if (myMap.layers[y] !== 'other' && myMap.layers[y] !== 'Test' ){
            //remove the spaces from the layer name to use as an id
            layerName = myMap.layers[y].replace(/ /g,'');
            
            //Create layer item to hold this layer
            liLayer = document.createElement('li');
            
            $(containerList).append($(liLayer));
            
            //Create a list to hold the controls and markers for this layer
            layerList = document.createElement("ul");
            
            //Add this layers list to the list of layer lists (say that 10 times fast)
            $(liLayer).append($(layerList));
            
            //Create list items to hold layer controls and markers
            liLayers = document.createElement('li');
            liControls = document.createElement('li');
            
            //Add list items to container list
            $(layerList).append($(liControls));
            $(layerList).append($(liLayers));

        
            //Add id and class names to the list
            layerList.className = 'layerContainer';
            layerList.id= 'container_' + layerName;
            
            //Link that hides and shows this layer of markers in the sidebar
            toggleLayerLink = document.createElement('a');
            toggleLayerLink.className = "layer_toggle_button";
            toggleLayerLink.id = layerName;
            toggleLayerLink.href="#";
            toggleLayerLinkText = document.createTextNode(myMap.layers[y]);
            toggleLayerLink.appendChild(toggleLayerLinkText);
            
            //Link that hides and shows this layers markers on the map
            togglePinsLink = document.createElement('span');            
            togglePinsLink.className = "layer_plot_button";
            togglePinsLink.id = layerName;
            $(togglePinsLink).append('<small>Show on map</small> &nbsp;&nbsp;<input style="vertical-align:top" type="radio" onMouseDown="this.__chk = this.checked" onClick="if (this.__chk) this.checked = false" checked="checked">');
            $(togglePinsLink).css('float','right');
            $(togglePinsLink).css('vertical-align','text-top');
            
            //Add layer controls to the layer list
            $(liControls).append($(toggleLayerLink));
            $(liControls).append($(togglePinsLink));
        
            //Create a list to display all the markers for this layer
            markerList = document.createElement('ul');
            markerList.className = "layerHeading";
            markerList.id = 'list_' + layerName;
        
            //$('.google-map-link-panel').append('<ul id="container_' + myMap.layers[y].replace(/ /g,'') + '" class="layerContainer" style="list-display-type:none">');
            //$('#container_' + myMap.layers[y].replace(/ /g,'')).append('<li><h3><a href="#" class="layer_toggle_button" id="' + layerName + '">' + myMap.layers[y] + '</a> - <a href="#" class="layer_plot_button" id=' + layerName + '>Hide</a></h3></li>');
            //'$('#container_' + myMap.layers[y].replace(/ /g,'')).append('<ul style="list-style-type:none" class="layerHeading" id="list_' + myMap.layers[y].replace(/ /g,'') + '">');
            
            console.log(myMap.markers);
            
            //Loop through every marker
            for (i in myMap.markers){
                
                if (myMap.markers[i].layerId === myMap.layers[y]){
            
                    //Create a link. This will open the infoBox on hover
                    $(markerList).append('<li class="' + myMap.layers[y].replace(/ /g,'') + '"><a href="#" class="map_plot_button" id="' + myMap.markers[i].pageId + '">' + myMap.markers[i].pageName + '</a></li>');
                
                }   
      
                //$('.google-map-link-panel').append('</ul>');
      
            }
            $(markerList).css('display', 'none');
            $(liLayers).append($(markerList));
            
        }
     
      
    }
    

                     
    callback.call(this,'none');
    
};   
 
/**
 * General reusable functions
 */ 
 
//Function to get source contents
pp.mapManager.prototype.getSource = function(sourceURL, callback){
    
    //Preserve this to call callback
    var that = this;
    
    $.get(sourceURL, {}, function(data) {
        
        //This is implimentation specific. Fix -pp 
        callback.call(that, $(data).find('project'));
        
    });
    
};

//Function to remove duplicates from an array
pp.mapManager.prototype.unique = function(origArr) {
    
    //Variables
    var arrCleaned = [],
        found,
        i, o, 
        x, y;
    
    //Loop through array to be cleaned
    for (i=0, o=origArr.length; i<o; i+=1) {
        
        //Reset testing variable
        found = undefined;
        
        //Compare each item to the cleaned array
        for (x=0, y=arrCleaned.length; x<y; x+=1){
            
            //If a duplicate item is found
            if (origArr[i] === arrCleaned[x]) {
                
                //Indicate that it is a duplicate 
                found = true;
                break;
                
            }
            
        }
        
        //If an item is not a duplicate
        if (!found){
            
            //Add it to the cleaned array
            arrCleaned.push(origArr[i]);
            
        }     
        
    }
    
    //Return the cleaned array
    return arrCleaned;
    
};

pp.mapManager.prototype.layerColors = {

    "Roadsandcarparks":{
        color: '5c5e60'
    },
    "Drainageandwater":{
        color: '368ce4'
    },
    "Footpathsandcycleways":{
        color: 'e1e2df'         
    },
    "Parksandplaygrounds":{
        color: '4b9f4b'         
    },
    "Councilbuildings":{
        color: '0083a9'         
    },
    "Publictoilets":{
        color: 'fdc82f'         
    },
    "Test":{
        color: 'white'
    },"other":{
        color: 'white'
    }
};

pp.mapManager.prototype.getLayer = function(program){
    
    //Category grouping definition. This is implimentation specific and shouldn't be here.
    var categoryFix = {
        Roads_and_carparks: [
            "Traffic Engineering",
            "Traffic Management",
            "Developer Traffic Contributiions",
            "Carparks in Reserves",
            "Shire Entry Signs",
            "Bridge Maintenance",
            "Carpark Construction",
            "Menai Road Landscaping",
            "Roads Construction",
            "Regional Roads",
            "Roads to Recovery"
            
        ],
        Drainage_and_water: [
            "Drainage Construction",
            "Stormwater Mtce",
            "Stormwater Re",
            "Water Quality",
            "Waterways Projects"
        ],
        Footpaths_and_cycleways:[
            "Cycleways Construction",
            "Shopping Centre Upgrades",
            "Disabled Access Works",
            "Pavement Rehabilitation",
            "Footpath Program"
        ],
        Parks_and_playgrounds:[
            "Playground Equipment",
            "Parks Capital",
            "Netball Courts",
            "Tennis Courts",
            "Sporting Facilities"
        ],
        Council_buildings:[
            "Art Galleries",
            "Buildings on Ovals",
            "Buildings on Passive Reserves",
            "Community Halls",
            "Golf Driving Range",
            "Leisure Facilities",
            "Depots",
            "Malls Management",
            "Scout Halls"
        ],
        Public_toilets:[
            "Public Toilets",
            "Public Toilets"
        ],
        Test:[
            "Test"
        ],
        other:[
            "Works in Conjunction",
            "Preventative Maintenance",
            "Community Leases",
            "Emergency Services",
            "Lucas Heights Projects",
            "WASIP JOBS",
            "Green Hills Development"
        ]   
        
    },
    i, o, key;
    
    //Loop through every category grouping array
    for(key in categoryFix){
        if(categoryFix.hasOwnProperty(key)){        
            //Loop through the contents of the array
            for (i=0, o=categoryFix[key].length; i<o; i+=1){
            
                //Identify the category the provided program belongs to 
                if (categoryFix[key][i] === program){
                
                    //Return the name of the grouping (with spaces intact)
                    return(key.replace(/\_/g,' '));
                
                }
            
            }
        } 
    }
    
    //If no matching category is found, return other
    return('other');
    
};
