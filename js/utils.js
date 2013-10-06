"use strict";

/**
 *	Functions in the file rely on underscore and jQuery 
 */

//If namespace has already been created use it, otherwise create it.
if(!pp){
	var pp = {};
}

/**
 * Accepts an rss feed URL and converts it into an array of objects for map data
 */
pp.feedToMapData = function(sourceUrl, schema, callback){
	//To do - process an optional schema to map feed data to map data objects	
	
	var i, o,
		markers = [],
		layers = [],
	    tempMarker = {},
	    returnObj,
	    storeMarker,
	    schema;
	
	schema = {
		latitude: "lat",
		longitude: "lng",
		id: "id",
		title: "title",
		layer: "program",
		description: "description"
	};
	
	//storeMarker = function(marker){
		
		//markers.push(marker);
		
	//};
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
                tempMarker.pageId = $(data[i]).find(schema.id).text();
                tempMarker.pageName = $(data[i]).find(schema.title).text();
                tempMarker.layerId = $(data[i]).find(schema.layer).text();
                tempMarker.description = $(data[i]).find(schema.description).text();                       
                tempMarker.latlng = new google.maps.LatLng(parseFloat($(data[i]).find(schema.latitude).text()),parseFloat($(data[i]).find(schema.longitude).text()));
                
                //Create a unique marker id using the associated page id
                tempMarker.id = "a" + tempMarker.pageId.replace(/-/g, '') + "marker";  
                 
                //Store layer in array
                layers.push(tempMarker.layerId);
                
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
