/**
 * Copyright © 2015, Oracle and/or its affiliates. All rights reserved.
 */

var Tax = Tax || {};

Tax.DataManagerStart = function DataManagerStart() {
	Tax.Processor.call(this);
	this.Name = 'DataManagerStart';
};
Tax.DataManagerStart.prototype = Object.create(Tax.Processor.prototype);


Tax.DataManagerStart.prototype.process = function process(result, filterParams) {
	// var cache =  new VAT.TaxCache().getCache();
	// var cacheId = cache.GetTaxCacheIdByName('supplementary_vcs' + nlapiGetContext().getUser());
	var cachedData = null;
	// if (cacheId) {
	// 	cachedData = cache.GetTaxCache(cacheId);
	// }
	
	return cachedData;
};

Tax.DataManagerEnd = function DataManagerEnd() {
	Tax.Processor.call(this);
	this.Name = 'DataManagerEnd';
};
Tax.DataManagerEnd.prototype = Object.create(Tax.Processor.prototype);

Tax.DataManagerEnd.prototype.process = function process(result, filterParams) {
 
	var cachedResult = Tax.Cache.MemoryCache.getInstance().load('Collector');
	var restructuredObject = {};
	var formattedObject = null;
	
	for (var i=0; i<cachedResult.length; i++) { //cachedResult = [{header = {}}, {table1 = [{}, {}, {}]}, {table2 = [{}, {}, {}]}]
		formattedObject = cachedResult[i]; // formattedObject = {adapterName = {}} or {adapterName = [{}, {}, {}]}
		
		for (var key in formattedObject) {
			var value = formattedObject[key];
			
			if (Array.isArray(value)) {
				// for tables result
				restructuredObject[key] = value;
			} else {
				for (var valueObjectKey in value) {
					restructuredObject[valueObjectKey] = value[valueObjectKey];
				}
			}
		}
	}
	
	//restructure cachedResult
	var processedResult = {};
	
//	jsUnity.log('cachedResult.length: ' + cachedResult.length);
	
	
	
	
//	var customRecordCache =  new Tax.Cache.CustomRecord();
//	customRecordCache.save(memoryCacheResult, params.filter);
	
//	return processedResult;
	
	//for testing
	return restructuredObject;
	
};

