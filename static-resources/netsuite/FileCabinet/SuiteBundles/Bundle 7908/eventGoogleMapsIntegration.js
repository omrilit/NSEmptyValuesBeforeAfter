/**
 * Copyright NetSuite, Inc. 2010 All rights reserved.
 *
 * Events maps integration script that displays the locations of today's appointments (calendar events)
 * on a map in a portlet on the dashboard. Provided for demonstration purposes only.
 * This implementation uses maps.google.com. Please read Google Maps API license first before proceeding
 * to actual implementation in production environment.
 *
 * Version	Date        Author          Remarks
 * 1.00		3 Feb 2010	August Li	    Initial version
 * 1.01     9 Feb 2010  August Li       Minor code refactoring, no change in functionality
 * 1.02    24 Feb 2010  August Li       Bug fix
 * 1.03    15 Mar 2010  August Li       Add checking for unpopulated latitude upon save on edit
 *                                      to handle failed geo coding
 * 2.00     9 Jul 2010  August Li       Updated for Google Maps v3
 * 2.10    22 Nov 2010  August Li       Recursion error fix
 * 3.00    30 Mar 2011  August Li       Fix multiple tab error
 * 3.10     8 Dec 2012  Jay Bucoy      Google Maps API links and NetSuite link fix
 */

{
    var PORTLET_TITLE = "Today's Appointments";

    //google map
    var URL_GOOGLE_MAP = '//maps.google.com';
    var URL_GOOGLE_MAP_SCRIPT  = URL_GOOGLE_MAP+'/maps/api/js?v=3&sensor=false';
    var URL_GOOGLE_MAP_GEOCODE = "http://maps.googleapis.com/maps/api/geocode/json?sensor=false&address=";
    var ICON_SHADOW_GOOGLE     = URL_GOOGLE_MAP+'/mapfiles/ms/micons/msmarker.shadow.png';
    var ICON_SINGLE_GOOGLE     = URL_GOOGLE_MAP+'/mapfiles/ms/micons/blue.png';
    var ICON_MULTIPLE_GOOGLE   = URL_GOOGLE_MAP+'/mapfiles/ms/micons/blue-dot.png';

    var URL_NETSUITE = 'https://system.netsuite.com';
    var ICON_CLOSE   = URL_NETSUITE+'/images/forms/hide.gif';

    //internal ids
    var REC_EVENT = 'calendarevent';
    var EVENT_SEARCH = 'customsearch_appointments'; //the order in the search is important
    var CUSTOM_SCRIPT = 'customscript_googlemaps_suitelet';
    var CUSTOM_DEPLOY = 'customdeploy_googlemaps_suitelet';

    var SUITELET = 'SUITELET';
    var RECORD = 'RECORD';
    var SCRIPT = 'SCRIPT';

    //fields for calendarevent and customer
    var FLD_TITLE = 'title';
    var FLD_STATUS = 'status';
    var FLD_START_TIME = 'starttime';
    var FLD_END_TIME = 'endtime';
    var FLD_MESSAGE = 'message';
    var FLD_LOCATION = 'location';
    var FLD_ORGANIZER = 'organizer';
    var FLD_COMPANY = 'company';
    var FLD_ADDR1 = 'billaddress1';
    var FLD_ADDR2 = 'billaddress2';
    var FLD_ADDR3 = 'billaddress3';
    var FLD_CITY = 'billcity';
    var FLD_STATE = 'billstate';
    var FLD_ZIP = 'billzipcode';
    var FLD_CUSTOMER = 'customer';

    //custom fields in calendarevent record
    var FLD_ADDRESS = 'custevent_address';
    var FLD_LATITUDE = 'custevent_latitude';
    var FLD_LONGITUDE = 'custevent_longitude';
    var FLD_GEOCODE = 'custevent_geocode';
}

/**
 * Escape strings for JSON format
 * , { } [ ] " '
 * @param {String} text Text to escape.
 * @return {String} Escaped string
 */
function jsEscape(text) {
    if (text) {
        text = text.replace(/'/g, "&apos;");
        text = text.replace(/"/g, "&quot;");
        text = text.replace(/\{/g, "&#123;");
        text = text.replace(/\}/g, "&#125;");
        text = text.replace(/\[/g, "&#91;");
        text = text.replace(/\]/g, "&#93;");
        text = text.replace(/\,/g, "&#44;");
        text = text.replace(/\n/g, "<br/>");
        text = text.replace(/\r/g, "<br/>");
        text = text.replace(/\\/g, "\\\\");
    }
    return text;
}

/**
 * Get today's events and return a JSON array
 */
function getEvents() {
    var unmappedCount = 0;
    var htmlUnmapped = "";
    var jsonEvents = "";
    var results = nlapiSearchRecord(REC_EVENT, EVENT_SEARCH, null, null);
    if (results) {
        var lastPoint = null;
        var itemArray = '';
        for (var i = 0; i < results.length; i++) {
            var isUnmapped = true;
            var title = results[i].getValue(FLD_TITLE);
            var status = results[i].getText(FLD_STATUS);
            var startTime = results[i].getValue(FLD_START_TIME).replace(/ /g,'');
            var endTime = results[i].getValue(FLD_END_TIME).replace(/ /g,'');
            var addr = results[i].getValue(FLD_ADDRESS);
            //if address is populated
            if (addr) {
                addr = removeCRLF(addr);
                var latitude = results[i].getValue(FLD_LATITUDE);
                var longitude = results[i].getValue(FLD_LONGITUDE);
                var message = results[i].getValue(FLD_MESSAGE);
                var organizer = results[i].getText(FLD_ORGANIZER);
                var company = results[i].getText(FLD_COMPANY);
                var location = results[i].getValue(FLD_LOCATION);
                var tabLabel = startTime;
                var link = nlapiResolveURL(RECORD,REC_EVENT, results[i].getId());
                //check if geo code is available in record
                if (latitude && longitude) {
                    isUnmapped = false;
                    //encode record info in json format, one record is one object
                    var item = '{ address : "' + addr + '", ' +
                               '  content : "<span class=content><b><a target=_top href=\\\"'+link+'\\\">' + jsEscape(title) + '</a></b> (' +
                               jsEscape(status) + ')<br/>';
                    if (company) {
                        item += jsEscape(company) + '<br/>';
                    }
                    item += '<i>' + jsEscape(addr) + '</i><br/>';
                    if (location) {
                        item += jsEscape(location) + '<br/>';
                    }
                    item += startTime + '-' + endTime + ', Organizer: ' + jsEscape(organizer) + '<br/>';
                    item += '</span>",' +
                            '  message : "' + ((message) ? ('<span class=content>' + jsEscape(message) + '</span>') : '') + '",' +
                            '  title : "'+jsEscape(title)+'",'+
                            '  longitude : '+longitude+','+
                            '  latitude : '+latitude+','+
                            '  tabLabel : "'+tabLabel+'" }';
                    //routine to group together records with same latitude & longitude
                    //  into one array of item objects
                    if (lastPoint!=null && lastPoint!=latitude+","+longitude) {
                        jsonEvents += '[' + itemArray.substring(0,itemArray.length-1) + '],';
                        itemArray = '';
                    }
                    itemArray += item + ',';

                    lastPoint = latitude + "," + longitude;
                }
            }//if addr
            if (isUnmapped) {
                htmlUnmapped += '<li>'+startTime+' to '+endTime+' '+title+' ('+status+')</li>';
                unmappedCount++;
            }
            if (i == results.length-1 && itemArray.length > 0) { //add last one
                jsonEvents += '[' + itemArray.substring(0,itemArray.length-1) + '],';
            }
        } //results loop
        if (jsonEvents.length > 0) {
            jsonEvents = '[' + jsonEvents.substring(0, jsonEvents.length - 1) + ']';
        }
    }//if results
    return {
        mapped : jsonEvents, unmapped : htmlUnmapped, unmappedCount : unmappedCount
    };
}

/**
 * Suitelet to generate inline html calling Google maps.
 *
 * @param {Object} request
 * @param {Object} response
 */
function eventGoogleMapsSuitelet(request, response) {
    var eventsToday = getEvents();
    var html=[ '<html><head>',
               '<meta http-equiv="content-type" content="text/html; charset=utf-8"/>',
               '<title>Events Map Integration</title>',
               '<style type="text/css">',
                  '.content { font-size:8pt; font-family: arial, helvetica; }',
                 '</style>' ];
    if (eventsToday.mapped.length > 0) {
        var showTraffic = false;
        var showMapTypeControl = true;
        html = html.concat([
               '<style type="text/css">',
                 '#map          { width: 100%; height: 100%; border: 0px; padding: 0px; position: absolute; }',
                 '.content_odd  { background-color: #E8E8E8; font-size:8pt; font-family: arial, helvetica; padding:5px}',
                 '.content_even { font-size:8pt; font-family: arial, helvetica; padding:5px }',
                 '.tabs_off     { background-color:#E8E8E8; font-family: arial, helvetica; font-size:8pt; float: left; display: inline; ',
                                 'border: 0px; cursor: pointer; color: #505050; padding: 3px; margin-right:2px; }',
                 '.tabs_on      { background-color:red; color: white; border:0px; font-family: arial, helvetica; font-size:8pt; float: left; display: inline; ',
                                 'margin-right:2px; padding: 3px; }',
                 '.tabs_line    { font-family: arial, helvetica; font-size:8pt; border-top-width: 1px; border-left-width: 0px;border-right-width: 0px; border-bottom-width: 0px; ',
                                 'border-top-style: solid; border-left-style: none; border-right-style:none; border-bottom-style: none; ',
                                 'border-top-color: #A0A0A0; border-left-color: #A0A0A0; border-right-color: #A0A0A0; border-bottom-color: #A0A0A0; padding: 3px; }',
                 '.moreDetails  { background-color:#707070; font-family: arial, helvetica; font-size:8pt; float: right; display: inline; ',
                                 'border: 0px; cursor: pointer; color:white; padding: 3px; margin-right:15px; }',
               '</style>',
               '<script src="',URL_GOOGLE_MAP_SCRIPT,'" type="text/javascript"></script>',
               '<script type="text/javascript">',
               'function toggle(id) {',
                 'var el = document.getElementById(id);',
                   'if (el) {',
                     'el.style.display = (el.style.display=="none") ? "" : "none";',
                   '}',
               '}',
               'function moreDetails(id, content) {',
                 'return "<div class=moreDetails onclick=\\\"toggle("+id+");\\\">Details</div><div id="+id+" style=\\\"display:none\\\">"+content+"</div>";',
               '}',
               'var Tabs = {',
                 'list: {},',
                 //tabset_9   tab_9_9  data_tab_9_9
                 'cssOn : "tabs_on",',
                 'cssOff: "tabs_off",',
                 'setCss: function(id, cssClass) {',
                   'var data = document.getElementById(id);',
                      'if (data) {',
                     'data.style.display = cssClass;',
                   '}',
                 '},', //setCss
                 'setup: function(tabsContainer) {',
                   'var tabs = document.getElementById(tabsContainer).getElementsByTagName("div");',
                   'var first = true;',
                   'for (var x in tabs) {',
                      'if (tabs[x].id!=undefined && tabs[x].id.indexOf("tab_")==0) {',
                       'this.list[tabs[x].id] = tabsContainer;',
                       'first = false;',
                     '}',
                   '}', //for
                 '},', //setup
                 'onClick: function(element) {',
                   'var container = this.list[element.id];',
                   'if (container!=null) {',
                     'var tabs = document.getElementById(container).getElementsByTagName("div");',
                     'for (var x in tabs) {',
                        'if (tabs[x].id!=undefined && tabs[x].id.indexOf("tab_")==0) {',
                          'if (tabs[x]==element) {',
                            'tabs[x].className = this.cssOn;',
                            'this.setCss("data_"+tabs[x].id,"");',
                          '} else if (tabs[x].className==this.cssOn) {',
                                'tabs[x].className = this.cssOff;',
                                'this.setCss("data_"+tabs[x].id,"none");',
                          '}',
                       '}',
                     '}', //for
                   '}',
                 '}', //onClick
               '};', //Tabs
               'var nsEvents = ',eventsToday.mapped,';',
               'var iconSimple = new google.maps.MarkerImage("'+ICON_SINGLE_GOOGLE+'", new google.maps.Size(32,32), new google.maps.Point(0,0),new google.maps.Point(16,32));',
               'var iconMultiple = new google.maps.MarkerImage("'+ICON_MULTIPLE_GOOGLE+'", new google.maps.Size(32,32), new google.maps.Point(0,0),new google.maps.Point(16,32));',
               'var iconShadow = new google.maps.MarkerImage("'+ICON_SHADOW_GOOGLE+'", new google.maps.Size(56,32), new google.maps.Point(0,0), new google.maps.Point(16,32));',
               'var center = null;',
               'var map = null;' ,
               'var currentPopup, infoPopup;',
               'var markerList = {};',
               'var bounds = new google.maps.LatLngBounds();',
               'function hideMore() {',
                 'infoPopup.close();',
                 'infoPopup=null;',
                 'map.panTo(center);',
               '}',
               'function showMore(id) {',
                 'var m = markerList[id];',
                 'if (currentPopup!=null) { currentPopup.close(); currentPopup=null; }',
                 'infoPopup = new google.maps.InfoWindow({ content: m._maxContent, maxWidth: 500 });',
                 'infoPopup.open(map, m);',
                 'google.maps.event.addListener(infoPopup,"closeclick", hideMore);',
               '}',
               'function formatContent(tabs, content, index) {',
                 'var html = null;',
                 'if (tabs==null) {',
                   'html = "<div style=\\\"float: left; display:inline; width:430px; height:100%; overflow:auto;\\\">"+content+"</div>',
                            '<div align=center valign=top style=\\\"width:15px; float: right; display:inline;\\\">',
                            '&nbsp;</div>";',
                 '} else {',
                   'html = "<table width=350 cellpadding=0 cellspacing=0 border=0>',
                           '<tr><td valign=bottom>"+tabs+"</td></tr>',
                           '<tr><td valign=top class=tabs_line>"+content+"</td></tr></table>";',
                 '}',
                 'return html;',
               '}',
               'function addMarker(items, index){ ' ,
                 'var pt = new google.maps.LatLng(items[0].latitude, items[0].longitude);',
                 'bounds.extend(pt);',
                 'var tabs = "";',
                 'var content = "";',
                 'var maxContent = "";',
                 'var label = "";',
                 'if (items.length==1) {',
                   'tabs = "<div class=tabs_on>"+items[0].tabLabel+"</div>";',
                   'content = items[0].content;',
                   'label = items[0].title;',
                   'maxContent = formatContent(null, items[0].content + items[0].message, null);',
                 '} else {',
                   'for(var i=0; i<items.length; i++) {',
                     'label += ((i==0)?"":" | ")+items[i].title;',
                     'tabs += "<div class="+((i==0)?"tabs_on":"tabs_off")+" id=tab_"+index+"_"+i+" onclick=\\\"Tabs.onClick(this);\\\">" + items[i].tabLabel + "</div>";',
                     'content += "<div id=data_tab_"+index+"_"+i+" "+((i==0)?"":"style=\\\"display:none\\\"")+">"+items[i].content+"</div>";',
                     'maxContent += "<p class="+ ((i%2==0)?"content_even":"content_odd") +">"+ items[i].content + items[i].message + "</p>";',
                   '}',
                   'tabs = "<div id=tabset_"+index+">"+tabs+"</div>";',
                   'maxContent = formatContent(null, maxContent, null);',
                 '}',
                 'tabs += "<div class=moreDetails onclick=\\\"showMore("+index+");\\\">More</div>";',
                 'var info = formatContent(tabs, content, index);',
                 'var marker = new google.maps.Marker({ position: pt, title: label, icon : ((items.length>1)?iconMultiple:iconSimple), shadow: iconShadow, map: map} );',
                 'marker._maxContent=maxContent;', //custom property
                 'markerList[index]=marker;',
                 'var popup = new google.maps.InfoWindow({ content: info, maxWidth: 500 });',
                 'google.maps.event.addListener(marker, "click", function() {',
                   'if (infoPopup!=null) { infoPopup.close(); infoPopup=null; }',
                   'if (currentPopup!=null) { currentPopup.close(); currentPopup=null; }',
                   'popup.open(map, marker);',
                   'currentPopup = popup;',
                   'if (items.length>1) {',
                     'Tabs.setup("tabset_"+index);',
                   '}',
                 '});' ,
                 'google.maps.event.addListener(popup,"closeclick",function(){',
                   'map.panTo(center);',
                   'currentPopup=null;',
                 '});',
               '}',
               'function initMap() {',
                   'map = new google.maps.Map(document.getElementById("map"), { ',
                       'center: new google.maps.LatLng(0,0),',
                       'zoom: 14,',
                       'mapTypeId: google.maps.MapTypeId.ROADMAP,',
                       'mapTypeControl: ',showMapTypeControl,',',
                       'mapTypeControlOptions: {style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR },',
                       'navigationControl: true,',
                       'navigationControlOptions: {style: google.maps.NavigationControlStyle.ZOOM_PAN }',
                   '});',
                   'for(var i=0; i<nsEvents.length; i++){',
                       'addMarker(nsEvents[i],i);',
                   '}',
                   'var trafficLayer = new google.maps.TrafficLayer();',
                   'trafficLayer.setMap(map);',
                   'center = bounds.getCenter();',
                   'if (nsEvents.length>1) {',
                       'map.fitBounds(bounds);',
                  //     'map.setZoom(map.getZoom-1);', //recursion error fix, comment out this line
                   '} else {',
                       'map.setCenter(center);',
                       'map.setZoom(14);',
                   '}',
               '}',  //func
               '</script>',
               '</head>',
               '<body onload="initMap()" style="margin:0px; border:0px; padding:0px;">',
               '<div id="map"></div>']);
    } else if (eventsToday.unmappedCount > 0){
        html.push('<span class=content>' + eventsToday.unmappedCount + ' event(s) found, but all without map data.<ul>'+eventsToday.unmapped+'</ul></span>');
    } else {
        html.push('<span class=content>No event(s) found.</span>');
    }
    html.push('</body></html>');
    response.writeLine(html.join(''));
}

/**
 * Remove line feed and carriage return.
 *
 * @param text
 * @return text
 */
function removeCRLF(text) {
    return (text==null) ? text : text.replace(/\r\n/g,' ').replace(/\r/g,' ').replace(/\n/g,' ');
}


function requestGeocode(url, param, isJSON) {
    var url = url + param.replace(/ /g, '+');
    var res = nlapiRequestURL(url, null, null, null);
    if (res.getCode() == 200) {
        var body = res.getBody();
        if (isJSON) {
            var result = eval('(' + body + ')');
            if (result) {
                return result;
            }
        } else {
            return body;
        }
    } else {
        alert(res.getCode());
    }
    return null;
}

function trim(text) {
    if (!text) return '';
    var i=0;
    while(i<text.length && text.charAt(i)==' ') {
        i++;
    }
    var j=text.length;
    while (j>0 && text.charAt(j)==' ') {
        j--;
    }
    return text.substring(i,j);
}

function geocodeGoogle(address) {
    var res = requestGeocode(URL_GOOGLE_MAP_GEOCODE, removeCRLF(address),true);
        if (res && res.status == "OK") { //check call status
            return {
                error: null,
                latitude: res.results[0].geometry.location.lat,
                longitude: res.results[0].geometry.location.lng
            };
        }
    return { error: 'Error code='+res.error };
}

/**
 * Copy company address over
 *
 * @param {Object} idCompany
 */
function copyCompanyAddress(idCompany){
    if (!nlapiGetFieldValue(FLD_ADDRESS)) {
        var addr = '';
        var flds = [FLD_ADDR1, FLD_ADDR2, FLD_ADDR3, FLD_CITY, FLD_STATE, FLD_ZIP];
        var res = nlapiLookupField(FLD_CUSTOMER, idCompany, flds);
        if (res) {
            for (var i = 0; i < flds.length; i++) {
                if (res[flds[i]]) {
                    addr += res[flds[i]] + '\n';
                }
            }
            nlapiSetFieldValue(FLD_ADDRESS, addr);
        }
    }
}

/**
 * Do a lookup if the address already exists in the events and get the geocode.
 * @param address
 * @return
 */
function lookupPreviousAddress(address) {
    var results = nlapiSearchRecord(REC_EVENT, null,
                [ new nlobjSearchFilter(FLD_ADDRESS,null,'is',trim(address)),
                  new nlobjSearchFilter(FLD_LATITUDE,null,'isnotempty',null) ],
                [ new nlobjSearchColumn(FLD_LATITUDE,null,null),
                  new nlobjSearchColumn(FLD_LONGITUDE,null,null) ]);
    if (results) {
        var lat = results[0].getValue(FLD_LATITUDE);
        var lon = results[0].getValue(FLD_LONGITUDE);
        if (lat && lon) {
            return {
                error : null,
                latitude: lat,
                longitude: lon
            };
        }
    }
    return { error : 'No similar address found.'};
}

/**
 * Update event record
 *
 * @param {Object} geocode containing latitude, longitude, error
 */
function updateEventLonLat(geocode) {
    if (!geocode.error) {
        //success
        nlapiSetFieldValue(FLD_LATITUDE, geocode.latitude);
        nlapiSetFieldValue(FLD_LONGITUDE, geocode.longitude);
        return true;
    }
    else {
        //failed
        nlapiSetFieldValue(FLD_LATITUDE, '');
        nlapiSetFieldValue(FLD_LONGITUDE, '');
        //alert('Geocoding Failed: '+geocode.error);
        return false;
    }
}

/**
 * Page Init
 */
function eventGoogleMapsPageInit() {
    var idCompany = nlapiGetFieldValue(FLD_COMPANY);
    if (idCompany) {
        copyCompanyAddress(idCompany);
    }
}

/**
 * On change of company field, if address is empty, populate it with the billing address
 *
 * @param {Object} type
 * @param {Object} name
 */
function eventGoogleMapsFieldChanged(type, name) {
    if (name==FLD_COMPANY) {
        var idCompany = nlapiGetFieldValue(FLD_COMPANY);
        if (idCompany) {
            copyCompanyAddress(idCompany);
        }
    } else if (name==FLD_ADDRESS) {
        var address = nlapiGetFieldValue(FLD_ADDRESS);
        if (address) {
            //check for past similar address
            if (!updateEventLonLat(lookupPreviousAddress(address))) {
                if (!updateEventLonLat(geocodeGoogle(address))) {
                    alert('Unable to geocode the address.');
                }
            }
        } else {
            nlapiSetFieldValue(FLD_LATITUDE, '');
            nlapiSetFieldValue(FLD_LONGITUDE, '');
        }
    }
}

/**
 * Portlet that calls the suitelet that displays the map.
 *
 * @param {Object} portlet Portlet object
 * @param {Object} column Column object
 */
function eventGoogleMapsPortlet(portlet, column) {
    //resize based on available column space
    var height = column != 2 ? 225 : 350;
    portlet.setTitle(PORTLET_TITLE);
    var serverUrl = nlapiResolveURL(SUITELET, CUSTOM_SCRIPT, CUSTOM_DEPLOY);
    portlet.setHtml('<iframe src="'+serverUrl+'" width="100%" align="center"  height="'+(height+4)+'px" style="margin:0px; border:0px; padding:0px"></iframe>');
}