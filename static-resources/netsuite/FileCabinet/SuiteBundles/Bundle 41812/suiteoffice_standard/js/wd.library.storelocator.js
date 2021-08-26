/***********************************************************
* Description:
*
* @author: Alfonso Terron
* @Email : aterron@netsuite.com
* @copyright (c) 2000-2012, NetSuite Inc.
* @version 1.0								@Date: 05/06/2014
*
************************************************************/
var storelocator = {
		/** Globals Vars **/
		map        : null,
		markers    : [],
		filterList : [],
		counter    : 0,
		distance   : function(){return jQuery("#select-distance").val();},
		origin     : null,
		radius     : null,
		center     : null,
		static_storeList : null,
		static_hashStores: null,
		hashDistances    : [],
		input_search     :  document.getElementById('input-search'),
		listContent      : function(){return jQuery('.store-list');},
		getDistanceMeters: function(){return (this.distance()*1609.344);},

		initialize :function(){

			var self = this;

			self.map = new google.maps.Map(document.getElementById('map-canvas'), {
						zoom: 5,
						center: new google.maps.LatLng(39.912811, -101.465781),
						animation: google.maps.Animation.DROP,
						mapTypeId: google.maps.MapTypeId.ROADMAP,
						mapTypeControl: false,
						panControl: false,
						zoomControl: false,
						scaleControl: false,
						streetViewControl: false,

				});

				this.input_search = document.getElementById('input-search');
				var input = this.input_search;
				var autocomplete = new google.maps.places.Autocomplete(input);
				autocomplete.bindTo('bounds', self.map);

				var infowindow = new google.maps.InfoWindow();
				var marker = new google.maps.Marker({
					map: self.map,
					anchorPoint: new google.maps.Point(0, -29)
				});

				google.maps.event.addListener(autocomplete, 'place_changed', function() {
					infowindow.close();
					marker.setVisible(false);
					var place = autocomplete.getPlace();
					if (!place.geometry) {
						return;
					}

					if (place.geometry.viewport) {
						self.map.fitBounds(place.geometry.viewport);
					} else {
						self.map.setCenter(place.geometry.location);
						self.map.setZoom(17);
					}
					marker.setIcon(({
						url: place.icon,
						size: new google.maps.Size(100, 100),
						origin: new google.maps.Point(0, 0),
						anchor: new google.maps.Point(17, 34),
						scaledSize: new google.maps.Size(35, 35)
					}));

					marker.setPosition(place.geometry.location);
					marker.setVisible(true);

					var address = '';
					if (place.address_components) {
						address = [
							(place.address_components[0] && place.address_components[0].short_name || ''),
							(place.address_components[1] && place.address_components[1].short_name || ''),
							(place.address_components[2] && place.address_components[2].short_name || '')
						].join(' ');
					}

					infowindow.setContent("<div><strong>You're here!</strong><br>" + address);
					infowindow.open(self.map, marker);

					//Show Stores
					self.origin = marker;
					self.processRadius();
				});
		},

		processRadius : function(){
			var self = this;

			if(!self.origin) return;

			self.autoCenter(self.origin);

			if(self.markers){
				for(var i=0;i<self.markers.length; i++)
					self.markers[i].setMap(null);
				self.markers = new Array();
			}

			self.marckRadius();
			self.map.setZoom(self.zoom());
			//Show Stores
			self.getHashStores();
		},

		intervalID  : 0,
		centerEvent : null,
		autoCenter  : function(marker){
			var self = this;

			//Stop Animate Current center.
			if(self.center && self.center != self.origin){
				self.center.setAnimation(null);
			}

			self.center = marker;

			self.map.panTo(self.center.getPosition());

			if(!self.centerEvent)
				self.centerEvent = google.maps.event.addListener(self.map,'center_changed',function() {
					window.clearInterval(self.intervalID);
					self.intervalID = window.setTimeout(function() { self.map.panTo(self.center.getPosition()); },2000);
				});
		},

		getHashStores : function(){

			var self = this;
			if(!this.static_hashStores){

				self.showMessage('loading-in');

				jQuery.ajax({
					url      : '/app/site/hosting/scriptlet.nl?script=customscript_wd_store_locator&deploy=customdeploy_wd_store_locator',
					data     : { 'action' : 'getHash' },
					async    : true,
					dataType : 'JSON',
					type     : 'POST',
					success  : function(data){
						if(!data.status_error.error){
							self.static_hashStores = data.results;
							self.filterByDistance();
						}
					}
				});
			}else
				self.filterByDistance();

		},

		filterByDistance : function(){

			var self  = this,
			hashList  = self.static_hashStores,
			hashDist  = self.hashDistances,
			radius    = self.distance(),
			distance  = 0;
			self.filterList = new Array();

			for( i in hashList ){
				var point = hashList[i].split('_');

				distance = self.distanceTo( {lat : point[0], lng : point[1]} );
				if( distance <= radius ){
					hashDist[i] = distance;
					self.filterList.push(i);
				}
			}
			self.processStores();
		},

		processStores : function(){
			var self = this;
			self.static_storeList = null;

			if(self.filterList.length){

				jQuery.ajax({
					url      : '/app/site/hosting/scriptlet.nl?script=customscript_wd_store_locator&deploy=customdeploy_wd_store_locator',
					data     : {
						'action' : 'getStores',
						'ids'    : 	JSON.stringify(self.filterList)
					},
					async    : true,
					dataType : 'JSON',
					type     : 'POST',
					success  : function(data){
						if(!data.status_error.error){
							self.static_storeList = data.results;
							self.processMaps();
						}
					}
				});

			}else
				self.processMaps();

		},

		processMaps : function(){
			var self   = this,
			storeList  = self.static_storeList,
			hashList   = self.static_hashStores,
			filterList = self.filterList,
			radius     = self.distance(),
			distance   = 0;

			if(self.origin && storeList){

				//** Set Attr Distance;
				for(i in storeList)
					storeList[i].distance = self.hashDistances[storeList[i].internalid];

				self.filterList = storeList;

				self.filterList.sort(function(a, b){ return a.distance > b.distance; });

			}

			self.publicResults();

		},

		distanceTo : function(point) {
				var self = this;
				var R = 6371; // mean radius of earth
				var location = self.origin.getPosition();
				var lat1 = self.toRad_(location.lat());
				var lon1 = self.toRad_(location.lng());
				var lat2 = self.toRad_(point.lat);
				var lon2 = self.toRad_(point.lng);
				var dLat = lat2 - lat1;
				var dLon = lon2 - lon1;

				var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
								Math.cos(lat1) * Math.cos(lat2) *
								Math.sin(dLon / 2) * Math.sin(dLon / 2);
				var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
				return R * c;
		},

		toRad_ : function(degrees) {
			return degrees * Math.PI / 180;
		},

		marckRadius : function(){
			var self = this;

			if(!self.radius){
				self.radius = new google.maps.Circle({
						map           : self.map,
						strokeWeight  : 2,
						strokeColor   : "#0000FF",
						fillColor     : "#0000FF",
						strokeOpacity : 0.1,
						fillOpacity   : 0.03
				});
			}
			self.radius.setCenter(self.origin.getPosition());
			self.radius.setRadius(self.getDistanceMeters());
		},

		publicResults : function(){

			var self = this;
			self.counter = 0;
			storelocator.listContent().empty();

			if(self.filterList && self.filterList.length > 0){

				var unitTime = Math.ceil(1500 / self.filterList.length);

				for (var i = 0; i < self.filterList.length; i++) {
					setTimeout(function() {
						var store = self.filterList[self.counter],
						position  = new google.maps.LatLng(store.custrecord_wd_locator_storelat, store.custrecord_wd_locator_storelong);
						new self.Marker().create(self.map, position, store);
					}, i * unitTime);
				}
			}else
				self.showMessage('empty');

		},

		showMessage : function(action){

			if(action == 'empty')
				this.listContent().append('<span><h3 class="popover-title">No resutls</h3></span>');

			if(action == 'loading-in')
				this.listContent().append('<div class="popover-title" style="text-align: right;"><img src="/site/suiteoffice/img/loader-48.gif"></div>');

		},

		zoom : function(){
			var self = this;
			switch(self.distance()){
				case "5"   : return 13;
				case "10"  : return 12;
				case "50"  : return 10;
				case "100" : return 9;
				default    : return 5;
			}
		},
		objInfoWin : null,
		removepop  : function(){
			var self = this;
			if(self.objInfoWin){
				self.objInfoWin.close();
			}
		}
};

storelocator.Marker = function(){

	this.contentString = function(){return jQuery("#storelocator-marker-cell").html();};

	this.getContent = function(obj){
		return jQuery().tmplStr(this.contentString(), obj);
	};

	this.create = function(map, position, obj_store ){
		var self = this,
		marker   = {
				map: map,
					draggable:false,
					animation: google.maps.Animation.DROP,
					position: position
		};

		if(obj_store.custrecord_wd_locator_storename)
			marker.title = obj_store.custrecord_wd_locator_storename;

		if(obj_store.custrecord_wd_locator_storeicon)
			marker.icon = obj_store.custrecord_wd_locator_storeicon.name;

		marker = new google.maps.Marker(marker);

		var cell = self.getContent(obj_store),
		infowindow = new google.maps.InfoWindow({content : cell});

		storelocator.listContent().append(jQuery(cell).attr('data-marker', storelocator.counter).click(function(){
			google.maps.event.trigger(storelocator.markers[jQuery(this).data('marker')], 'click');
		}));

		google.maps.event.addListener(marker,
										'click',
										function(){
											if (marker.getAnimation() != null)
												marker.setAnimation(null);
											else{
												map.setZoom(15);
												map.setCenter(marker.getPosition());
												marker.setAnimation(google.maps.Animation.BOUNCE);
												storelocator.removepop();
												storelocator.objInfoWin = infowindow;
												infowindow.open(map, marker);
												storelocator.autoCenter(marker);
											}
											});
		storelocator.markers.push(marker);
		storelocator.counter++;
	};
};
