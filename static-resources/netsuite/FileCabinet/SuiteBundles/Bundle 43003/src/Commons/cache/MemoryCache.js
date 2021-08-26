/**
 * Copyright © 2015, Oracle and/or its affiliates. All rights reserved.
 */
var Tax = Tax || {};
Tax.Cache = Tax.Cache || {};

Tax.Cache.MemoryCache = (function() {
	var instance;
	var cache = {};
	
	function createInstance() {
		return {
			save: function(key, value) {
				cache[key] = value;
			},
			load: function(key) {
				return cache[key];
			},
			append: function(key, value) {
				if (!cache[key]) {
					cache[key] = [];
				}
				cache[key].push(value);
			}
		};
	};
	
	return {
		getInstance: function() {
			if (!instance) {
				instance = createInstance();
			}
			return instance;
		}
	};
})();