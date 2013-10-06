"use strict";

/**
 *	Functions in the file rely on underscore and jQuery 
 */

//If namespace has already been created use it, otherwise create it.
if(!pp){
	var pp = {};
}

pp.utils = {};

/**
 * Generates a random color
 */
pp.utils.randomColor = function(){
	
	//Return a random color
	return((0x1000000+(Math.random())*0xffffff).toString(16).substr(1,6));
	
};
/**
 * Accepts an rss feed URL and converts it into an array of objects for map data
 */
pp.utils.feedToMapData = function(sourceUrl, callback, schema){
	//To do - process an optional schema to map feed data to map data objects	
	
	var i, o,
		markers = [],
		layers = [],
	    tempMarker = {},
	    returnObj,
	    storeMarker,
	    defaultSchema;
	    
	defaultSchema = {
		latitude: "lat",
		longitude: "lng",
		id: "id",
		title: "title",
		layer: "layer",
		description: "description"
	};
	
	if(typeof schema === 'undefined'){
		var schema = defaultSchema;
		alert('DEFAULT!!');
	}
	
	//Connect to url
	$.get(sourceUrl, {}, function(response) {
	 	
		var data = $(response).find('project'),
			tempMarker;

		//Loop through feed
		for (i=0, o=data.length;i<o;i+=1){
              
			//Only process markers that have co-ordinates
            if($(data[i]).find(schema.latitude).text() && $(data[i]).find(schema.longitude).text()){
                
                tempMarker = {};

                //Get standard value from the feed using the schema field names
                tempMarker.id = $(data[i]).find(schema.id).text();
                tempMarker.title = $(data[i]).find(schema.title).text();
                tempMarker.layer = $(data[i]).find(schema.layer).text();
                tempMarker.description = $(data[i]).find(schema.description).text();                       
                tempMarker.latlng = new google.maps.LatLng(parseFloat($(data[i]).find(schema.latitude).text()),parseFloat($(data[i]).find(schema.longitude).text()));
                
                //Create a unique marker id using the associated page id
                tempMarker.id = "a" + tempMarker.id.replace(/-/g, '') + "marker";  
                 
                //Store layer in array
                layers.push(tempMarker.layer);
                
                //Store marker in array             
                markers.push(tempMarker);
                                
            }
          
        }	

		//Create object to return processed values
		returnObj = {};
		       
		//After the last item has been processed clean the array of layers for duplicates
		returnObj.layers = _.uniq(layers);      
        returnObj.markers = markers;
        
        //Return callback. Use call to make map data as a callback argument or as 'this'
        callback.call(returnObj, returnObj);


    });

		
};
