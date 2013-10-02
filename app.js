//Function to remove duplicates from an array
var ssc={};

var unique = function(origArr) {
    var newArr = [],
        origLen = origArr.length,
        found,
        x, y;
        
    for ( x = 0; x < origLen; x++ ) {
        found = undefined;
        for ( y = 0; y < newArr.length; y++ ) {
            if ( origArr[x] === newArr[y] ) { 
              found = true;
              break;
            }
        }
        if ( !found) newArr.push( origArr[x] );    
    }
   return newArr;
};


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
	
};

var getLayer = function(program){
	
	for(key in categoryFix){
	
		var i, o;
	
		for (i=0, o=categoryFix[key].length; i<o; i+=1){
			
			if (categoryFix[key][i] === program){
				
				return(key.replace(/\_/g,' '));
				
			}
			
		}
	
	}
	
	return('other');
	
};

var theMarkers = [];

//Function to return marker objects and layer information to plot on a google map
var mapManager = function(container, args, callback){

	var layers, 
		markers,
		properties,
		returnObj = {};
    
	args.mapContainer = container;
  
	//Process arguments provided and substitute defaults
	properties = parseArgs(args);
	
	//Create a single infobox to be reused by every map marker
	properties.ib = new InfoBox();
	
	//Instanciate the google map object
	properties.map = startMap(properties);
	
	//Build the markers and layers from the sourceUrl provided
	parseMarkers(properties, function(markers, layers){

		console.log(layers);
		console.log(markers);
    
		returnObj.layers = layers;
		returnObj.markers = markers;
		returnObj.properties = properties;
    
		//If shrink and grow buttons were supplied, connect them to the map
		if(properties.expandButton){
			attachButton(properties.expandButton,'expand', properties);
		}
		if(properties.contractButton){
			attachButton(properties.contractButton,'contract', properties);
		}
		
		//Return an object containing all the marker objects and an array of layer information
		return callback(returnObj);
    
	});
  
},
//Function to connect UI buttons to the map
attachButton = function(target,value,mapProperties){
    var handleClick;
    
    handleClick = function (val, mapProperties){
        resizeMap(val, mapProperties);
        return false;
    };
    
    if(target.attachEvent){
      
        target.attachEvent('click',function (e){
            handleClick(value, mapProperties);
        });
    }else{
        target.addEventListener('click',function (e){
            handleClick(value, mapProperties);
         });
     }
},
//Resize map
resizeMap= function(direction, mapProperties){
    var newMapSize;

    if(direction==='expand'){
       newMapSize=mapProperties.largeMapSize;
    }else{
       newMapSize=mapProperties.smallMapSize;
    }
  console.log($(mapProperties.mapContainer));
//Start timer to continually update the size of the google map to match its parent
timerMap=setInterval(updateMap,300);
            //Animate google map parent div to new size
$(mapProperties.mapContainer).animate(newMapSize,500,"linear",function (){
              //Stop timer resizing google map
              timerMap=clearInterval(timerMap);
              mapProperties.map.setCenter(new google.maps.LatLng(mapProperties.mapLat,mapProperties.mapLng));
              });
              //Resize google map to the size of its parent
              function updateMap(){
                google.maps.event.trigger(mapProperties.map,'resize');
              }
},
//build properties object
parseArgs = function(args){
  
  var containerSize,
    objResult,
    prop;
    
  //Map container dimensions from container element
    containerSize = {
      width: args.mapContainer.style.width,
      height: args.mapContainer.style.height,
      largeWidth: parseInt(args.mapContainer.style.width, null) * 2,
      largeHeight: parseInt(args.mapContainer.style.height, null) * 2
    };

    //Default values for optional arguments
    defaultArgs = {
      largeMapSize: {
        height: containerSize.largeHeight + 'px',
        width: containerSize.largeWidth + 'px'
      },
      smallMapSize: {
        height: containerSize.height,
        width: containerSize.width
      },
      mapLat: -34.08346933637405,
      mapLng: 151.02527617884334,
      rssUrl: '',
      rssMarkers: undefined,
      arrMarkers: undefined,
      containerWidth: containerSize.width,
      containerHeight: containerSize.height,
      mapSize: undefined,
      expandButton: undefined,
      contractButton: undefined,
      mapContainer: args.mapContainer

    };

    //create a copy of the defaults object to be merged with the user arguments
    objResult = defaultArgs;

  //Check valid optional arguments to overwrite defaults
  for(prop in args) {
    
    if(typeof prop !== 'undefined' && typeof prop !== '') {
      
      objResult[prop] = args[prop];
      
      if(typeof prop !== 'undefined' && typeof prop !== '') {
        
        objResult[prop] = args[prop];
        
      }
      
    }
    
  }

    return objResult;
    
},
//Load the map into its container
startMap = function(properties) {

  //Properties for the map
    var mapProp = {
      center: new google.maps.LatLng(properties.mapLat, properties.mapLng),
      zoom: 11,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    //Create the map
    var map = new google.maps.Map(properties.mapContainer, mapProp);
  
  return map;
  
},
//Load markers and place on the map
parseMarkers = function(properties, callback){
  
    //Variables
    var sourceCount,        //Number of source urls to process
    markersIn,          	//Marker sources
    counted = 0,        	//number of source urls processed
    parse,              	//function to process a url
    markerSource = [],    	//array of source urls
    arrLayers = [],        	//array of markers sorted into layers
    markers = theMarkers,   //array of all markers
    arrMarkers = {};
  
  markersIn = properties.rssMarkers;
        
  console.log('sorting source(s)');
  
    //If the source info provided is an array of sources
    if(!markersIn instanceof Array) {
  
    console.log('not an array...');
    markerSource[0] = markersIn;
      
    } else {
  
    console.log('already an array...');
    markerSource = markersIn;
      
    }
    
    console.log('sources');
    console.log(markerSource.length);
    console.log(markerSource);
  
    //Get the number of sources provided
    sourceCount = markerSource.length;
    
    //Function that will parse the source(s)
    parse = function(count, id) {
      
    //Load the contents of the source feed
    jQuery.get(count, {}, function(data) {
      
      //Get information about the feed
      rows = jQuery(data).find("project");
      rowCount = rows.length;
      
      //Set information on layer object
      
      //arrLayers[id] = {};
      //arrLayers[id].name = 'layer' + id;
      //arrLayers[id].markers = [],
      yy = 0;
      
	//Loop through every location and create map marker in the layer object
	jQuery(data).find("project").each(function(currentRow) {
	
	if($(this).find("lat").text()){
		//variables
		var tempMarkers,
			tempPageId,
			tempId,
			location;
          
        //location = $(this).find('project').text().split(",");
      
        
        //Get values from RSS feed and parse latlong
		tempMarkers = {
			//windowText: $(this).find('Marker_Text').text(),
			//mapStyleType: $(this).find('map_style').text(),
			pageName: $(this).find('title').text(),
			layerId: getLayer($(this).find('program').text()),
			//layerId: arrLayers[id].name,
			//imgInfoWindow: $(this).find("image").text(),
			//urlInfoWindow: $(this).find("marker_link").text(),
			//worksType: $(this).find("Works_Type").text(),
			pageId: $(this).find("id").text(),
			//latlng: new google.maps.LatLng(parseFloat(location[0]),parseFloat(location[1]))
			latlng: new google.maps.LatLng(parseFloat($(this).find("lat").text()),parseFloat($(this).find("lng").text()))
		};
        
        tempMarkers.marker = createMarker(tempMarkers, properties.map, properties.ib);
            
        tempPageId = $(this).find("id").text();
        tempId = "a" + tempPageId.replace(/-/g, '') + "marker";  
        
		arrMarkers[tempId] = tempMarkers;
    
		arrLayers.push($(this).find('program').text());
    
		//arrLayers[id].markers.push(tempMarkers);

	}else{
	
		console.log('empty');
	
	}		
	
	});
 

    
      //arrLayers[id].name = 'only layer';
       console.log (id + ' vs ' + markerSource.length);
      
      //If this not the last row of this feed
      if (id < (markerSource.length - 1)) {
                   
        //Increment count of feeds processed
        id++;
        
        parse(markerSource[id], id);
          
      } else {
                      
        //Return the layers array to the map object
        layers = arrLayers;
        var newLayers = [
			"Roads and carparks",
			"Drainage and water",
			"Footpaths and cycleways",
			"Parks and playgrounds",
			"Council buildings",
			"Public toilets",
			"Test",
			"other"
		];
	
        return callback(arrMarkers, newLayers);
          
      }    
     });     
  };
      

    //Process the first feed
    parse(markerSource[counted], counted);

},
getLatLong = function(address, callback){
    console.log('running getLatLong()');
    var geo = new google.maps.Geocoder;

    geo.geocode({'address':address},function(results, status){

        if (status == google.maps.GeocoderStatus.OK) {
          console.log('GeoCode Win');
            console.log(results[0].geometry.location);
            return callback(results[0].geometry.location);
            
        } else {
          
          console.log("Geocode fail: " + status);
          var returnObj = {lat: function(){return('-34.032842')}, lng: function(){return( '151.065069')}};
          console.log(returnObj);
          
          return callback(returnObj);

        }
      
    });

},
createMarker = function(objMarker, map, infoBox) {

    var colorSet;

    if(objMarker.layerId == 'layer0') {
        
    colorSet = '1c93ac';
    
    } else if(objMarker.layerId == 'layer1') {
      
    colorSet = 'd68422';
    
    } else {
        
    colorSet = '34c661';
    
    }

    console.log('Pin Color: ' + colorSet);
    pinColor = colorSet;

    var pinImage = new google.maps.MarkerImage("http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|" + pinColor,
    new google.maps.Size(21, 34),
    new google.maps.Point(0, 0),
    new google.maps.Point(10, 34));

    var pinShadow = new google.maps.MarkerImage("http://chart.apis.google.com/chart?chst=d_map_pin_shadow",
    new google.maps.Size(40, 37),
    new google.maps.Point(0, 0),
    new google.maps.Point(12, 35));

    marker = new google.maps.Marker({
      position: objMarker.latlng,
      map: map,
      icon: pinImage,
      shadow: pinShadow
    });

    marker.infobox = infoBox;


    google.maps.event.addListener(map, 'click', function() {

      infoBox.close();

    });

    //When a marker is clicked update the window info and open
    google.maps.event.addListener(marker, 'click', function(e) {
        //alert(objMarker.pageName);
      
        console.log(e);
      
    //infowindow.setContent('<span style="float:left;padding-right:5px;">' + imgInfoWindow + '</span><h4>' + urlInfoWindow + '</h4><p>' + windowText + '</p>');
    //infowindow.open(map,marker);
    //console.log(that);
    //console.log(innerHTML);
    //launchInfoBox(this, objMarker, map);
    
      //console.log('eye cinema');
      //console.log(this);
       var ib = infoBox;
         var options = {
      disableAutoPan: false,
      maxWidth: 0,
      //pixelOffset: new google.maps.Size(-183, 0),
      zIndex: null,
      boxStyle: {},
      closeBoxMargin: "-1px 1px 2px 2px",
      closeBoxURL: "http://www.sutherlandshire.nsw.gov.au/files/9/266/map-close-cross.gif",
      infoBoxClearance: new google.maps.Size(1, 1),
      alignBottom: true,
      isHidden: false,
      pane: "floatPane",
      enableEventPropagation: false
    };
    
    innerHTML = '<div style="border:4px solid black; background-color: white" class="google-popup ' + 'fillmein' + '-map">' + objMarker.pageName + '</div>';
    
    console.log('launch info box::');
    console.log(options);
    
    //Create div to contain the infoBox
    var boxText = document.createElement("div");
    
    //boxText.style.cssText = "";
    boxText.className = 'infoBoxContent';
    options.content = innerHTML;
    
    //ib.close();
    
    boxText.innerHTML = innerHTML;
    ib.setOptions(options);
      
      ib.open(map, this);
     
      
    });
  
  var launchInfoBox = function(ib, marker, map){

    var options = {
      disableAutoPan: false,
      maxWidth: 0,
      //pixelOffset: new google.maps.Size(-183, 0),
      zIndex: null,
      boxStyle: {},
      closeBoxMargin: "-1px 1px 2px 2px",
      closeBoxURL: "http://www.sutherlandshire.nsw.gov.au/files/9/266/map-close-cross.gif",
      infoBoxClearance: new google.maps.Size(1, 1),
      alignBottom: true,
      isHidden: false,
      pane: "floatPane",
      enableEventPropagation: false
    };
    
    innerHTML = '<div style="border:4px solid black; background-color: white" class="google-popup ' + 'fillmein' + '-map">' + objMarker.pageName + '</div>';
    
    console.log('launch info box::');
    console.log(options);
    
    //Create div to contain the infoBox
    var boxText = document.createElement("div");
    
    //boxText.style.cssText = "";
    boxText.className = 'infoBoxContent';
    options.content = innerHTML;
    
    //ib.close();
    
    boxText.innerHTML = innerHTML;
    ib.setOptions(options);

    
    ib.open(map, marker);

  };
  
    //Add marker to return array
    //markers["a" + pageId.replace(/-/g, "") + "marker"] = marker;
    return(marker);
  };
  









  
  



































  
  





































  
  



































  
  






































(function () {

  //Function that runs on start up
  ssc.init = function () {};

  //Utility functions
  ssc.utils = {};

  //Map Functions
  ssc.maps = {};

  //LEP functions
  ssc.lep = {};

  ssc.utils.analytics = {};
  ssc.utils.analytics.homePageReportIt = function () {

    $('.utility-group .apply-for-it p a').each(function () {

      $(this).click(function (e) {
        //_gaq.push(['_trackEvent', 'home-apply-it-links', 'click', 'apply it jobs']);

        //console.log('HOME PAGE REPORT IT LINK INFO');
        //console.log(e);

      });
    });

  };

  ssc.lep.getZoneCategoryName = function (zoneId) {
    var strReturn;
    var test = zoneId.replace(/[\n\r]/g, '');
    switch (test) {

    case 'RE':
      strReturn = 'Recreation';
      break;
    case 'R':
      strReturn = 'Residential';
      break;
    case 'B':
      strReturn = 'Business';
      break;
    case 'IN':
      strReturn = 'Industrial';
      break;
    case 'SP':
      strReturn = 'Special purpose';
      break;
    case 'W':
      strReturn = 'Waterways';
      break;

    }

    return (strReturn);

  };

  //===DATE FUNCTIONS
  //===NOTE! All date functions will expect the date to passed in Australian date format (dd/mm/yyyy)

  ssc.utils.dates = {

    //Convert Australian date format (dd/mm/yyyy) to JavaScript date string (yyyy/mm/dd)
    auToJS : function (auDate) {

      var arrDate = auDate.split('/');
      jsDate = arrDate[2] + '/' + arrDate[1] + '/' + arrDate[0];

      return (jsDate);

    },

    //Check if a date has passed
    checkDatePassed : function (dateToCheck) {

      //Convert date provided to JS date formate using auToJS()
      dateToCheck = ssc.utils.dates.auToJS(dateToCheck);

      //Create date objects for today, and date provided
      var testDate = new Date(dateToCheck);
      var today = new Date();
      today.setHours(0);
      today.setMinutes(0);
      today.setSeconds(0);
      today.setMilliseconds(0);

      //Create return value variable, and set False as default
      var datePassed = false;

      //If todays date is later than the date provided then the date hasn't passed
      //so return true
      if (today > testDate) {

        datePassed = true;

      }

      return (datePassed);

    }

  }

  ssc.utils.currentProjectsRemoveDuplicates = function () {

    //Text of the top item link
    var topItem = $(".current-projects-home h3 a").text();

    $(".current-projects-home .links-home-container .list-links-home li a").each(function () {

      //console.log(topItem + " vs " + $(this).text());

      if (topItem == $(this).text()) {

        $(this).parent().remove();

      }

    });
  };

  ssc.utils.publicConsultationsRemoveDuplicates = function () {

    //Text of the top item link
    var topItem = $(".consultations-home h3 a").text();

    $(".consultations-home .links-home-container .list-links-home li a").each(function () {

      //console.log(topItem + " vs " + $(this).text());

      if (topItem == $(this).text()) {

        $(this).parent().remove();

      }

    });
  };

  ssc.utils.addAlternatingLi = function (ulRef) {
    var alt = "false";

    ulRef.each(function () {

      if (alt == "true") {
        $(this).attr('class', 'alternate');
        alt = "false";
      } else {
        alt = "true";
      }

    });
  };

  ssc.utils.addHoverPopUp = function (hoverLink, hoverContent) {

    //half the height of floating element
    var a = hoverContent.width() / 2,
    //Half the width of floating element
    b = hoverContent.height() / 2,
    //half the height of floating element as a negative
    x = a - (a * 2),
    //Half the width of floating element as a negative
    y = b - (b * 2);

    var tempDivTop = y;
    var tempDivLeft = x;

    hoverContent.css('display', 'none');

    hoverLink.mouseover(function () {

      hoverLink.css('position', 'relative');
      hoverContent.css('top', '12px');
      hoverContent.css('left', tempDivLeft);
      hoverContent.css('display', 'block');
      hoverContent.css('position', 'absolute');
      hoverContent.css('z-index', '100');
      hoverContent.css('border', '1px solid #2a2a2a');

    });

    hoverLink.mouseout(function () {

      hoverContent.css('display', 'none');

    });

  };

  //======= Start loadMap()

  /**
   *  Populates a google map from an rss feed of locations. Returns an array of map marker refrences.
   */
  ssc.maps.loadMap = function (rssUrl, mapContainer, args) {

    
    var mapProp, //Properties for map object
    map, //Map object

    //Map container dimensions from container element
    containerWidth = mapContainer.style.width,
    containerHeight = mapContainer.style.height,

    //Large and small sizes for resizable map
    defaultLargeWidth = parseInt(mapContainer.style.width) * 2,
    defaultLargeHeight = parseInt(mapContainer.style.height) * 2,
    smallMapSize = {
      height : containerHeight,
      width : containerWidth
    },

    //Optional arguments
    mapLat,
    mapLng,
    arrMarkers,
    x,
    y,
    expandButton,
    contractButton,
    largeMapSize,

    //Default values for optional arguments
    defaultArgs = {
      largeMapSize : {
        height : defaultLargeHeight + 'px',
        width : defaultLargeWidth + 'px'
      },
      mapLat : -34.08346933637405,
      mapLng : 151.02527617884334
    };

    /**
     *Check optional arguments and use defaults where required
     */

    //Was the large map size provided
    if (typeof args.largeMapSize === 'undefined') {

      largeMapSize = defaultArgs.largeMapSize

    } else {

      largeMapSize = args.largeMapSize
    }

    //Were there marker locations provided
    if (typeof args.arrMarkers === 'undefined') {

      arrMarkers = [];

    } else {

      arrMarkers = args.arrMarkers;

    }

    //Were the center coordinates for the map provided
    if (typeof args.mapLat === 'undefined' || typeof args.mapLng === 'undefined') {

      mapLat = defaultArgs.mapLat;
      mapLng = defaultArgs.mapLng;

    } else {

      mapLat = args.mapLat;
      mapLng = args.mapLng;

    }

    //Was an 'Expand' button targeted
    if (typeof args.expandButton !== 'undefined') {

      //console.log('expand button has been provided');

      expandButton = args.expandButton;

      //console.log($(expandButton));

      $(expandButton).click(function (e) {
        changeMapSize('expand')
      });

    } else {

      //console.log('expand button has NOT been provided');


    }

    if (typeof args.contractButton !== 'undefined') {

      contractButton = args.contractButton;

      $(contractButton).click(function (e) {
        changeMapSize('contract')
      });

    }

    //Properties for the map
    mapProp = {
      center : new google.maps.LatLng(mapLat, mapLng),
      zoom : 11,
      mapTypeId : google.maps.MapTypeId.ROADMAP
    };

    //Create the map
    var map = new google.maps.Map(mapContainer, mapProp);

    //Array to hold the markers
    var markers = {};

    //Info window to be used by all markers
    var infowindow = new google.maps.InfoWindow({});

    //Create an infobox (this replaces the standard infoWindow
    var ib = new InfoBox();

    //Create div to contain the infoBox
    var boxText = document.createElement("div");

    //boxText.style.cssText = "";
    boxText.className = 'infoBoxContent';

    if (rssUrl !== '') {
      //Open local RSS feed of map locations for markers

      jQuery.get(rssUrl, {}, function (data) {

        //Loop through every location and create map marker
        jQuery(data).find("Row").each(function () {

          //Get values from RSS feed and parse latlong
          var windowText = $(this).find('Marker_Text').text(),
            mapStyleType = $(this).find('map_style').text(),
              
            waterQualityScore = $(this).find('water_quality_score').text(),
            pageName = $(this).find('page_name').text(),
            imgInfoWindow = $(this).find("image").text(),
            urlInfoWindow = $(this).find("marker_link").text(),
            worksType = $(this).find("Works_Type").text(),
            pageId = $(this).find("pageId").text(),
            latlng = new google.maps.LatLng(parseFloat($(this).find("lat").text()), parseFloat($(this).find("long").text())),
              
              
              
            marker, pinColor;
            //console.log("Page Name: " + pageName);

          if (worksType === "General major works project") {

            pinColor = "FE7569";
            innerHTML = '<div class="google-popup ' + mapStyleType + '-map"><a href="' + urlInfoWindow + '"><span class="map-popup-title">' + pageName + '</span>' + imgInfoWindow + '</a></div>';
          
          }else if (worksType === "waterquality") {
          
            pinColor = "6aade4";            
            innerHTML = '<div class="infoBoxContent"><div class="google-popup waterquality-map"><a href="' + urlInfoWindow  + '"><span class="map-popup-title">' + pageName + '</span>' + imgInfoWindow + '<span class="map-body-large">A+</span><span class="map-body-small">Average score</span></a></div></div>';
            
          } else {

            pinColor = "fdc82f";
            innerHTML = '<div class="google-popup ' + mapStyleType + '-map"><a href="' + urlInfoWindow + '"><span class="map-popup-title">' + pageName + '</span>' + imgInfoWindow + '</a></div>';

          }

          var pinImage = new google.maps.MarkerImage("http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|" + pinColor,
              new google.maps.Size(21, 34),
              new google.maps.Point(0, 0),
              new google.maps.Point(10, 34));

          var pinShadow = new google.maps.MarkerImage("http://chart.apis.google.com/chart?chst=d_map_pin_shadow",
              new google.maps.Size(40, 37),
              new google.maps.Point(0, 0),
              new google.maps.Point(12, 35));

          marker = new google.maps.Marker({
              position : latlng,
              map : map,
              icon : pinImage,
              shadow : pinShadow
            });

          marker.infobox = ib;

          //Create div to contain the infoBox
          //var boxText = document.createElement("div");
          //boxText.style.cssText = "";
          //boxText.className = 'infoBoxContent';

          var myOptions = {
            content : boxText,
            disableAutoPan : false,
            maxWidth : 0,
            pixelOffset : new google.maps.Size(-183, 0),
            zIndex : null,
            boxStyle : {},
            closeBoxMargin : "-1px 1px 2px 2px",
            closeBoxURL : "http://www.sutherlandshire.nsw.gov.au/files/9/266/map-close-cross.gif",
            infoBoxClearance : new google.maps.Size(1, 1),
            isHidden : false,
            pane : "floatPane",
            enableEventPropagation : false
          };

          google.maps.event.addListener(map, 'click', function () {

            ib.close();

          });

          //When a marker is clicked update the window info and open
          google.maps.event.addListener(marker, 'click', function () {

            //infowindow.setContent('<span style="float:left;padding-right:5px;">' + imgInfoWindow + '</span><h4>' + urlInfoWindow + '</h4><p>' + windowText + '</p>');
            //infowindow.open(map,marker);
            ib.close();

                      if (worksType === "General major works project") {

            pinColor = "FE7569";
            boxText.innerHTML = '<div class="google-popup ' + mapStyleType + '-map"><a href="' + urlInfoWindow + '"><span class="map-popup-title">' + pageName + '</span>' + imgInfoWindow + '</a></div>';
          
   }else if (worksType === "waterquality") {
          
    //Build the class name for the average score display area
    //var waterScore = "aplus";         
    var m = waterQualityScore.split(" ");
    
    //waterScore = waterScore.replace(/\s+/g, '');
    var n = m[1].replace('plus', '+');
    //waterScore = waterScore.replace('-','minus');
    //waterScore.replace(n[0],'');
    //waterScore = waterScore.toLowerCase();
    
  //$('#averageScore').attr('class',scoreString);

            
            
            pinColor = "6aade4";            
            boxText.innerHTML = '<div class="infoBoxContent"><div class="google-popup waterquality-map"><a href="' + urlInfoWindow  + '"><span class="map-popup-title">' + pageName + '</span>' + imgInfoWindow + '<span class="map-body-large">' + n + '</span><span class="map-body-small">Average score</span></a></div></div>';
            
          } else {

            pinColor = "fdc82f";
            boxText.innerHTML = '<div class="google-popup ' + mapStyleType + '-map"><a href="' + urlInfoWindow + '"><span class="map-popup-title">' + pageName + '</span>' + imgInfoWindow + '</a></div>';

          }


            
            
            
            //boxText.innerHTML = innerHTML;

            ib.setOptions(myOptions);
            ib.open(map, marker);

          });

          //Add marker to return array
          markers["a" + pageId.replace(/-/g, "") + "marker"] = marker;

        });

      });

    } else {
      //alert('EMPTY!');
    }

    //Add optional array of markers to map
    //the functionality to add markers to the map should be moved to ssc.maps.addMarkers.
    //This could then be used to add arrays, jss or xml maker sets to the map

    /**
    for(x=0, y=arrMarkers.length; x < y; x++){

    var windowText = arrMarkers[x]['Marker_Text'],
    imgInfoWindow = arrMarkers[x]["image"],
    urlInfoWindow = arrMarkers[x]["marker_link"],
    pageId = arrMarkers[x]["pageId"],
    latlng = new google.maps.LatLng(parseFloat(arrMarkers[x]["lat"]),parseFloat(arrMarkers[x]["long"])),
    marker = new google.maps.Marker({position: latlng, map: map});
    marker.infoWindow = infowindow;

    //When a marker is clicked update the window info and open
    google.maps.event.addListener(marker, 'click', function() {

    infowindow.setContent('<span style="float:left;padding-right:5px;">' + imgInfoWindow + '</span><h4>' + urlInfoWindow + '</h4><p>' + windowText + '</p>');
    infowindow.open(map,marker);

    });

    markers["a" + pageId.replace(/-/g,"") + "marker"] = marker;

    }
     */

    //Click handler for optional resizing buttons

    var changeMapSize = function (direction) {

      var newMapSize;

      if (direction === 'expand') {

        newMapSize = largeMapSize;

        //Hide the expand button
        $("#expandButton").hide();

        //Show the contract button
        $("#contractButton").show();

      } else {

        newMapSize = smallMapSize;

        //Hide the contract button
        $("#contractButton").hide();

        //Show the expand button
        $("#expandButton").show();

      }

      //Start timer to continually update the size of the google map to match its parent
      timerMap = setInterval(updateMap, 500);

      //Animate google map parent div to new size
      $(this.mapProperties.mapContainer).animate(newMapSize, 500, "linear", function () {

        //Stop timer resizing google map
        timerMap = clearInterval(timerMap);

        map.setCenter(new google.maps.LatLng(mapLat, mapLng));

      });

    };

    //Resize google map to the size of its parent
    function updateMap() {

      google.maps.event.trigger(map, 'resize');

    }

    return (markers);

  };

})();

